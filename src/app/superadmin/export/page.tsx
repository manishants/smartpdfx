"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Image from "next/image";
import { getBlogs } from "@/app/actions/blog";

type BlogSummary = { slug: string; title: string; imageUrl?: string };

export default function SuperadminExportPage() {
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [format, setFormat] = useState<"json" | "csv">("json");
  // Comments export removed per request
  const [includeAssets, setIncludeAssets] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const all = await getBlogs();
        const summaries: BlogSummary[] = (all || []).map((p) => ({ slug: p.slug, title: p.title, imageUrl: p.imageUrl }));
        setPosts(summaries);
      } catch (e) {
        console.warn("Failed to load posts for export UI", e);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => posts.filter((p) => (search ? (p.title + " " + p.slug).toLowerCase().includes(search.toLowerCase()) : true)),
    [posts, search]
  );

  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const buildBlogsExportHref = () => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (selectedSlugs.length) params.set("slugs", selectedSlugs.join(","));
    return `/api/export/blogs?${params.toString()}`;
  };

  // Comments export removed; helper deleted

  const newsletterHref = (csv?: boolean) => `/api/export/newsletter?format=${csv ? "csv" : "json"}`;
  const pagesHref = `/api/export/pages`;
  const projectHref = `/api/export/project`;
  const projectZipHref = `/api/export/project?format=zip`;
  const buildBackupHref = () => {
    const params = new URLSearchParams();
    if (includeAssets) params.set("includeAssets", "1");
    const qs = params.toString();
    return `/api/export/backup${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <Breadcrumbs items={[{ label: "Superadmin", href: "/superadmin/analytics" }, { label: "Export" }]} />
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
          <p className="text-muted-foreground">Download blogs, newsletter subscribers, and editable tool pages.</p>
        </header>

        {/* Blogs Export */}
        <Card>
          <CardHeader>
            <CardTitle>Blogs</CardTitle>
            <CardDescription>Select posts and choose format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search posts</Label>
                <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or slug" />
              </div>
              <div className="flex items-center gap-2">
                <Label>Format</Label>
                <select className="border rounded-md px-2 py-1" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              {/* Include comments removed */}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <button
                  key={p.slug}
                  className={`text-left p-3 border rounded-md hover:bg-muted/50 transition ${selectedSlugs.includes(p.slug) ? "border-primary" : "border-border"}`}
                  onClick={() => toggleSelect(p.slug)}
                >
                  <div className="flex items-center gap-3">
                    {p.imageUrl ? <Image src={p.imageUrl} alt={p.title} width={64} height={40} className="rounded object-cover" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                    </div>
                    {selectedSlugs.includes(p.slug) ? (
                      <Badge variant="secondary">Selected</Badge>
                    ) : (
                      <Badge variant="outline">Tap to select</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link href={buildBlogsExportHref()} download>
                  Download Blogs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments export removed per request */}

        {/* Newsletter Export */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Subscribers</CardTitle>
            <CardDescription>Download emails for backup or analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <Button asChild>
                <Link href={newsletterHref(false)} download>
                  Download JSON
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={newsletterHref(true)} download>
                  Download CSV
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tool Pages Export */}
        <Card>
          <CardHeader>
            <CardTitle>Editable Tool Pages</CardTitle>
            <CardDescription>Export stored page content for migration or backup (JSON).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={pagesHref} download>
                Download Pages JSON
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Project & Website Backup */}
        <Card>
          <CardHeader>
            <CardTitle>Full Project & Website Backup</CardTitle>
            <CardDescription>
              Download a complete project snapshot or a compact website backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="includeAssets"
                type="checkbox"
                checked={includeAssets}
                onChange={(e) => setIncludeAssets(e.target.checked)}
              />
              <Label htmlFor="includeAssets">Include public assets (base64)</Label>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href={projectHref} download>
                  Download Project Snapshot (JSON)
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={projectZipHref} download>
                  Download Project Snapshot (ZIP)
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={buildBackupHref()} download>
                  Download Website Backup (JSON)
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}