"use client";
import type { BlogPost } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsletterForm } from '@/components/newsletter-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import DonateDialog from '@/components/donate-dialog';

export function BlogRightSidebar({ post }: { post: BlogPost }) {
  const category = post.category || 'general';

  const hasSupportInfo = Boolean(post.supportQrUrl || post.upiId);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <div className="space-y-6 lg:sticky lg:top-24" aria-label="Right sidebar">
      {/* Removed sidebar ad per request */}

      {/* Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribe</CardTitle>
        </CardHeader>
        <CardContent>
          <NewsletterForm category={category} />
        </CardContent>
      </Card>

      {/* Support The Author */}
      <Card>
        <CardHeader>
          <CardTitle>{post.supportLabel || 'Buy a Cup of Coffee for me'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasSupportInfo ? (
            <>
              {post.supportQrUrl && (
                <div className="flex justify-center">
                  <Image
                    src={post.supportQrUrl}
                    alt="Support QR Code"
                    width={200}
                    height={200}
                    className="rounded-md border"
                  />
                </div>
              )}
              {post.upiId && (
                <div className="text-sm">
                  <div className="font-medium">UPI ID</div>
                  <div className="text-muted-foreground break-all">{post.upiId}</div>
                </div>
              )}
              {/* PayPal UI removed per request */}
              <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white" onClick={() => setIsDonateOpen(true)}>
                Buy a Cup of Coffee for me
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">If you find our tools helpful, consider supporting our work.</p>
              <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white" onClick={() => setIsDonateOpen(true)}>
                Buy a Cup of Coffee for me
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Support popup matching homepage behavior */}
      <DonateDialog
        isOpen={isDonateOpen}
        onOpenChange={setIsDonateOpen}
        upiId={post.upiId || undefined}
        qrUrl={post.supportQrUrl || undefined}
        title={post.supportLabel || 'Buy a Cup of Coffee for me'}
      />
    </div>
  );
}