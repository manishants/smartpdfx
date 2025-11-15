"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkRouteAccess } from "@/lib/auth/middleware";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HeadingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = String(params.slug || "");
  const [heading, setHeading] = useState("");
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
        const res = await fetch(`/api/tools/heading/${slug}`, { cache: 'no-store' });
        const json = await res.json();
        setHeading(String(json?.heading || ''));
      } catch {}
      setLoading(false);
    };
    if (slug) load();
  }, [slug]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tools/heading/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heading }),
      });
      if (res.ok) {
        toast({ title: "Saved", description: "H1 heading updated successfully." });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Failed", description: err.error || "Could not save heading", variant: "destructive" });
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
              <Type className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">H1 Heading Editor</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Edit the main tool page heading (rendered as H1).
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool H1 Heading</CardTitle>
          <CardDescription>Set a clear, keyword-rich heading for SEO.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Enter H1 heading"
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={save} disabled={saving || loading}>Save</Button>
            <Button asChild variant="outline">
              <Link href={`/${slug}`} target="_blank">View Page</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}