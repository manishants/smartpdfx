
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        try {
            const resp = await fetch('/api/auth/local-login', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                toast({ title: 'Login Failed', description: data?.error || 'Invalid credentials', variant: 'destructive' });
                setIsLoading(false);
                return;
            }
            toast({ title: 'Login Successful', description: 'Redirecting to the admin dashboard...' });
            window.location.href = '/admin/dashboard';
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
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
