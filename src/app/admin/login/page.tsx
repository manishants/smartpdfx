
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // In a real application, this would be a secure API call.
        // For this demo, we use hardcoded credentials.
        if (username === 'blowkida' && password === 'Rn5manish') {
            toast({
                title: "Login Successful",
                description: "Redirecting to the admin dashboard...",
            });
            // Simulate a short delay for the toast to be visible
            setTimeout(() => {
                router.push('/admin/dashboard');
            }, 1000);
        } else {
            toast({
                title: "Login Failed",
                description: "Invalid username or password.",
                variant: "destructive",
            });
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
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                            {isLoading ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
