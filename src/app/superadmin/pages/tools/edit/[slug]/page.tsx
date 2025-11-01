"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkRouteAccess } from "@/lib/auth/middleware";
import { tools } from "@/lib/data";
import { cmsStore } from "@/lib/cms/store";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Layout, Eye, EyeOff, Plus, Save, Trash2, ChevronUp, ChevronDown 
} from "lucide-react";

type SectionType = "hero" | "content";

interface ToolSectionForm {
  id?: string;
  type: SectionType;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

export default function EditToolPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [toolName, setToolName] = useState<string>("");
  const [sections, setSections] = useState<ToolSectionForm[]>([]);

  const tool = useMemo(() => {
    const normalized = `/${slug}`;
    return tools.find(t => t.href === normalized);
  }, [slug]);

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
        const name = tool?.title || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        setToolName(name);
        const all = await cmsStore.getAllToolSections();
        const own = all.filter(s => s.toolName === name).sort((a, b) => a.order - b.order);
        if (own.length === 0) {
          // Seed with default template if none exist
          const templates = await cmsStore.getAllToolSectionTemplates();
          const def = templates.find(t => t.isDefault) || templates[0];
          if (def) {
            await cmsStore.bulkCreateToolSections(name, def.sections);
            const seeded = await cmsStore.getAllToolSections();
            const seededOwn = seeded.filter(s => s.toolName === name).sort((a, b) => a.order - b.order);
            setSections(seededOwn.map(s => ({ id: s.id, type: s.type, title: s.title, description: s.description, order: s.order, isActive: s.isActive })));
          } else {
            setSections([]);
          }
        } else {
          setSections(own.map(s => ({ id: s.id, type: s.type, title: s.title, description: s.description, order: s.order, isActive: s.isActive })));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tool, slug]);

  const handleAddSection = async () => {
    const nextOrder = (sections[sections.length - 1]?.order || 0) + 1;
    const newSection: Omit<ToolSectionForm, "id"> = {
      type: "content",
      title: "New Section",
      description: "",
      order: nextOrder,
      isActive: true,
    };
    setSaving(true);
    try {
      const created = await cmsStore.createToolSection({
        toolName,
        type: newSection.type,
        title: newSection.title,
        description: newSection.description,
        order: newSection.order,
        isActive: newSection.isActive,
      });
      setSections(prev => [...prev, { ...newSection, id: created!.id }]);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (id: string, updates: Partial<ToolSectionForm>) => {
    setSections(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleSaveSection = async (id: string) => {
    const target = sections.find(s => s.id === id);
    if (!target) return;
    setSaving(true);
    try {
      await cmsStore.updateToolSection(id, {
        type: target.type,
        title: target.title,
        description: target.description,
        order: target.order,
        isActive: target.isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    setSaving(true);
    try {
      await cmsStore.deleteToolSection(id);
      setSections(prev => prev.filter(s => s.id !== id));
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const newOrder = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newOrder.length) return prev;
      const a = newOrder[idx];
      const b = newOrder[swapIdx];
      newOrder[idx] = { ...a, order: b.order };
      newOrder[swapIdx] = { ...b, order: a.order };
      return newOrder.sort((x, y) => x.order - y.order);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <Layout className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit Tool Page</h1>
            </div>
            <p className="text-sm text-muted-foreground">{toolName} ({slug})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(p => (p === "edit" ? "preview" : "edit"))}>
            {previewMode === "edit" ? (<><Eye className="h-4 w-4 mr-2" /> Preview</>) : (<><EyeOff className="h-4 w-4 mr-2" /> Back to Edit</>)}
          </Button>
          <Button onClick={handleAddSection} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Content */}
      {previewMode === "preview" ? (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>Quick look at titles and descriptions</CardDescription>
          </CardHeader>
          <div className="p-6 space-y-4">
            {sections.length === 0 ? (
              <div className="text-sm text-muted-foreground">No sections yet.</div>
            ) : (
              sections.sort((a, b) => a.order - b.order).map(s => (
                <Card key={s.id} className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{s.type}</Badge>
                      <span className="text-xs text-muted-foreground">Order: {s.order}</span>
                    </div>
                    <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="mt-2 font-medium">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.description}</div>
                </Card>
              ))
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Page Sections</CardTitle>
            <CardDescription>Update content, order, and status</CardDescription>
          </CardHeader>
          <div className="p-6 space-y-4">
            {sections.length === 0 ? (
              <div className="text-sm text-muted-foreground">No sections yet. Click Add Section.</div>
            ) : (
              sections.sort((a, b) => a.order - b.order).map(s => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{s.type}</Badge>
                      <span className="text-xs text-muted-foreground">Order: {s.order}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => moveSection(s.id!, "up")}> <ChevronUp className="h-4 w-4" /> </Button>
                      <Button variant="ghost" size="sm" onClick={() => moveSection(s.id!, "down")}> <ChevronDown className="h-4 w-4" /> </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSection(s.id!)}> <Trash2 className="h-4 w-4" /> </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={s.type} onValueChange={(v: SectionType) => updateSection(s.id!, { type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Active</Label>
                      <div className="flex h-10 items-center">
                        <Switch checked={s.isActive} onCheckedChange={(v) => updateSection(s.id!, { isActive: v })} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={s.title} onChange={(e) => updateSection(s.id!, { title: e.target.value })} placeholder="Section title" />
                    </div>
                    <div>
                      <Label>Order</Label>
                      <Input type="number" value={s.order} onChange={(e) => updateSection(s.id!, { order: parseInt(e.target.value || "0", 10) })} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea value={s.description} onChange={(e) => updateSection(s.id!, { description: e.target.value })} placeholder="Section description" />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleSaveSection(s.id!)} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}