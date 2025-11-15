"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkRouteAccess } from "@/lib/auth/middleware";
import { tools } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layout, Wrench, ArrowLeft, Search, Layers } from "lucide-react";

export default function ToolsPageBuilder() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const enforceAccess = async () => {
      const result = await checkRouteAccess("/superadmin/pages");
      if (!result.hasAccess) {
        router.push(result.redirectTo || "/superadmin/login");
      }
    };
    enforceAccess();
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) =>
      [t.title, t.description, t.href, t.category].some((x) =>
        (x || "").toLowerCase().includes(q)
      )
    );
  }, [search]);

  const toSlug = (href: string) => href.replace(/^\//, "");

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
              <Layout className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Tools Page Builder</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Tool pages no longer have per-page sections. Use Home Sections to manage site sections.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-64"
          />
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Tools ({filtered.length})
          </CardTitle>
          <CardDescription>
            Choose a tool to edit its page content. Use “Edit Section Below FAQ” to add Type A/B sections saved to code.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-2">
          {filtered.map((tool) => (
            <Card key={tool.href} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg">{tool.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{tool.description}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{tool.category}</Badge>
                    <Badge variant="outline">{tool.href}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={tool.href} target="_blank">Open Public</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/superadmin/pages/tools/section-builder/${toSlug(tool.href)}`}>
                    <Layers className="mr-2 h-4 w-4" /> Edit Section Below FAQ
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/superadmin/pages/tools/howto-editor/${toSlug(tool.href)}`}>
                    HowTo Editor
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/superadmin/pages/tools/heading-editor/${toSlug(tool.href)}`}>
                    H1 Heading Editor
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/superadmin/pages/tools/description-editor/${toSlug(tool.href)}`}>
                    Description Editor
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/superadmin/pages/tools/faq-editor/${toSlug(tool.href)}`}>
                    Edit FAQs
                  </Link>
                </Button>
              </div>
          </Card>
        ))}
        </div>
      </Card>
    </div>
  );
}