
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link, Copy, Check, Wand, RefreshCw } from 'lucide-react';
import { createShortLink } from '@/lib/actions/short-link';
import { AllTools } from '@/components/all-tools';

export default function ShortLinkGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [shortUrl, setShortUrl] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setShortUrl('');

        const formData = new FormData(event.currentTarget);
        const result = await createShortLink(formData);

        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else if (result.success && result.shortUrl) {
            toast({
                title: "Success",
                description: "Your short link has been created!",
            });
            setShortUrl(result.shortUrl);
        }
        setIsLoading(false);
    };

    const handleCopy = () => {
        if (!shortUrl) return;
        navigator.clipboard.writeText(shortUrl);
        setHasCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleReset = () => {
        setShortUrl('');
        formRef.current?.reset();
    }

    return (
        <>
        <div className="container mx-auto px-4 py-8 md:py-12">
             <header className="text-center">
                <h1 className="text-4xl font-bold font-headline">Short Link Generator</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Create short, memorable, and customizable links.
                </p>
            </header>
            <div className="max-w-xl mx-auto mt-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Create a new short link</CardTitle>
                        <CardDescription>Enter a long URL to shorten it. Custom slugs are optional.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {shortUrl ? (
                            <div className="space-y-4 text-center">
                                <p className="text-muted-foreground">Your short link is ready:</p>
                                <div className="relative p-4 border rounded-md bg-muted">
                                    <p className="text-lg font-mono font-bold tracking-wider truncate">
                                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{shortUrl}</a>
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1/2 right-2 -translate-y-1/2"
                                        onClick={handleCopy}
                                        title="Copy to clipboard"
                                        >
                                        {hasCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <Button onClick={handleReset} variant="outline"><RefreshCw className="mr-2"/> Create Another</Button>
                            </div>
                        ) : (
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="originalUrl">Long URL</Label>
                                    <Input 
                                        id="originalUrl" 
                                        name="originalUrl" 
                                        type="url"
                                        placeholder="https://example.com/very/long/url/to/shorten" 
                                        required 
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customSlug">Custom Slug (Optional)</Label>
                                    <div className="flex items-center">
                                        <span className="p-2 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">smartpdfx/</span>
                                        <Input 
                                            id="customSlug" 
                                            name="customSlug" 
                                            placeholder="my-cool-link" 
                                            className="rounded-l-none"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Wand className="mr-2" /> Generate Link</>}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </div>
        <AllTools />
        </>
    );
}
