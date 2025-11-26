
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { ModernPageLayout } from '@/components/modern-page-layout';

export default function ContactUsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.error || 'Failed to send');
            toast({
                title: "Message Sent!",
                description: "Thanks for reaching out — we’ll get back shortly.",
            });
            form.reset();
        } catch (e: any) {
            toast({
                title: "Unable to send",
                description: e?.message || 'Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModernPageLayout
            title="Contact Us"
            description="Have a question, feedback, or a business inquiry? We’d love to hear from you."
            backgroundVariant="home"
        >
            <main className="max-w-2xl px-4 py-8 md:py-12 mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Contact Us</CardTitle>
                        <CardDescription>
                            Have a question, feedback, or a business inquiry? We’d love to hear from you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" required disabled={isLoading} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" name="message" required rows={6} disabled={isLoading} />
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Sending...</>) : (<><Send className="mr-2"/> Send Message</>)}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </ModernPageLayout>
    );
}
