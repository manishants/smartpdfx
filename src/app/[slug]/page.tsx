
import { getOriginalUrl } from '@/lib/actions/short-link';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function ShortLinkRedirectPage({ params }: { params: { slug: string } }) {
    if (!params.slug) {
        notFound();
    }

    const originalUrl = await getOriginalUrl(params.slug);

    if (originalUrl) {
        redirect(originalUrl);
    }
    
    // If the slug doesn't exist, show a "not found" page instead of a 404
    // This allows the main layout to still be rendered.
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="mt-4 text-2xl">Short Link Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        The link <code className="bg-muted px-1 py-0.5 rounded-sm font-mono text-sm">{params.slug}</code> does not exist or has been removed.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
