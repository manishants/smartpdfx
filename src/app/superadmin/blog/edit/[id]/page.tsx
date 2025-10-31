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
  Save, 
  Eye, 
  Send, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Hash,
  FileText,
  Trash2,
  Image
} from 'lucide-react';
import { BlogPost, BlogPostForm, SEOData } from '@/types/cms';
import { cmsStore } from '@/lib/cms/store';
import { SEOAnalyzer } from '@/lib/seo/analyzer';
import { MediaLibraryModal } from '@/components/media-library';

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [originalPost, setOriginalPost] = useState<BlogPost | null>(null);
  
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
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      score: 0,
      issues: [],
      suggestions: []
    },
    scheduledAt: undefined
  });

  const [seoAnalysis, setSeoAnalysis] = useState<SEOData | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  // Load existing post
  useEffect(() => {
    const loadPost = async () => {
      try {
        const post = await cmsStore.getPost(postId);
        if (post) {
          setOriginalPost(post);
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || '',
            author: post.author,
            status: post.status,
            categories: post.categories,
            tags: post.tags,
            featuredImage: post.featuredImage || '',
            seo: post.seo,
            scheduledAt: post.scheduledAt
          });
          setLastSaved(new Date(post.updatedAt));
        } else {
          router.push('/superadmin/blog');
        }
      } catch (error) {
        console.error('Error loading post:', error);
        router.push('/superadmin/blog');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, router]);

  // SEO Analysis
  useEffect(() => {
    if (formData.title || formData.content || formData.seo.metaDescription) {
      const analyzer = new SEOAnalyzer();
      const analysis = analyzer.analyzePage({
        title: formData.seo.metaTitle || formData.title,
        metaDescription: formData.seo.metaDescription,
        content: formData.content,
        focusKeyword: formData.seo.focusKeyword,
        url: formData.slug
      });
      
      setSeoAnalysis(analysis);
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, ...analysis }
      }));
    }
  }, [formData.title, formData.content, formData.seo.metaTitle, formData.seo.metaDescription, formData.seo.focusKeyword]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (originalPost && (formData.title !== originalPost.title || formData.content !== originalPost.content)) {
        setAutoSaving(true);
        try {
          // Save as draft to localStorage
          const draftKey = `blog_edit_${postId}`;
          localStorage.setItem(draftKey, JSON.stringify(formData));
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    };

    const timer = setTimeout(autoSave, 3000);
    return () => clearTimeout(timer);
  }, [formData, originalPost, postId]);

  const handleInputChange = (field: keyof BlogPostForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSeoChange = (field: keyof SEOData, value: any) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleSave = async (status?: 'draft' | 'published' | 'scheduled') => {
    setSaving(true);
    try {
      const updateData: Partial<BlogPost> = {
        ...formData,
        status: status || formData.status,
        publishedAt: status === 'published' && originalPost?.status !== 'published' 
          ? new Date() 
          : originalPost?.publishedAt
      };

      await cmsStore.updatePost(postId, updateData);
      
      // Clear auto-save draft
      localStorage.removeItem(`blog_edit_${postId}`);
      
      router.push('/superadmin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await cmsStore.deletePost(postId);
        router.push('/superadmin/blog');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
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

  if (!originalPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/superadmin/blog')}>
            Back to Blog Manager
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
              <FileText className="h-8 w-8 text-yellow-600" />
              Edit Post
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">
                {autoSaving ? 'Auto-saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
              </p>
              {autoSaving && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            {originalPost.status === 'published' ? 'Update' : 'Publish'}
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="content">Content *</Label>
                      <div className="flex gap-2">
                        <MediaLibraryModal
                          onSelect={(file) => {
                            const imageMarkdown = `![${file.alt || file.name}](${file.url})`;
                            const newContent = formData.content + '\n\n' + imageMarkdown;
                            handleInputChange('content', newContent);
                          }}
                          trigger={
                            <Button variant="outline" size="sm" className="gap-2">
                              <Image className="h-4 w-4" />
                              Add Image
                            </Button>
                          }
                          title="Insert Image"
                        />
                      </div>
                    </div>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Write your blog post content here..."
                      rows={15}
                      className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.content.length} characters, ~{Math.ceil(formData.content.split(' ').length / 200)} min read
                    </p>
                  </div>
                </>
              ) : (
                <div className="prose max-w-none">
                  <h1>{formData.title || 'Untitled Post'}</h1>
                  {formData.excerpt && (
                    <p className="lead text-muted-foreground">{formData.excerpt}</p>
                  )}
                  <div className="whitespace-pre-wrap">
                    {formData.content || 'No content yet...'}
                  </div>
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
                            {seoAnalysis.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                {issue}
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
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(originalPost.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(originalPost.updatedAt).toLocaleDateString()}</span>
              </div>
              {originalPost.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published:</span>
                  <span>{new Date(originalPost.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views:</span>
                <span>{originalPost.views?.toLocaleString() || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Publish Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <Label htmlFor="scheduledAt">Publish Date</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              )}

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
                  {['Technology', 'Business', 'Lifestyle', 'Health', 'Education'].map((category) => (
                    <Badge
                      key={category}
                      variant={formData.categories.some(c => c.name === category) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const exists = formData.categories.some(c => c.name === category);
                        if (exists) {
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.filter(c => c.name !== category)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            categories: [...prev.categories, { id: category.toLowerCase(), name: category }]
                          }));
                        }
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.map(t => t.name).join(', ')}
                  onChange={(e) => {
                    const tagNames = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    const tags = tagNames.map(name => ({ id: name.toLowerCase(), name }));
                    handleInputChange('tags', tags);
                  }}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="Image URL or upload..."
                  className="flex-1"
                />
                <MediaLibraryModal
                  onSelect={(file) => {
                    handleInputChange('featuredImage', file.url);
                  }}
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Image className="h-4 w-4" />
                      Browse
                    </Button>
                  }
                  title="Select Featured Image"
                />
              </div>
              {formData.featuredImage && (
                <div className="relative">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleInputChange('featuredImage', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}