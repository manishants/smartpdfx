'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterForm({ category }: { category: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Subscribed! Check your inbox to confirm.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <form onSubmit={onSubmit} aria-label={`Subscribe to ${category} newsletter`} className="space-y-3">
      <label htmlFor="newsletter-email" className="text-sm font-medium">Email address</label>
      <Input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-describedby="newsletter-help"
      />
      <p id="newsletter-help" className="text-xs text-muted-foreground">You’ll receive updates for {category} posts.</p>
      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white"
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </Button>
      {message && (
        <p role="status" className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
      )}
    </form>
  );
}