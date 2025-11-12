"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Crown, Loader2 } from 'lucide-react';
// Supabase removed: local-only authentication

export default function SuperadminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);

        try {
            // Local superadmin login only
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
            toast({ title: 'Login Successful', description: 'Welcome to SuperAdmin Dashboard!' });
            router.push('/superadmin/dashboard');
            return;
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4">
            <Card className="w-full max-w-md shadow-2xl border-0">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Crown className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            SuperAdmin Portal
                        </CardTitle>
                        <CardDescription className="text-base">
                            Enter your credentials to access the SuperAdmin dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="superadmin@smartpdfx.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-12"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pt-6">
                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin"/> 
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Crown className="mr-2 h-5 w-5" /> 
                                    Access SuperAdmin
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}