"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkRouteAccess } from "@/lib/auth/middleware";
import type { ToolHowtoData, ToolHowtoStep } from "@/lib/tool-howto";
import { toolHowtoFallback } from "@/lib/tool-howto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Rows, Save, Plus, Trash2, ListOrdered } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModernUploadArea } from "@/components/modern-upload-area";

export default function HowtoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = String(params.slug || "");
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

  const initial: ToolHowtoData = useMemo(() => {
    const raw = toolHowtoFallback[slug] as unknown;
    const fallback: ToolHowtoData = raw || { name: "How to use", description: "Simple steps", steps: [] };
    return fallback;
  }, [slug]);

  const [form, setForm] = useState<ToolHowtoData>(initial);

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "Step", text: "Describe this step" }]
    }));
  };

  const removeStep = (index: number) => {
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  };

  const updateStep = (index: number, updates: Partial<ToolHowtoStep>) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, ...updates } : s))
    }));
  };

  const uploadImageForStep = async (index: number, file: File) => {
    try {
      const nameSafe = `${slug}-step-${index + 1}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "-");
      const formData = new FormData();
      formData.set('file', file);
      formData.set('filename', nameSafe);
      const res = await fetch('/api/upload/howto', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      const publicPath = json.path as string;
      updateStep(index, { imageUrl: publicPath });
      toast({ title: 'Image uploaded', description: 'Linked to this step successfully.' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || 'Could not upload image', variant: 'destructive' });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tools/howto/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ howto: form }),
      });
      if (res.ok) {
        toast({ title: "Saved", description: "HowTo updated successfully." });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Failed", description: err.error || "Could not save HowTo", variant: "destructive" });
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
              <ListOrdered className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">HowTo Editor</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and edit step-by-step instructions for this tool. JSON-LD is generated automatically.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HowTo Metadata</CardTitle>
          <CardDescription>Set the name and description for the HowTo schema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rows className="h-5 w-5" />
            Steps ({form.steps.length})
          </CardTitle>
          <CardDescription>Manage how-to steps. Add titles, descriptions, and optional images.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {form.steps.map((step, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Step #{index + 1}</div>
                  <Button variant="outline" size="sm" onClick={() => removeStep(index)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
                <div className="grid gap-3">
                  <Input
                    placeholder="Title"
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Explain the step"
                    value={step.text}
                    onChange={(e) => updateStep(index, { text: e.target.value })}
                  />
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Optional image</label>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input
                        placeholder="Image URL"
                        value={step.imageUrl || ''}
                        onChange={(e) => updateStep(index, { imageUrl: e.target.value })}
                      />
                      <Input
                        placeholder="Image alt text"
                        value={step.imageAlt || ''}
                        onChange={(e) => updateStep(index, { imageAlt: e.target.value })}
                      />
                    </div>
                    <ModernUploadArea
                      accept="image/*"
                      title="Drop an image or click to upload"
                      subtitle="This uploads to /public/howto and links the image"
                      onFileSelect={(file) => uploadImageForStep(index, file)}
                      className="mt-2"
                    />
                    {step.imageUrl && (
                      <img src={step.imageUrl} alt={step.imageAlt || step.title} className="rounded border w-full md:w-64" />
                    )}
                  </div>
                </div>
                <Separator />
              </div>
            ))}

            <div className="flex gap-2">
              <Button onClick={addStep}>
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
              <Button variant="secondary" onClick={save} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}