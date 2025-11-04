"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { checkRouteAccess } from '@/lib/auth/middleware';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernSection } from '@/components/modern-section';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import { useToast } from '@/hooks/use-toast';
import type { SectionType } from '@/lib/tool-custom-sections';
import { LayoutTemplate, ArrowLeft, Eye, EyeOff, Image as ImageIcon, Rows, Columns, Plus, Pencil, Trash } from 'lucide-react';

export default function ToolSectionBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const { toast } = useToast();

  useEffect(() => {
    const enforceAccess = async () => {
      const result = await checkRouteAccess('/superadmin/pages');
      if (!result.hasAccess) {
        router.push(result.redirectTo || '/superadmin/login');
      }
    };
    enforceAccess();
  }, [router]);

  const [type, setType] = useState<SectionType>('A');
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [btn1Text, setBtn1Text] = useState('');
  const [btn1Href, setBtn1Href] = useState('');
  const [btn2Text, setBtn2Text] = useState('');
  const [btn2Href, setBtn2Href] = useState('');
  const [showDesktopPreview, setShowDesktopPreview] = useState(true);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Load existing section (if any)
    const loadExisting = async () => {
      try {
        const res = await fetch(`/api/tools/custom-section/${slug}`);
        const json = await res.json();
        const arr = json?.sections || [];
        setSections(arr);
        if (arr.length > 0) {
          // Load first section by default
          setSelectedIndex(0);
          const s = arr[0];
          setType(s.type);
          setHeading(s.heading || '');
          setParagraph(s.paragraph || '');
          setImageSrc(s.image?.src || '');
          setImageAlt(s.image?.alt || '');
          const b = s.buttons || [];
          setBtn1Text(b[0]?.text || '');
          setBtn1Href(b[0]?.href || '');
          setBtn2Text(b[1]?.text || '');
          setBtn2Href(b[1]?.href || '');
        }
      } catch (e) {
        // ignore
      }
    };
    if (slug) loadExisting();
  }, [slug]);

  const previewData = useMemo(() => ({
    type,
    heading,
    paragraph,
    image: { src: imageSrc, alt: imageAlt },
    buttons: [
      ...(btn1Text && btn1Href ? [{ text: btn1Text, href: btn1Href }] : []),
      ...(btn2Text && btn2Href ? [{ text: btn2Text, href: btn2Href }] : []),
    ],
  }), [type, heading, paragraph, imageSrc, imageAlt, btn1Text, btn1Href, btn2Text, btn2Href]);

  const handleSave = async () => {
    if (!heading || !paragraph || !imageSrc || !imageAlt) {
      toast({ title: 'Missing required fields', description: 'Heading, paragraph, image URL and alt text are required.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`/api/tools/custom-section/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: previewData, index: selectedIndex }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: 'Saved', description: json.message || 'Section added/updated successfully. Please test on live page.' });
        setSections(json.sections || []);
        // If we appended, set selectedIndex to last
        if (typeof selectedIndex !== 'number') {
          setSelectedIndex((json.sections || []).length - 1);
        }
      } else {
        toast({ title: 'Failed to save', description: json.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  const handleRemove = async () => {
    if (!confirm(selectedIndex !== null ? 'Remove the selected section?' : 'Remove ALL sections for this page?')) return;
    try {
      const res = await fetch(`/api/tools/custom-section/${slug}${selectedIndex !== null ? `?index=${selectedIndex}` : ''}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        toast({ title: 'Removed', description: json.message || 'Section removed successfully. Please test on live page.' });
        setSections(json.sections || []);
        // Reset form if none left
        if ((json.sections || []).length === 0) {
          setSelectedIndex(null);
          setType('A');
          setHeading('');
          setParagraph('');
          setImageSrc('');
          setImageAlt('');
          setBtn1Text('');
          setBtn1Href('');
          setBtn2Text('');
          setBtn2Href('');
        }
      } else {
        toast({ title: 'Failed to remove', description: json.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Failed to remove', description: e?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  const handleAddNew = () => {
    setSelectedIndex(null);
    setType('A');
    setHeading('');
    setParagraph('');
    setImageSrc('');
    setImageAlt('');
    setBtn1Text('');
    setBtn1Href('');
    setBtn2Text('');
    setBtn2Href('');
  };

  const handleEditIndex = (idx: number) => {
    const s = sections[idx];
    setSelectedIndex(idx);
    setType(s.type);
    setHeading(s.heading || '');
    setParagraph(s.paragraph || '');
    setImageSrc(s.image?.src || '');
    setImageAlt(s.image?.alt || '');
    const b = s.buttons || [];
    setBtn1Text(b[0]?.text || '');
    setBtn1Href(b[0]?.href || '');
    setBtn2Text(b[1]?.text || '');
    setBtn2Href(b[1]?.href || '');
  };

  const handleUploadImage = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('filename', `${slug}-${file.name}`);
      const res = await fetch('/api/upload/page', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json?.path) {
        setImageSrc(json.path);
        toast({ title: 'Image uploaded', description: 'Stored under public/page and linked to this section.' });
      } else {
        toast({ title: 'Upload failed', description: json?.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsUploading(false);
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
              <LayoutTemplate className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Add Section Below FAQ</h1>
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
        </div>
      </div>

      {/* Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rows className="h-5 w-5" />
            Section Content
          </CardTitle>
          <CardDescription>
            Choose layout type and fill content. Buttons are optional, and open in a new tab if external.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            {/* Existing sections list */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Current Sections</h3>
                <Button size="sm" variant="outline" onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Section
                </Button>
              </div>
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sections yet. Use "Add New Section" to create one.</p>
              ) : (
                <div className="space-y-2">
                  {sections.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">#{idx + 1} • Type {s.type}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[320px]">{s.heading}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={selectedIndex === idx ? 'default' : 'outline'} onClick={() => handleEditIndex(idx)}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { setSelectedIndex(idx); handleRemove(); }}>
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Label>Section Type</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as SectionType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="A" className="flex items-center gap-2"><Columns className="h-4 w-4" />A: Left Text / Right Image</TabsTrigger>
                <TabsTrigger value="B" className="flex items-center gap-2"><Columns className="h-4 w-4" />B: Left Image / Right Text</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="heading">Heading (H2)</Label>
              <Input id="heading" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Enter section heading" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paragraph">Paragraph</Label>
              <Textarea id="paragraph" value={paragraph} onChange={(e) => setParagraph(e.target.value)} placeholder="Enter supporting text" rows={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imgSrc">Image URL (or /path in public)</Label>
              <Input id="imgSrc" value={imageSrc} onChange={(e) => setImageSrc(e.target.value)} placeholder="https://... or /page/your-image.jpg" />
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={(e) => e.target.files && e.target.files[0] && handleUploadImage(e.target.files[0])} />
                <Button size="sm" disabled className="opacity-60 cursor-not-allowed">{isUploading ? 'Uploading...' : 'Upload Image (stores in /public/page)'}</Button>
              </div>
              <p className="text-xs text-muted-foreground">Upload will store the image under public/page and auto-fill the URL field.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imgAlt">Image Alt Text</Label>
              <Input id="imgAlt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Describe the image" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="btn1Text">Button 1 Text</Label>
                <Input id="btn1Text" value={btn1Text} onChange={(e) => setBtn1Text(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="btn1Href">Button 1 Link</Label>
                <Input id="btn1Href" value={btn1Href} onChange={(e) => setBtn1Href(e.target.value)} placeholder="/internal or https://external" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="btn2Text">Button 2 Text</Label>
                <Input id="btn2Text" value={btn2Text} onChange={(e) => setBtn2Text(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="btn2Href">Button 2 Link</Label>
                <Input id="btn2Href" value={btn2Href} onChange={(e) => setBtn2Href(e.target.value)} placeholder="/internal or https://external" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave}>{selectedIndex !== null ? 'Update Section' : 'Add Section'}</Button>
              <Button onClick={handleRemove} variant="destructive">{selectedIndex !== null ? 'Remove Selected' : 'Remove All'}</Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Eye className="h-5 w-5" />Preview</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={showDesktopPreview ? 'default' : 'outline'} onClick={() => setShowDesktopPreview(true)}>
                  Desktop
                </Button>
                <Button size="sm" variant={!showDesktopPreview ? 'default' : 'outline'} onClick={() => setShowDesktopPreview(false)}>
                  Mobile
                </Button>
              </div>
            </div>

            <ModernSection>
              {showDesktopPreview ? (
                <div className="grid gap-8 md:grid-cols-2 items-center">
                  {type === 'A' ? (
                    <>
                      <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{heading || 'Your H2 heading here'}</h2>
                        <p className="text-muted-foreground text-base leading-relaxed">{paragraph || 'Your paragraph text appears here. This will support your heading.'}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {!!btn1Text && !!btn1Href && (
                            <Button>{btn1Text}</Button>
                          )}
                          {!!btn2Text && !!btn2Href && (
                            <Button variant="outline">{btn2Text}</Button>
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        {imageSrc ? (
                          imageSrc.startsWith('/') ? (
                            <img src={imageSrc} alt={imageAlt} className="w-full h-auto rounded-xl shadow-sm" />
                          ) : (
                            <img src={imageSrc} alt={imageAlt} className="w-full h-auto rounded-xl shadow-sm" />
                          )
                        ) : (
                          <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                            <span className="ml-2 text-sm">Image preview</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full">
                        {imageSrc ? (
                          <img src={imageSrc} alt={imageAlt} className="w-full h-auto rounded-xl shadow-sm" />
                        ) : (
                          <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                            <span className="ml-2 text-sm">Image preview</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{heading || 'Your H2 heading here'}</h2>
                        <p className="text-muted-foreground text-base leading-relaxed">{paragraph || 'Your paragraph text appears here. This will support your heading.'}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {!!btn1Text && !!btn1Href && (
                            <Button>{btn1Text}</Button>
                          )}
                          {!!btn2Text && !!btn2Href && (
                            <Button variant="outline">{btn2Text}</Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile stacks content vertically */}
                  {type === 'A' ? (
                    <>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold">{heading || 'Your H2 heading here'}</h2>
                        <p className="text-muted-foreground text-sm">{paragraph || 'Your paragraph text appears here.'}</p>
                      </div>
                      <div className="w-full">
                        {imageSrc ? (
                          <img src={imageSrc} alt={imageAlt} className="w-full h-auto rounded-xl shadow-sm" />
                        ) : (
                          <div className="w-full h-40 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                            <span className="ml-2 text-xs">Image preview</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {!!btn1Text && !!btn1Href && (<Button size="sm">{btn1Text}</Button>)}
                        {!!btn2Text && !!btn2Href && (<Button size="sm" variant="outline">{btn2Text}</Button>)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full">
                        {imageSrc ? (
                          <img src={imageSrc} alt={imageAlt} className="w-full h-auto rounded-xl shadow-sm" />
                        ) : (
                          <div className="w-full h-40 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                            <span className="ml-2 text-xs">Image preview</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold">{heading || 'Your H2 heading here'}</h2>
                        <p className="text-muted-foreground text-sm">{paragraph || 'Your paragraph text appears here.'}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {!!btn1Text && !!btn1Href && (<Button size="sm">{btn1Text}</Button>)}
                        {!!btn2Text && !!btn2Href && (<Button size="sm" variant="outline">{btn2Text}</Button>)}
                      </div>
                    </>
                  )}
                </div>
              )}
            </ModernSection>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Placement Guidance
          </CardTitle>
          <CardDescription>
            Sections will display immediately below the FAQ on the public tool page. You can add multiple sections, upload images into public/page, and update or remove individual sections.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}