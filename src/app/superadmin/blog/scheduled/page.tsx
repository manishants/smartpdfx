"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import type { BlogPost } from '@/types/cms';
import { cmsStore } from '@/lib/cms/store';

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const all = await cmsStore.getAllPosts();
      setPosts(all.filter(p => p.status === 'scheduled'));
    } catch (e) {
      console.error('Error loading scheduled posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = posts.filter(p => {
    const q = searchTerm.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });

  const handleDeletePost = async (postId: string) => {
    if (confirm('Delete this post?')) {
      try {
        await cmsStore.deletePost(postId);
        await loadPosts();
      } catch (e) {
        console.error('Error deleting post:', e);
      }
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      await cmsStore.updatePost(postId, { ...post, status: 'published', scheduledAt: undefined });
      await loadPosts();
    } catch (e) {
      console.error('Error publishing scheduled post:', e);
    }
  };

  const handleUnschedule = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      await cmsStore.updatePost(postId, { ...post, status: 'draft', scheduledAt: undefined });
      await loadPosts();
    } catch (e) {
      console.error('Error unscheduling post:', e);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Scheduled Posts
          </h1>
          <p className="text-gray-600 mt-1">Manage posts scheduled for future publishing</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-xl">
          <Link href="/superadmin/blog/create">Create New Post</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Input placeholder="Search scheduled posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">SEO Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Scheduled For</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No scheduled posts found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="h-14 w-20 overflow-hidden rounded-md border bg-muted">
                          {post.featuredImage ? (
                            <Image src={post.featuredImage} alt={post.title} width={80} height={56} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">{post.metaDescription || 'No description'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{post.author}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">scheduled</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className={`font-medium ${getSeoScoreColor(post.seoScore || 0)}`}>{post.seoScore || 0}/100</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : '-'}</div>
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
                            <DropdownMenuItem onClick={() => handlePublishNow(post.id)}>
                              Publish now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUnschedule(post.id)}>
                              Unschedule (move to Drafts)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-600">
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