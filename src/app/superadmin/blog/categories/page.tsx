"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cmsStore } from "@/lib/cms/store";
import type { Category, Tag } from "@/types/cms";
import { ArrowLeft, Hash, Tags, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CategoriesTagsAdmin() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [tagName, setTagName] = useState("");

  useEffect(() => {
    const load = async () => {
      const [cats, tgs] = await Promise.all([
        cmsStore.getAllCategories(),
        cmsStore.getAllTags(),
      ]);
      setCategories(cats);
      setTags(tgs);
    };
    load();
  }, []);

  const addCategory = async () => {
    const name = catName.trim();
    if (!name) return;
    const created = await cmsStore.createCategory({ name, description: catDesc });
    setCategories((prev) => [created, ...prev]);
    setCatName("");
    setCatDesc("");
  };

  const deleteCategory = async (id: string) => {
    const ok = await cmsStore.deleteCategory(id);
    if (ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addTag = async () => {
    const name = tagName.trim();
    if (!name) return;
    const created = await cmsStore.createTag({ name });
    setTags((prev) => [created, ...prev]);
    setTagName("");
  };

  const deleteTag = async (id: string) => {
    const ok = await cmsStore.deleteTag(id);
    if (ok) setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/superadmin/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Hash className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Categories & Tags</h1>
          </div>
        </div>
        <Button asChild>
          <Link href="/superadmin/blog/create">
            <PlusCircle className="mr-2 h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" /> Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Name</Label>
              <Input id="catName" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g., Tutorials" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">Description</Label>
              <Input id="catDesc" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Short description (optional)" />
            </div>
            <Button onClick={addCategory} className="w-full">Add Category</Button>

            <div className="mt-4 space-y-2">
              {categories.length === 0 ? (
                <div className="text-sm text-muted-foreground">No categories yet.</div>
              ) : (
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border p-2">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">/{c.slug}</div>
                        {c.description && <div className="text-xs mt-1">{c.description}</div>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteCategory(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" /> Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Name</Label>
              <Input id="tagName" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="e.g., pdf, seo" />
            </div>
            <Button onClick={addTag} className="w-full">Add Tag</Button>

            <div className="mt-4 flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <div className="text-sm text-muted-foreground">No tags yet.</div>
              ) : (
                tags.map((t) => (
                  <Badge key={t.id} variant="secondary" className="gap-2">
                    {t.name}
                    <button onClick={() => deleteTag(t.id)} title="Remove" className="ml-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}