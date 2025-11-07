import { getAllComments, moderateComment, deleteComment } from '@/app/actions/comments';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  const comments = await getAllComments();

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Blogs', href: '/admin/blog' }, { label: 'Comments' }]} />
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Blog Comments</h1>
          <p className="text-muted-foreground">Review, verify, or delete comments. Spam is auto-flagged if links are detected.</p>
        </header>

        {comments.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No comments yet</h2>
            <p className="text-muted-foreground mt-2">New comments will appear here for moderation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span>{c.name} ({c.email})</span>
                    <Badge variant={c.status === 'approved' ? 'default' : c.status === 'spam' ? 'destructive' : 'secondary'}>{c.status}</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Post: <span className="font-mono">{c.blog_slug}</span> • {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                    {c.link_url && (
                      <p className="text-xs">Link: <a className="text-primary hover:underline" href={c.link_url} target="_blank" rel="noreferrer noopener">{c.link_url}</a></p>
                    )}
                    <div className="flex items-center gap-2">
                      <form action={moderateComment}>
                        <input type="hidden" name="id" value={String(c.id)} />
                        <input type="hidden" name="blogSlug" value={c.blog_slug} />
                        <input type="hidden" name="status" value="approved" />
                        <button type="submit" className="rounded-md bg-green-600 text-white px-3 py-1 text-sm hover:opacity-90">Verify</button>
                      </form>
                      <form action={moderateComment}>
                        <input type="hidden" name="id" value={String(c.id)} />
                        <input type="hidden" name="blogSlug" value={c.blog_slug} />
                        <input type="hidden" name="status" value="spam" />
                        <button type="submit" className="rounded-md bg-yellow-600 text-white px-3 py-1 text-sm hover:opacity-90">Mark Spam</button>
                      </form>
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={String(c.id)} />
                        <input type="hidden" name="blogSlug" value={c.blog_slug} />
                        <button type="submit" className="rounded-md bg-red-600 text-white px-3 py-1 text-sm hover:opacity-90">Delete</button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}