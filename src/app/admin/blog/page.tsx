
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getBlogs } from "@/app/actions/blog";

export default async function AllPostsPage() {
    const posts = await getBlogs();

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Posts</CardTitle>
                        <CardDescription>You have {posts.length} post(s). Manage, edit, or delete them from here.</CardDescription>
                    </div>
                     <Button asChild>
                        <Link href="/admin/blog/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Post
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {posts.length > 0 ? (
                        <div className="space-y-4">
                        {posts.map((post) => (
                           <div key={post.slug} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                             <Image 
                                src={post.imageUrl}
                                alt={post.title}
                                width={120}
                                height={80}
                                className="rounded-md object-cover"
                             />
                             <div className="flex-1">
                                <h3 className="font-bold text-lg">{post.title}</h3>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                   <span>By {post.author}</span>
                                   <Badge variant="outline">{new Date(post.date).toLocaleDateString()}</Badge>
                                </div>
                                <div className="flex gap-2 mt-3">
                                     <Button variant="outline" size="sm">Edit</Button>
                                     <Button variant="destructive" size="sm">Delete</Button>
                                     <Link href={`/blog/${post.slug}`} className="text-sm text-primary hover:underline ml-auto inline-flex items-center" target="_blank">
                                        View Post &rarr;
                                     </Link>
                                </div>
                             </div>
                           </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                           <h3 className="text-lg font-semibold">No posts yet</h3>
                           <p className="text-muted-foreground mt-1">Click "Create New Post" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
