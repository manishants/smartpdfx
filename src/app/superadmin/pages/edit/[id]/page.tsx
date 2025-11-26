'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Save, 
  Eye, 
  Send, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Move,
  Copy,
  Settings,
  History,
  Layout,
  Image as ImageIcon,
  Type,
  Link,
  Video,
  Undo,
  Redo,
  Clock
} from 'lucide-react';
import { Page, PageForm, SEOData, PageBlock } from '@/types/cms';
import { cmsStore } from '@/lib/cms/store';
import { SEOAnalyzer } from '@/lib/seo/analyzer';
import { MediaLibraryModal } from '@/components/media-library';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useVersionControl } from '@/hooks/use-version-control';
import { VersionHistoryModal } from '@/components/cms/version-history-modal';
import { SchedulingPanel } from '@/components/cms/scheduling-panel';

const SECTION_TYPES = [
  { id: 'hero', name: 'Hero Section', icon: Layout },
  { id: 'text', name: 'Text Content', icon: Type },
  { id: 'image', name: 'Image Gallery', icon: ImageIcon },
  { id: 'video', name: 'Video Embed', icon: Video },
  { id: 'cta', name: 'Call to Action', icon: Link },
  { id: 'testimonials', name: 'Testimonials', icon: Type },
  { id: 'faq', name: 'FAQ Section', icon: Type },
  { id: 'contact', name: 'Contact Form', icon: Type }
];

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [originalPage, setOriginalPage] = useState<Page | null>(null);
  
  const [formData, setFormData] = useState<PageForm>({
    title: '',
    slug: '',
    status: 'draft',
    sections: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      score: 0,
      issues: [],
      suggestions: []
    }
  });

  // Version control and auto-save hooks
  const {
    data: versionData,
    saveVersion,
    undo,
    redo,
    canUndo,
    canRedo,
    getVersionHistory,
    jumpToVersion
  } = useVersionControl(formData, {
    maxVersions: 50,
    debounceMs: 1000
  });

  const {
    isSaving: autoSaving,
    lastSaved,
    hasUnsavedChanges,
    forceSave
  } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      // Auto-save to localStorage
      localStorage.setItem(`page-draft-${pageId}`, JSON.stringify({
        ...data,
        lastSaved: new Date().toISOString()
      }));
    },
    interval: 3000,
    enabled: true
  });

  const [seoAnalysis, setSeoAnalysis] = useState<SEOData | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  // Load existing page
  useEffect(() => {
    const loadPage = async () => {
      try {
        const page = await cmsStore.getPage(pageId);
        if (page) {
          setOriginalPage(page);
          setFormData({
            title: page.title,
            slug: page.slug,
            status: page.status,
            sections: page.sections || [],
            seo: page.seo || {
              metaTitle: '',
              metaDescription: '',
              focusKeyword: '',
              canonicalUrl: '',
              score: 0,
              issues: [],
              suggestions: []
            }
          });
        } else {
          router.push('/superadmin/pages');
        }
      } catch (error) {
        console.error('Error loading page:', error);
        router.push('/superadmin/pages');
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadPage();
    }
  }, [pageId, router]);

  // SEO Analysis
  useEffect(() => {
    if (formData.title || formData.sections.length > 0) {
      const content = formData.sections
        .map(section => section.content?.text || section.content?.title || '')
        .join(' ');
      
      const analyzer = new SEOAnalyzer(
        content,
        formData.seo.metaTitle || formData.title,
        formData.seo.metaDescription || '',
        formData.seo.focusKeyword || ''
      );
      
      const analysis = analyzer.analyze();
      
      setSeoAnalysis(analysis);
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, ...analysis }
      }));
    }
  }, [formData.title, formData.sections, formData.seo.metaTitle, formData.seo.metaDescription, formData.seo.focusKeyword]);

  const handleInputChange = (field: keyof PageForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Save version for significant changes
    if (['title', 'slug', 'status'].includes(field)) {
      saveVersion(`Updated ${field}`, 'edit');
    }
  };

  const handleSeoChange = (field: keyof SEOData, value: any) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<PageSection>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const handleAddSection = (type: string) => {
    const newSection: PageSection = {
      id: `section_${Date.now()}`,
      type,
      order: formData.sections.length,
      content: getDefaultSectionContent(type),
      settings: {
        visible: true,
        backgroundColor: '#ffffff',
        textColor: '#000000'
      }
    };

    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setShowAddSection(false);
    setEditingSection(newSection.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }));
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...formData.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    
    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }

    // Update order
    sections.forEach((section, i) => {
      section.order = i;
    });

    setFormData(prev => ({ ...prev, sections }));
  };

  const getDefaultSectionContent = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          title: 'Hero Title',
          subtitle: 'Hero subtitle text',
          buttonText: 'Call to Action',
          buttonLink: '#',
          backgroundImage: ''
        };
      case 'text':
        return {
          title: 'Section Title',
          text: 'Your content goes here...'
        };
      case 'image':
        return {
          title: 'Image Gallery',
          images: []
        };
      case 'video':
        return {
          title: 'Video Section',
          videoUrl: '',
          description: ''
        };
      case 'cta':
        return {
          title: 'Ready to Get Started?',
          text: 'Join thousands of satisfied customers',
          buttonText: 'Get Started Now',
          buttonLink: '#'
        };
      default:
        return {
          title: 'New Section',
          text: 'Content goes here...'
        };
    }
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const updateData: Partial<Page> = {
        ...formData,
        status: status || formData.status
      };

      await cmsStore.updatePage(pageId, updateData);
      
      // Clear auto-save draft
      localStorage.removeItem(`page_edit_${pageId}`);
      
      router.push('/superadmin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeoScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!originalPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/superadmin/pages')}>
            Back to Page Manager
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Layout className="h-8 w-8 text-yellow-600" />
              Edit Page
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">
                {autoSaving ? 'Auto-saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
              </p>
              {autoSaving && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>}
              {hasUnsavedChanges && <Badge variant="outline" className="text-xs">Unsaved changes</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Version Control */}
          <div className="flex gap-1 border-r pr-2 mr-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={undo} 
              disabled={!canUndo}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={redo} 
              disabled={!canRedo}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowVersionHistory(true)}
              title="Version History"
            >
              <History className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={() => window.open(`/${formData.slug}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            {originalPage?.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Page Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title..."
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="page-url-slug"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Sections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Page Sections ({formData.sections.length})
                </CardTitle>
                <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Section</DialogTitle>
                      <DialogDescription>
                        Choose a section type to add to your page
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      {SECTION_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.id}
                            variant="outline"
                            className="justify-start h-12"
                            onClick={() => handleAddSection(type.id)}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {type.name}
                          </Button>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {formData.sections.length === 0 ? (
                <div className="text-center py-8">
                  <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No sections added yet</p>
                  <Button onClick={() => setShowAddSection(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <Card key={section.id} className="border-l-4 border-l-yellow-600">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {SECTION_TYPES.find(t => t.id === section.type)?.name || section.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Order: {section.order + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveSection(section.id, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveSection(section.id, 'down')}
                                disabled={index === formData.sections.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSection(
                                  editingSection === section.id ? null : section.id
                                )}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSection(section.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {editingSection === section.id && (
                          <CardContent className="pt-0">
                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                              {section.type === 'hero' && (
                                <>
                                  <div>
                                    <Label>Hero Title</Label>
                                    <Input
                                      value={section.content?.title || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, title: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Subtitle</Label>
                                    <Textarea
                                      value={section.content?.subtitle || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, subtitle: e.target.value }
                                      })}
                                      rows={2}
                                    />
                                  </div>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <Label>Button Text</Label>
                                      <Input
                                        value={section.content?.buttonText || ''}
                                        onChange={(e) => handleSectionUpdate(section.id, {
                                          content: { ...section.content, buttonText: e.target.value }
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Button Link</Label>
                                      <Input
                                        value={section.content?.buttonLink || ''}
                                        onChange={(e) => handleSectionUpdate(section.id, {
                                          content: { ...section.content, buttonLink: e.target.value }
                                        })}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Background Image</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        value={section.content?.backgroundImage || ''}
                                        onChange={(e) => handleSectionUpdate(section.id, {
                                          content: { ...section.content, backgroundImage: e.target.value }
                                        })}
                                        placeholder="Background image URL..."
                                        className="flex-1"
                                      />
                                      <MediaLibraryModal
                                        onSelect={(file) => {
                                          handleSectionUpdate(section.id, {
                                            content: { ...section.content, backgroundImage: file.url }
                                          });
                                        }}
                                        trigger={
                                          <Button variant="outline" className="gap-2">
                                            <ImageIcon className="h-4 w-4" />
                                            Browse
                                          </Button>
                                        }
                                        title="Select Background Image"
                                      />
                                    </div>
                                    {section.content?.backgroundImage && (
                                      <div className="mt-2 relative">
                                        <img
                                          src={section.content.backgroundImage}
                                          alt="Background preview"
                                          className="w-full h-24 object-cover rounded border"
                                        />
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-1 right-1"
                                          onClick={() => handleSectionUpdate(section.id, {
                                            content: { ...section.content, backgroundImage: '' }
                                          })}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                              
                              {section.type === 'text' && (
                                <>
                                  <div>
                                    <Label>Section Title</Label>
                                    <Input
                                      value={section.content?.title || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, title: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Content</Label>
                                    <Textarea
                                      value={section.content?.text || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, text: e.target.value }
                                      })}
                                      rows={6}
                                    />
                                  </div>
                                </>
                              )}

                              {section.type === 'cta' && (
                                <>
                                  <div>
                                    <Label>CTA Title</Label>
                                    <Input
                                      value={section.content?.title || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, title: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={section.content?.text || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, text: e.target.value }
                                      })}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <Label>Button Text</Label>
                                      <Input
                                        value={section.content?.buttonText || ''}
                                        onChange={(e) => handleSectionUpdate(section.id, {
                                          content: { ...section.content, buttonText: e.target.value }
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Button Link</Label>
                                      <Input
                                        value={section.content?.buttonLink || ''}
                                        onChange={(e) => handleSectionUpdate(section.id, {
                                          content: { ...section.content, buttonLink: e.target.value }
                                        })}
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {section.type === 'image' && (
                                <>
                                  <div>
                                    <Label>Section Title</Label>
                                    <Input
                                      value={section.content?.title || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, title: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Images</Label>
                                    <div className="space-y-2">
                                      {(section.content?.images || []).map((image: any, imgIndex: number) => (
                                        <div key={imgIndex} className="flex gap-2 items-center p-2 border rounded">
                                          <img 
                                            src={image.url} 
                                            alt={image.alt || 'Image'} 
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                          <div className="flex-1">
                                            <Input
                                              placeholder="Alt text"
                                              value={image.alt || ''}
                                              onChange={(e) => {
                                                const newImages = [...(section.content?.images || [])];
                                                newImages[imgIndex] = { ...newImages[imgIndex], alt: e.target.value };
                                                handleSectionUpdate(section.id, {
                                                  content: { ...section.content, images: newImages }
                                                });
                                              }}
                                            />
                                          </div>
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                              const newImages = (section.content?.images || []).filter((_: any, i: number) => i !== imgIndex);
                                              handleSectionUpdate(section.id, {
                                                content: { ...section.content, images: newImages }
                                              });
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <MediaLibraryModal
                                        onSelect={(file) => {
                                          const newImage = {
                                            url: file.url,
                                            alt: file.alt || file.name
                                          };
                                          const currentImages = section.content?.images || [];
                                          handleSectionUpdate(section.id, {
                                            content: { ...section.content, images: [...currentImages, newImage] }
                                          });
                                        }}
                                        trigger={
                                          <Button variant="outline" className="w-full gap-2">
                                            <ImageIcon className="h-4 w-4" />
                                            Add Image
                                          </Button>
                                        }
                                        title="Add Image to Gallery"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {section.type === 'video' && (
                                <>
                                  <div>
                                    <Label>Video Title</Label>
                                    <Input
                                      value={section.content?.title || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, title: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Video URL</Label>
                                    <Input
                                      value={section.content?.videoUrl || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, videoUrl: e.target.value }
                                      })}
                                      placeholder="https://youtube.com/watch?v=..."
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={section.content?.description || ''}
                                      onChange={(e) => handleSectionUpdate(section.id, {
                                        content: { ...section.content, description: e.target.value }
                                      })}
                                      rows={3}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        )}
                        
                        {editingSection !== section.id && (
                          <CardContent className="pt-0">
                            <div className="text-sm text-muted-foreground">
                              {section.content?.title && (
                                <div className="font-medium">{section.content.title}</div>
                              )}
                              {section.content?.text && (
                                <div className="truncate">{section.content.text}</div>
                              )}
                              {section.content?.subtitle && (
                                <div className="truncate">{section.content.subtitle}</div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scheduling Panel */}
          <SchedulingPanel
            scheduledAt={formData.scheduledAt}
            onScheduleChange={(date) => handleInputChange('scheduledAt', date)}
            status={formData.status}
            onStatusChange={(status) => handleInputChange('status', status)}
          />

          {/* SEO Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SEO Score
                {seoAnalysis && (
                  <Badge variant={getSeoScoreBadgeVariant(seoAnalysis.score)}>
                    {seoAnalysis.score}/100
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/superadmin/pages/seo/${pageId}`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                SEO Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Page
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Move className="h-4 w-4 mr-2" />
                Move to Trash
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        versions={getVersionHistory()}
        onRestore={(index) => {
          jumpToVersion(index);
          setFormData(versionData);
        }}
        currentIndex={getVersionHistory().findIndex(v => v.isCurrent)}
      />
    </div>
  );
}