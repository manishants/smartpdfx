'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  PenTool, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';
import { BlogPost } from '@/types/cms';
import { cmsStore } from '@/lib/cms/store';

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const uniqueCategories = Array.from(new Set(posts.flatMap(p => p.categories || []))).filter(Boolean);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, statusFilter, categoryFilter]);

  const loadPosts = async () => {
    try {
      const allPosts = await cmsStore.getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        (post.focusKeyword?.toLowerCase().includes(q) ?? false)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.categories.includes(categoryFilter));
    }

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await cmsStore.deletePost(postId);
        await loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleStatusChange = async (postId: string, newStatus: 'draft' | 'published' | 'scheduled') => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const updatedPost = { ...post, status: newStatus };
        await cmsStore.updatePost(postId, updatedPost);
        await loadPosts();
      }
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'scheduled': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    avgSeoScore: posts.length > 0 
      ? Math.round(posts.reduce((sum, p) => sum + (p.seoScore || 0), 0) / posts.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-yellow-600" />
            Blog Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage your blog posts with SEO optimization
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
          <Link href="/superadmin/blog/create">
            <PenTool className="h-4 w-4 mr-2" />
            Create New Post
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSeoScoreColor(stats.avgSeoScore)}`}>
              {stats.avgSeoScore}/100
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts by title, content, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.length === 0 ? (
                  <SelectItem value="general">General</SelectItem>
                ) : (
                  uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">SEO Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No posts found. Create your first blog post to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="h-14 w-20 overflow-hidden rounded-md border bg-muted">
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              width={80}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {post.metaDescription || 'No description'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{post.author}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className={`font-medium ${getSeoScoreColor(post.seoScore || 0)}`}>
                          {post.seoScore || 0}/100
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">{post.views?.toLocaleString() || 0}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/superadmin/blog/edit/${post.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(post.id, 
                                post.status === 'published' ? 'draft' : 'published'
                              )}
                            >
                              {post.status === 'published' ? 'Unpublish' : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}