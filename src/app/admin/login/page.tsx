
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    useEffect(() => {
        // This is the standard and correct way to initialize the client-side Supabase client.
        setSupabase(createClient());
    }, []);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        try {
            const canUseSupabase = supabase && typeof (supabase as any).auth?.signInWithPassword === 'function';

            if (canUseSupabase) {
                const { error } = await (supabase as any).auth.signInWithPassword({
                    email,
                    password,
                });

                if (!error) {
                    toast({ title: "Login Successful", description: "Redirecting to the admin dashboard..." });
                    window.location.href = '/admin/dashboard';
                    return;
                }

                // If Supabase is not configured, fall through to cookie-based login
                if (String(error?.message || '').includes('Supabase not configured')) {
                    // continue to fallback
                } else {
                    toast({ title: "Login Failed", description: error.message, variant: "destructive" });
                    setIsLoading(false);
                    return;
                }
            }

            // Fallback cookie-based login when Supabase is disabled
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json?.ok) {
                toast({ title: "Login Successful", description: "Redirecting to the admin dashboard..." });
                window.location.href = '/admin/dashboard';
                return;
            }
            const message = json?.error || 'Login failed';
            toast({ title: 'Login Failed', description: message, variant: 'destructive' });
            setIsLoading(false);
        } catch (err: any) {
            toast({ title: 'Login Failed', description: err?.message || 'Unexpected error', variant: 'destructive' });
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-8 md:py-12 flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Admin Login</CardTitle>
                        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading || !supabase}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading || !supabase}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading || !supabase}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
