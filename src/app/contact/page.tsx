
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Send } from 'lucide-react';

export default function ContactUsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We will get back to you shortly.",
        });

        (event.target as HTMLFormElement).reset();
        setIsLoading(false);
    };

    return (
        <main className="max-w-2xl px-4 py-8 md:py-12 mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl mt-4">Contact Us</CardTitle>
                    <CardDescription>
                        Have a question, feedback, or a business inquiry? We'd love to hear from you.
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
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Sending...</> : <><Send className="mr-2"/> Send Message</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
