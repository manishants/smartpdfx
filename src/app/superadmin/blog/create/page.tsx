'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { MediaLibraryModal } from '@/components/media-library';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BlogTOC, type TOCHeading } from '@/components/blog/BlogTOC';
import { BlogRightSidebar } from '@/components/blog/BlogRightSidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  Eye, 
  Send,
  Calendar, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Hash,
  FileText,
  History,
  Undo,
  Redo,
  Clock
} from 'lucide-react';
import { BlogPost, BlogPostForm, SEOData, Category, SEOIssue } from '@/types/cms';
import { cmsStore } from '@/lib/cms/store';
import { SEOAnalyzer } from '@/lib/seo/analyzer';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useVersionControl } from '@/hooks/use-version-control';
import { VersionHistoryModal } from '@/components/cms/version-history-modal';
import { SchedulingPanel } from '@/components/cms/scheduling-panel';

export default function CreateBlogPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [slugAuto, setSlugAuto] = useState(true);
  
  const [formData, setFormData] = useState<BlogPostForm>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    status: 'draft',
    categories: [],
    tags: [],
    featuredImage: '',
    featuredImageAlt: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      score: 0,
      issues: [],
      suggestions: []
    },
    scheduledAt: undefined,
    layoutSettings: {
      showBreadcrumbs: true,
      leftSidebarEnabled: true,
      rightSidebarEnabled: true,
      leftSticky: false,
      tocFontSize: 'text-sm',
      tocH3Indent: 12,
      tocHoverColor: 'hover:text-primary'
    }
  });

  const [seoAnalysis, setSeoAnalysis] = useState<SEOData | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [showTocMobile, setShowTocMobile] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  // Version control
  const {
    currentData: versionData,
    saveVersion,
    undo,
    redo,
    canUndo,
    canRedo,
    getVersionHistory,
    jumpToVersion
  } = useVersionControl(formData, { maxVersions: 20 });

  // Auto-save functionality
  const {
    isSaving: autoSaving,
    lastSaved,
    hasUnsavedChanges,
    forceSave
  } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      // Save to localStorage as draft
      const draftKey = `blog_draft_${Date.now()}`;
      localStorage.setItem(draftKey, JSON.stringify(data));
      
      // Save version for history
      saveVersion(data, `Auto-save at ${new Date().toLocaleTimeString()}`);
    },
    interval: 10000, // Auto-save every 10 seconds
    enabled: !!(formData.title || formData.content)
  });

  // Utility to slugify strings consistently
  const slugify = (str: string) => str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Auto-generate slug from title while user hasn't manually edited slug
  useEffect(() => {
    if (slugAuto) {
      const next = slugify(formData.title || '');
      setFormData(prev => ({ ...prev, slug: next }));
    }
  }, [formData.title, slugAuto]);

  // Load available categories for selection
  useEffect(() => {
    (async () => {
      const cats = await cmsStore.getAllCategories();
      setAvailableCategories(cats);
    })();
  }, []);

  // Auto-generate meta title from title
  useEffect(() => {
    if (formData.title && !formData.seo.metaTitle) {
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, metaTitle: formData.title }
      }));
    }
  }, [formData.title]);

  // Auto-generate meta description from excerpt if empty
  useEffect(() => {
    if (formData.excerpt && !formData.seo.metaDescription) {
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, metaDescription: formData.excerpt }
      }));
    }
  }, [formData.excerpt]);

  // Derive featuredImageAlt from URL when missing
  useEffect(() => {
    if (formData.featuredImage && !formData.featuredImageAlt) {
      const url = String(formData.featuredImage || '');
      const base = (url.split('/').pop() || '').replace(/\.[^.]+$/, '');
      const altDefault = base.replace(/[-_]+/g, ' ').toLowerCase();
      setFormData(prev => ({ ...prev, featuredImageAlt: altDefault }));
    }
  }, [formData.featuredImage]);

  // SEO Analysis
  useEffect(() => {
    if (formData.title || formData.content || formData.seo.metaDescription) {
      const analyzer = new SEOAnalyzer(
        formData.content || '',
        (formData.seo.metaTitle || formData.title || ''),
        (formData.seo.metaDescription || ''),
        (formData.seo.focusKeyword || '')
      );
      const analysis = analyzer.analyze();

      setSeoAnalysis(analysis);
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, ...analysis }
      }));
    }
  }, [formData.title, formData.content, formData.seo.metaTitle, formData.seo.metaDescription, formData.seo.focusKeyword]);

  const handleInputChange = (field: keyof BlogPostForm, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Save version for significant changes
    if (field === 'title' || field === 'content' || field === 'excerpt') {
      saveVersion(newData, `Updated ${field}`);
    }

    // If user edits the slug manually, stop auto-updating until cleared
    if (field === 'slug') {
      const val = typeof value === 'string' ? value : '';
      if (val.trim().length === 0) {
        setSlugAuto(true);
      } else {
        setSlugAuto(false);
        // normalize slug input
        setFormData(prev => ({ ...prev, slug: slugify(val) }));
      }
    }
  };

  const handleSeoChange = (field: keyof SEOData, value: any) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleLayoutChange = (key: keyof NonNullable<BlogPostForm['layoutSettings']>, value: any) => {
    setFormData(prev => ({
      ...prev,
      layoutSettings: { ...(prev.layoutSettings || {}), [key]: value }
    }));
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled') => {
    setLoading(true);
    try {
      // Flatten nested SEO fields when constructing post data
      const { seo, ...rest } = formData;
      const postData: Partial<BlogPost> = {
        ...rest,
        status,
        publishedAt: status === 'published' ? new Date() : undefined,
        views: 0,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        canonicalUrl: seo.canonicalUrl,
        focusKeyword: seo.focusKeyword
      };

      const savedPost = await cmsStore.createPost(postData);
      
      // Clear auto-save drafts
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('blog_draft_')) {
          localStorage.removeItem(key);
        }
      });

      router.push('/superadmin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-yellow-600" />
              Create New Post
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <p className="text-white-600 text-sm">
                  {autoSaving ? 'Auto-saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
                </p>
                {autoSaving && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>}
                {hasUnsavedChanges && !autoSaving && (
                  <Badge variant="outline" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}
              </div>
              
              {/* Version Control */}
              <div className="flex items-center gap-1">
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
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Post Content</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === 'edit' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('edit')}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={previewMode === 'preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('preview')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewMode === 'edit' ? (
                <>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter your blog post title..."
                      className="text-lg font-semibold"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      URL: /blog/{formData.slug || 'your-post-slug'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief description of your post..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <WysiwygEditor
                      value={formData.content}
                      onChange={(html) => handleInputChange('content', html)}
                      height={500}
                      placeholder="Write or paste your content, add images, embeds, tables, etc."
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.content.replace(/<[^>]*>/g, '').length} characters, ~{Math.ceil(formData.content.replace(/<[^>]*>/g, ' ').split(' ').filter(Boolean).length / 200)} min read
                    </p>
                  </div>
                </>
              ) : (
                <div className="max-w-none">
                  {(() => {
                    const html = formData.content || '';
                    const addIdsAndExtract = (h: string): { contentWithIds: string; headings: TOCHeading[] } => {
                      let contentWithIds = h;
                      const headings: TOCHeading[] = [];
                      const slugify = (str: string) => str
                        .toLowerCase()
                        .replace(/<[^>]*>/g, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                      const process = (tag: 'h2' | 'h3') => {
                        const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gi');
                        contentWithIds = contentWithIds.replace(regex, (full, inner) => {
                          const text = String(inner).replace(/<[^>]*>/g, '').trim();
                          const id = slugify(text);
                          headings.push({ id, text, level: tag === 'h2' ? 2 : 3 });
                          if (full.includes(' id=')) return full;
                          return full.replace(`<${tag}`, `<${tag} id="${id}"`);
                        });
                      };
                      process('h2');
                      process('h3');
                      return { contentWithIds, headings };
                    };

                    const { contentWithIds, headings } = addIdsAndExtract(html);
                    const categoryName = Array.isArray(formData.categories) && formData.categories[0] ? formData.categories[0] : 'General';
                    const breadcrumbItems = [
                      { label: 'Home', href: '/' },
                      { label: 'Blog', href: '/blog' },
                      ...(formData.layoutSettings?.showBreadcrumbs && categoryName
                        ? [{ label: categoryName, href: `/blog?category=${encodeURIComponent(categoryName)}` }]
                        : []),
                      { label: formData.title || 'Untitled Post' },
                    ];
                    const fontSizeClass = formData.layoutSettings?.tocFontSize || 'text-sm';
                    const h3Indent = formData.layoutSettings?.tocH3Indent ?? 12;
                    const hoverClass = formData.layoutSettings?.tocHoverColor || 'hover:text-primary';
                    const sticky = !!formData.layoutSettings?.leftSticky;
                    const mockPost: any = {
                      title: formData.title || 'Untitled Post',
                      category: categoryName,
                    };

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {formData.layoutSettings?.leftSidebarEnabled && headings.length > 0 && (
                          <aside className="hidden md:block md:col-span-3">
                            <BlogTOC
                              headings={headings}
                              sticky={sticky}
                              fontSizeClass={fontSizeClass}
                              h3Indent={h3Indent}
                              hoverClass={hoverClass}
                            />
                          </aside>
                        )}
                        <main className={formData.layoutSettings?.rightSidebarEnabled && formData.layoutSettings?.leftSidebarEnabled ? 'md:col-span-6' : formData.layoutSettings?.leftSidebarEnabled || formData.layoutSettings?.rightSidebarEnabled ? 'md:col-span-9' : 'md:col-span-12'}>
                          {formData.layoutSettings?.showBreadcrumbs && (
                            <div className="mb-4">
                              <Breadcrumbs items={breadcrumbItems} />
                            </div>
                          )}
                          <article className="prose max-w-none">
                            <h1 className="text-3xl font-bold">{formData.title || 'Untitled Post'}</h1>
                            {formData.excerpt && (
                              <p className="mt-2 text-muted-foreground">{formData.excerpt}</p>
                            )}
                            <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
                          </article>
                        </main>
                        {formData.layoutSettings?.rightSidebarEnabled && (
                          <aside className="md:col-span-3">
                            <BlogRightSidebar post={mockPost} />
                          </aside>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SEO Settings
                {seoAnalysis && (
                  <Badge variant={getSeoScoreBadgeVariant(seoAnalysis.score)}>
                    {seoAnalysis.score}/100
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                  <TabsTrigger value="preview">Search Preview</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.seo.metaTitle}
                      onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
                      placeholder="SEO title for search engines..."
                      maxLength={60}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.seo.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.seo.metaDescription}
                      onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                      placeholder="Brief description for search results..."
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.seo.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="focusKeyword">Focus Keyword</Label>
                    <Input
                      id="focusKeyword"
                      value={formData.seo.focusKeyword}
                      onChange={(e) => handleSeoChange('focusKeyword', e.target.value)}
                      placeholder="Main keyword to optimize for..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
                    <Input
                      id="canonicalUrl"
                      value={formData.seo.canonicalUrl}
                      onChange={(e) => handleSeoChange('canonicalUrl', e.target.value)}
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold mb-2">Google Search Preview</h3>
                    <div className="space-y-1">
                      <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {formData.seo.metaTitle || formData.title || 'Untitled Post'}
                      </div>
                      <div className="text-green-700 text-sm">
                        https://yoursite.com/blog/{formData.slug || 'post-slug'}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {formData.seo.metaDescription || formData.excerpt || 'No description available...'}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  {seoAnalysis && (
                    <>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-semibold">SEO Score: </span>
                        <span className={`font-bold ${getSeoScoreColor(seoAnalysis.score)}`}>
                          {seoAnalysis.score}/100
                        </span>
                      </div>

                      {seoAnalysis.issues.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            Issues to Fix
                          </h4>
                          <ul className="space-y-1">
                            {seoAnalysis.issues.map((issue: SEOIssue, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                {issue.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {seoAnalysis.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4" />
                            Suggestions
                          </h4>
                          <ul className="space-y-1">
                            {seoAnalysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Word Count:</span> {seoAnalysis.wordCount}
                        </div>
                        <div>
                          <span className="font-medium">Reading Time:</span> ~{Math.ceil(seoAnalysis.wordCount / 200)} min
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
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

          {/* Author Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Author Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Categories & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(availableCategories.length ? availableCategories.map(c => c.name) : ['Technology', 'Business', 'Lifestyle', 'Health', 'Education']).map((category) => (
                    <Badge
                      key={category}
                      variant={formData.categories.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const exists = formData.categories.includes(category);
                        setFormData(prev => ({
                          ...prev,
                          categories: exists
                            ? prev.categories.filter(c => c !== category)
                            : [...prev.categories, category]
                        }));
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (press Enter to add, max 20)</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const name = tagInput.trim();
                      if (!name) return;
                      if (formData.tags.includes(name)) {
                        setTagInput('');
                        return;
                      }
                      if (formData.tags.length >= 20) return;
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, name] }));
                      setTagInput('');
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-2">
                        {t}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }))}
                          title="Remove"
                          className="ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="Image URL or upload..."
                />
                <MediaLibraryModal
                  title="Select Featured Image"
                  onSelect={(file: any) => {
                    handleInputChange('featuredImage', file.url);
                    const providedAlt = (file.alt || '').trim();
                    if (!formData.featuredImageAlt) {
                      if (providedAlt) {
                        setFormData(prev => ({ ...prev, featuredImageAlt: providedAlt }));
                      } else {
                        const url = String(file.url || '');
                        const base = (url.split('/').pop() || '').replace(/\.[^.]+$/, '');
                        const altDefault = base.replace(/[-_]+/g, ' ').toLowerCase();
                        setFormData(prev => ({ ...prev, featuredImageAlt: altDefault }));
                      }
                    }
                  }}
                  trigger={<Button variant="outline" size="sm">Browse</Button>}
                />
              </div>
              {formData.featuredImage && (
                <div className="mt-2">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="breadcrumbs">Show Breadcrumbs</Label>
                <Switch
                  id="breadcrumbs"
                  checked={!!formData.layoutSettings?.showBreadcrumbs}
                  onCheckedChange={(val) => handleLayoutChange('showBreadcrumbs', val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="leftSidebar">Enable Left Sidebar (TOC)</Label>
                <Switch
                  id="leftSidebar"
                  checked={!!formData.layoutSettings?.leftSidebarEnabled}
                  onCheckedChange={(val) => handleLayoutChange('leftSidebarEnabled', val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="leftSticky">Left Sidebar Sticky (desktop)</Label>
                <Switch
                  id="leftSticky"
                  checked={!!formData.layoutSettings?.leftSticky}
                  onCheckedChange={(val) => handleLayoutChange('leftSticky', val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="rightSidebar">Enable Right Sidebar</Label>
                <Switch
                  id="rightSidebar"
                  checked={!!formData.layoutSettings?.rightSidebarEnabled}
                  onCheckedChange={(val) => handleLayoutChange('rightSidebarEnabled', val)}
                />
              </div>

              <div>
                <Label htmlFor="tocFontSize">TOC Font Size</Label>
                <Select
                  value={formData.layoutSettings?.tocFontSize || 'text-sm'}
                  onValueChange={(val) => handleLayoutChange('tocFontSize', val)}
                >
                  <SelectTrigger id="tocFontSize" className="mt-1">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-xs">Small</SelectItem>
                    <SelectItem value="text-sm">Default</SelectItem>
                    <SelectItem value="text-base">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tocIndent">H3 Indent (px)</Label>
                <Input
                  id="tocIndent"
                  type="number"
                  min={0}
                  value={formData.layoutSettings?.tocH3Indent ?? 12}
                  onChange={(e) => handleLayoutChange('tocH3Indent', parseInt(e.target.value || '0', 10))}
                />
              </div>

              <div>
                <Label htmlFor="tocHover">TOC Hover Color</Label>
                <Select
                  value={formData.layoutSettings?.tocHoverColor || 'hover:text-primary'}
                  onValueChange={(val) => handleLayoutChange('tocHoverColor', val)}
                >
                  <SelectTrigger id="tocHover" className="mt-1">
                    <SelectValue placeholder="Select hover color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hover:text-primary">Primary</SelectItem>
                    <SelectItem value="hover:text-blue-600">Blue</SelectItem>
                    <SelectItem value="hover:text-emerald-600">Green</SelectItem>
                    <SelectItem value="hover:text-rose-600">Rose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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