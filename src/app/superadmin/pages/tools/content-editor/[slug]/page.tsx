"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkRouteAccess } from "@/lib/auth/middleware";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tools } from "@/lib/data";

export default function ToolContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = String(params.slug || "");

  const fallback = useMemo(() => {
    const href = `/${slug}`;
    return tools.find((t) => t.href === href) || null;
  }, [slug]);

  const [nameHeading, setNameHeading] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const enforceAccess = async () => {
      const result = await checkRouteAccess("/superadmin/pages");
      if (!result.hasAccess) {
        router.push(result.redirectTo || "/superadmin/login");
      }
    };
    enforceAccess();
  }, [router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [hRes, dRes] = await Promise.all([
          fetch(`/api/tools/heading/${slug}`, { cache: "no-store" }),
          fetch(`/api/tools/description/${slug}`, { cache: "no-store" }),
        ]);
        const hJson = await hRes.json().catch(() => ({}));
        const dJson = await dRes.json().catch(() => ({}));
        const fallbackHeading = (fallback?.title || "").trim();
        const fallbackDescription = (fallback?.description || "").trim();
        setNameHeading(String(hJson?.heading ?? fallbackHeading));
        setDescription(String(dJson?.description ?? fallbackDescription));
      } catch {
        setNameHeading((fallback?.title || "").trim());
        setDescription((fallback?.description || "").trim());
      }
      setLoading(false);
    };
    if (slug) load();
  }, [slug, fallback]);

  const saveBoth = async () => {
    setSaving(true);
    try {
      const [hRes, dRes] = await Promise.all([
        fetch(`/api/tools/heading/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ heading: nameHeading }),
        }),
        fetch(`/api/tools/description/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        }),
      ]);
      const ok = hRes.ok && dRes.ok;
      if (ok) {
        toast({ title: "Saved", description: "Tool name & description updated." });
      } else {
        const herr = await hRes.json().catch(() => ({}));
        const derr = await dRes.json().catch(() => ({}));
        const msg = herr.error || derr.error || "Failed to save";
        toast({ title: "Failed", description: msg, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network or server error while saving", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/superadmin/pages/tools">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Tool Content Editor</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Edit the tool name (H1 heading) and page description in one place.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Name (H1 Heading)</CardTitle>
          <CardDescription>Set a clear, keyword-rich name for the tool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={nameHeading}
            onChange={(e) => setNameHeading(e.target.value)}
            placeholder="Enter tool name / H1 heading"
            disabled={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tool Description</CardTitle>
          <CardDescription>Write a concise, benefit-focused description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            disabled={loading}
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={saveBoth} disabled={saving || loading}>Save Name & Description</Button>
            <Button asChild variant="outline">
              <Link href={`/${slug}`} target="_blank">View Page</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}