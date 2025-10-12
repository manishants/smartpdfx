
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Eraser, Grid, Heart, ChevronDown, LogIn, Star, Wand2, LogOut, UserCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { tools, toolCategories } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { ThemeSwitcher } from './theme-switcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';


const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary" : "text-muted-foreground", className)}>
            {children}
        </Link>
    );
};

const ToolsMegaMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Exclude AI tools from the general "All Tools" menu
    const nonAiTools = tools.filter(tool => tool.category !== 'ai');
    const nonAiCategories = toolCategories.filter(cat => cat.id !== 'ai');

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                    <Grid className="mr-2 h-4 w-4" /> All Tools <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-7xl mx-auto p-6 lg:p-8" align="center">
                <ScrollArea className="max-h-[80vh] h-[550px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4 pr-6">
                        {nonAiCategories.map(category => (
                            <div key={category.id} className="flex flex-col space-y-2">
                                <h3 className="text-sm font-semibold text-foreground mb-2">{category.name}</h3>
                                {nonAiTools.filter(tool => tool.category === category.id).map(tool => (
                                    <Link
                                        href={tool.href}
                                        key={tool.title}
                                        passHref
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center gap-3 rounded-md p-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                            <tool.icon className="h-5 w-5 transition-colors" style={{ color: tool.color }} />
                                            <span className="text-sm font-medium transition-colors">{tool.title}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

const AIToolsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const aiTools = tools.filter(t => t.category === 'ai');

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                 <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                    <Wand2 className="mr-2 h-4 w-4" /> AI Tools <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
                <div className="flex flex-col space-y-1">
                    {aiTools.map(tool => (
                         <Link
                            href={tool.href}
                            key={tool.title}
                            passHref
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex items-center gap-3 rounded-md p-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                                <span className="text-sm font-medium">{tool.title}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Eraser className="h-6 w-6 text-primary" />
                        <span>SmartPDFx</span>
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)] w-full pr-4">
                    <div className="flex flex-col space-y-4 py-4">
                        <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</Link>
                        {toolCategories.map(category => (
                             <div key={category.id}>
                                <h3 className="font-semibold text-foreground mb-2 mt-4">{category.name}</h3>
                                <div className="flex flex-col space-y-2">
                                {tools.filter(tool => tool.category === category.id).map(tool => (
                                    <Link href={tool.href} key={tool.title} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                        <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                                        <span>{tool.title}</span>
                                    </Link>
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

function DonateDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [upiCopied, setUpiCopied] = useState(false);
  const [paypalCopied, setPaypalCopied] = useState(false);

  const copyToClipboard = (text: string, setter: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };
  
  const upiId = "your-upi-id@okhdfcbank";
  const paypalId = "your-paypal-email@example.com";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Support SmartPDFx</DialogTitle>
          <DialogDescription className="text-center">
            Your contributions help keep this service free. Thank you!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center gap-4">
             <div className="p-2 bg-white rounded-lg border">
                <Image
                  src="https://placehold.co/200x200.png"
                  alt="Scan to pay"
                  width={200}
                  height={200}
                  data-ai-hint="qr code"
                />
            </div>
             <p className="text-sm font-medium text-muted-foreground">Scan QR Code to Pay with any UPI App</p>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="upiId" className="font-semibold">UPI ID</Label>
             <div className="flex items-center gap-2">
              <Input id="upiId" value={upiId} readOnly />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(upiId, setUpiCopied)}>
                {upiCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="paypalId" className="font-semibold">PayPal</Label>
             <div className="flex items-center gap-2">
              <Input id="paypalId" value={paypalId} readOnly />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(paypalId, setPaypalCopied)}>
                 {paypalCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

const AuthArea = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setIsLoading(false);
        };
        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
            }
        );
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
        });
        window.location.href = '/';
    };
    
    if (isLoading) {
        return <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />;
    }

    if (user) {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <UserCircle className="mr-2 h-4 w-4"/>
                        Account
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/admin/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    
    return (
        <Button variant="outline" asChild>
            <Link href="/admin/login">
                <LogIn className="mr-2 h-4 w-4"/>
                Login
            </Link>
        </Button>
    )
}


export function AppHeader() {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [isDonateOpen, setIsDonateOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    {isClient && isMobile ? (
                        <div className="md:hidden mr-2">
                            <MobileNav />
                        </div>
                    ) : null}
                    <Link href="/" className="flex items-center space-x-2">
                        <Eraser className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">SmartPDFx</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
                    <AIToolsMenu />
                    <ToolsMegaMenu />
                </nav>
                
                <div className="flex items-center justify-end gap-2">
                     <ThemeSwitcher />
                     <Button onClick={() => setIsDonateOpen(true)}>
                        <Heart className="mr-2 h-4 w-4 fill-current"/>
                        Donate ₹ 1
                     </Button>
                      <AuthArea />
                </div>
            </div>
            <DonateDialog isOpen={isDonateOpen} onOpenChange={setIsDonateOpen} />
        </header>
    );
}
