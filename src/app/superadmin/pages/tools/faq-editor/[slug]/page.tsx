"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkRouteAccess } from "@/lib/auth/middleware";
import type { ToolFaqItem } from "@/lib/tool-faq";
import { toolFaqFallback } from "@/lib/tool-faq";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, LayoutTemplate, Rows, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ToolFaqEditorPage() {
  const router = useRouter();
  const params = useParams();
  const slug = String(params?.slug || "");
  const { toast } = useToast();

  const initialFaqs = useMemo(() => {
    const raw = toolFaqFallback[slug] as unknown;
    return (Array.isArray(raw) ? raw : []) as ToolFaqItem[];
  }, [slug]);

  const [faqs, setFaqs] = useState<ToolFaqItem[]>(initialFaqs);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

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
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`/api/tools/faq/${slug}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const arr = Array.isArray(json?.faqs) ? (json.faqs as ToolFaqItem[]) : [];
          setFaqs(arr.length > 0 ? arr : initialFaqs);
        } else {
          setFaqs(initialFaqs);
        }
      } catch {
        setFaqs(initialFaqs);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [slug, initialFaqs]);

  const addFaq = () => {
    setFaqs((prev) => [
      ...prev,
      {
        question: "",
        answer: "",
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const removeFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof ToolFaqItem, value: string) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value, updatedAt: new Date().toISOString() };
      return next;
    });
  };

  const saveFaqs = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tools/faq/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs }),
      });
      if (res.ok) {
        toast({ title: "Saved", description: "FAQs updated successfully." });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Failed", description: err.error || "Could not save FAQs", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network or server error while saving", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!slug) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Missing slug.</p>
      </div>
    );
  }

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
              <LayoutTemplate className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit FAQs</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Editing for: <span className="font-mono">/{slug}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${slug}`} target="_blank">Open Public</Link>
          </Button>
          <Button onClick={saveFaqs} disabled={saving} size="sm">
            <Save className="mr-2 h-4 w-4" /> Save FAQs
          </Button>
        </div>
      </div>

      {/* Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rows className="h-5 w-5" />
            FAQ Items ({faqs.length})
          </CardTitle>
          <CardDescription>
            Add, edit, or remove questions and answers. Changes are saved per tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">FAQ #{index + 1}</div>
                  <Button variant="outline" size="sm" onClick={() => removeFaq(index)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
                <div className="grid gap-3">
                  <Input
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  />
                </div>
                <Separator />
              </div>
            ))}
            <div className="flex justify-between">
              <Button variant="secondary" onClick={addFaq}>
                <Plus className="h-4 w-4 mr-2" /> Add FAQ
              </Button>
              <Button onClick={saveFaqs} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}