'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolSections } from '@/components/tool-sections';
import { checkRouteAccess } from '@/lib/auth/middleware';
import { ToolSection, HomePageSection } from '@/types/cms';
import { ArrowLeft, Layout, Save, Eye, EyeOff, Loader2 } from 'lucide-react';

type SectionType = 'tool' | 'home';

type SectionFormData = {
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  toolName?: string;
  order: number;
  isActive: boolean;
  settings?: Record<string, any>;
};

export default function EditSectionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sectionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [sectionType, setSectionType] = useState<SectionType>('tool');
  const [originalSection, setOriginalSection] = useState<ToolSection | HomePageSection | null>(null);
  const [formData, setFormData] = useState<SectionFormData>({
    type: 'content',
    title: '',
    subtitle: '',
    description: '',
    toolName: '',
    order: 1,
    isActive: true,
    settings: {}
  });

  // Access control
  useEffect(() => {
    const enforceAccess = async () => {
      const result = await checkRouteAccess('/superadmin/sections');
      if (!result.hasAccess) {
        router.push(result.redirectTo || '/superadmin/login');
      }
    };
    enforceAccess();
  }, [router]);

  // Load section
  useEffect(() => {
    const loadSection = async () => {
      try {
        setLoading(true);
        const qpType = searchParams.get('type');
        const url = qpType
          ? `/api/cms/sections/${sectionId}?type=${qpType}`
          : `/api/cms/sections/${sectionId}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load section');
        const data = json.data as ToolSection | HomePageSection;

        // Infer section type
        const inferredType: SectionType = (data as ToolSection)?.toolName ? 'tool' : 'home';
        setSectionType(inferredType);
        setOriginalSection(data);

        // Initialize form data
        setFormData({
          type: (data as any).type || 'content',
          title: (data as any).title || '',
          subtitle: (data as any).subtitle || '',
          description: (data as any).description || '',
          toolName: inferredType === 'tool' ? (data as ToolSection).toolName : undefined,
          order: (data as any).order || 1,
          isActive: (data as any).isActive ?? true,
          settings: inferredType === 'home' ? ((data as HomePageSection).settings || {}) : {}
        });
      } catch (err) {
        console.error('Error loading section:', err);
        router.push('/superadmin/sections');
      } finally {
        setLoading(false);
      }
    };
    if (sectionId) loadSection();
  }, [sectionId, searchParams, router]);

  const handleInput = (field: keyof SectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/cms/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: sectionType, ...formData })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to update section');
      const updated = json.data as ToolSection | HomePageSection;
      setOriginalSection(updated);
    } catch (err) {
      console.error('Error saving section:', err);
      alert('Failed to save section. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  // Convert current form to preview shape for tool sections
  const toolPreviewSections = useMemo(() => {
    if (sectionType !== 'tool') return [] as any[];
    const defaultIcon = () => null;
    const heroDefaults = {
      features: (originalSection as any)?.features?.map((f: any) => ({ icon: defaultIcon, text: f?.text || '' })) || [],
      imagePlaceholder: (originalSection as any)?.imagePlaceholder
        ? { icon: defaultIcon, text: (originalSection as any)?.imagePlaceholder?.text || 'Preview' }
        : { icon: defaultIcon, text: 'Preview' },
      gradient: (originalSection as any)?.gradient || 'bg-card border border-border dark:bg-gradient-to-br dark:from-primary/10 dark:to-primary/5',
      iconColor: (originalSection as any)?.iconColor || 'text-primary'
    };

    if (formData.type === 'hero') {
      return [{
        type: 'hero',
        title: formData.title,
        description: formData.description || '',
        features: heroDefaults.features,
        imagePlaceholder: heroDefaults.imagePlaceholder,
        imageUrl: (originalSection as any)?.imageUrl,
        gradient: heroDefaults.gradient,
        iconColor: heroDefaults.iconColor
      }];
    }

    return [{
      type: 'content',
      title: formData.title,
      description: formData.description || ''
    }];
  }, [sectionType, formData, originalSection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading section...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/superadmin/sections">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Layout className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit Section</h1>
            </div>
            <p className="text-sm text-muted-foreground">ID: {sectionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(p => (p === 'edit' ? 'preview' : 'edit'))}>
            {previewMode === 'edit' ? (<><Eye className="h-4 w-4 mr-2" /> Preview</>) : (<><EyeOff className="h-4 w-4 mr-2" /> Back to Edit</>)}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">{sectionType === 'tool' ? 'Tool Section' : 'Home Section'}</Badge>
            <span className="text-muted-foreground">Type: {(formData.type || '').toString()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewMode === 'edit' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Variant</Label>
                  <Select value={formData.type} onValueChange={(v: string) => handleInput('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionType === 'tool' ? (
                        <>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="hero">Hero</SelectItem>
                          <SelectItem value="features">Features</SelectItem>
                          <SelectItem value="stats">Stats</SelectItem>
                          <SelectItem value="cta">CTA</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {sectionType === 'tool' && (
                  <div>
                    <Label>Tool Name</Label>
                    <Input value={formData.toolName || ''} onChange={(e) => handleInput('toolName', e.target.value)} placeholder="e.g., pdf-compressor" />
                  </div>
                )}
              </div>

              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => handleInput('title', e.target.value)} placeholder="Section title" />
              </div>

              {formData.type === 'hero' && (
                <div>
                  <Label>Subtitle</Label>
                  <Input value={formData.subtitle || ''} onChange={(e) => handleInput('subtitle', e.target.value)} placeholder="Section subtitle" />
                </div>
              )}

              <div>
                <Label>Description</Label>
                <Textarea value={formData.description || ''} onChange={(e) => handleInput('description', e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Order</Label>
                  <Input type="number" min={1} value={formData.order} onChange={(e) => handleInput('order', parseInt(e.target.value || '1', 10))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={formData.isActive} onCheckedChange={(checked) => handleInput('isActive', checked)} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sectionType === 'tool' ? (
                <ToolSections toolName={formData.toolName || 'default'} sections={toolPreviewSections as any} />
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-bold">{formData.title || 'Untitled'}</h2>
                        {formData.subtitle ? (
                          <p className="text-muted-foreground">{formData.subtitle}</p>
                        ) : null}
                        {formData.description ? (
                          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">{formData.description}</p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}