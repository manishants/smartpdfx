"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkRouteAccess } from "@/lib/auth/middleware";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DescriptionEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = String(params.slug || "");
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
        const res = await fetch(`/api/tools/description/${slug}`, { cache: 'no-store' });
        const json = await res.json();
        setDescription(String(json?.description || ''));
      } catch {}
      setLoading(false);
    };
    if (slug) load();
  }, [slug]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tools/description/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        toast({ title: "Saved", description: "Description updated successfully." });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Failed", description: err.error || "Could not save description", variant: "destructive" });
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
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Description Editor</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Edit the tool page description displayed under the H1.
            </p>
          </div>
        </div>
      </div>

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