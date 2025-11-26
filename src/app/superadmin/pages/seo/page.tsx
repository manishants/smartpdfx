"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import { checkRouteAccess } from "@/lib/auth/middleware";

type CmsPage = {
  id: string;
  title: string;
  slug: string; // "" for root
  status: "draft" | "published" | "archived" | string;
};

type PageSEO = {
  title?: string;
  description?: string;
  keywords?: string[];
};

type PageRowState = {
  page: CmsPage;
  metaTitle: string;
  metaDescription: string;
  keywords: string; // comma-separated in UI
  loading: boolean;
  savedAt?: string;
};

export default function PageSEOManager() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<PageRowState[]>([]);

  useEffect(() => {
    const init = async () => {
      // Protect route
      const access = await checkRouteAccess("/superadmin/pages/seo");
      if (!access.hasAccess) {
        router.push(access.redirectTo || "/superadmin/login");
        return;
      }

      try {
        // Load all available pages (filesystem + store)
        const res = await fetch("/api/pages");
        if (!res.ok) throw new Error("Failed to fetch pages");
        const data = await res.json();
        const pages: CmsPage[] = (data?.pages || []) as CmsPage[];

        // Fetch SEO for each page (best-effort)
        const rowStates: PageRowState[] = await Promise.all(
          pages.map(async (p) => {
            const slugParam = p.slug === "" ? "root" : p.slug;
            let seo: PageSEO | undefined;
            try {
              const seoRes = await fetch(`/api/seo/page/${slugParam}`);
              const seoData = await seoRes.json();
              seo = (seoData?.seo || {}) as PageSEO;
            } catch {
              seo = {};
            }
            return {
              page: p,
              metaTitle: (seo?.title || "").trim(),
              metaDescription: (seo?.description || "").trim(),
              keywords: (seo?.keywords || []).join(", "),
              loading: false,
            };
          })
        );

        setRows(rowStates);
      } catch (err: any) {
        toast({ description: err?.message || "Failed to load pages", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router, toast]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.page.title, r.page.slug, r.metaTitle, r.metaDescription]
        .map((x) => (x || "").toLowerCase())
        .some((x) => x.includes(q))
    );
  }, [rows, search]);

  const handleSave = async (row: PageRowState) => {
    const slugParam = row.page.slug === "" ? "root" : row.page.slug;
    const payload = {
      title: row.metaTitle.trim(),
      description: row.metaDescription.trim(),
      keywords: row.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };

    setRows((prev) => prev.map((r) => (r.page.id === row.page.id ? { ...r, loading: true } : r)));

    try {
      const res = await fetch(`/api/seo/page/${slugParam}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save SEO");
      const now = new Date().toLocaleString();
      setRows((prev) => prev.map((r) => (r.page.id === row.page.id ? { ...r, loading: false, savedAt: now } : r)));
      toast({ description: `Saved SEO for /${row.page.slug || ""}` });
    } catch (err: any) {
      setRows((prev) => prev.map((r) => (r.page.id === row.page.id ? { ...r, loading: false } : r)));
      toast({ description: err?.message || "Error saving SEO", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/superadmin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Page SEO Manager</h1>
            </div>
            <p className="text-sm text-muted-foreground">Edit meta title, description, and keywords for each page. Saved to local seo.json.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input placeholder="Filter by title, slug, or meta…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="text-sm text-muted-foreground">Total pages: {rows.length}</div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => router.refresh()}>Refresh</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading pages…</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Meta Title</TableHead>
                    <TableHead>Meta Description</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((r) => (
                    <TableRow key={r.page.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium">{r.page.title}</div>
                        <div className="text-xs text-muted-foreground">Status: <Badge variant="outline">{r.page.status || "published"}</Badge></div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">/{r.page.slug || ""}</TableCell>
                      <TableCell className="min-w-[260px]">
                        <Input
                          value={r.metaTitle}
                          onChange={(e) => setRows((prev) => prev.map((x) => (x.page.id === r.page.id ? { ...x, metaTitle: e.target.value } : x)))}
                          placeholder="Meta title"
                        />
                      </TableCell>
                      <TableCell className="min-w-[360px]">
                        <Textarea
                          value={r.metaDescription}
                          rows={3}
                          onChange={(e) => setRows((prev) => prev.map((x) => (x.page.id === r.page.id ? { ...x, metaDescription: e.target.value } : x)))}
                          placeholder="Meta description"
                        />
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <Input
                          value={r.keywords}
                          onChange={(e) => setRows((prev) => prev.map((x) => (x.page.id === r.page.id ? { ...x, keywords: e.target.value } : x)))}
                          placeholder="comma,separated,keywords"
                        />
                        {r.savedAt && (
                          <div className="text-[11px] text-muted-foreground mt-1">Saved {r.savedAt}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            disabled={r.loading}
                            onClick={() => {
                              // Reset fields from current seo store
                              const slugParam = r.page.slug === "" ? "root" : r.page.slug;
                              fetch(`/api/seo/page/${slugParam}`)
                                .then((res) => res.json())
                                .then((data) => {
                                  const seo = (data?.seo || {}) as PageSEO;
                                  setRows((prev) => prev.map((x) => (
                                    x.page.id === r.page.id
                                      ? {
                                          ...x,
                                          metaTitle: (seo?.title || "").trim(),
                                          metaDescription: (seo?.description || "").trim(),
                                          keywords: (seo?.keywords || []).join(", "),
                                        }
                                      : x
                                  )));
                                  toast({ description: `Reloaded SEO for /${r.page.slug || ""}` });
                                })
                                .catch(() => toast({ description: "Failed to reload", variant: "destructive" }));
                            }}
                          >
                            Reload
                          </Button>
                          <Button
                            disabled={r.loading}
                            onClick={() => handleSave(r)}
                          >
                            {r.loading ? "Saving…" : "Save"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}