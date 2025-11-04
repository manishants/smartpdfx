
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Eraser, Grid, Heart, ChevronDown, LogIn, Star, Wand2, LogOut, UserCircle, Sparkles, Compass, Wrench, FileText, FileImage, Scissors, FileJson, Search, Zap, TrendingUp, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { tools, toolCategories } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { ThemeSwitcher } from './theme-switcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
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

const SmartSearchDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        
        return tools.filter(tool => 
            tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8);
    }, [searchQuery]);
    
    const popularTools = useMemo(() => {
        return tools.filter(tool => ['pdf-to-word', 'jpg-to-pdf', 'merge-pdf', 'compress-pdf'].includes(tool.href.replace('/', '')));
    }, []);
    
    const handleToolSelect = (tool: any) => {
        const newSearch = tool.title;
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s !== newSearch);
            return [newSearch, ...filtered].slice(0, 5);
        });
        onOpenChange(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0">
                <div className="border-b p-4">
                    <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search tools, features, or file types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 text-base"
                            autoFocus
                        />
                    </div>
                </div>
                
                <ScrollArea className="max-h-[400px] p-4">
                    {searchQuery.trim() ? (
                        <div className="space-y-2">
                            {searchResults.length > 0 ? (
                                searchResults.map(tool => (
                                    <Link
                                        key={tool.title}
                                        href={tool.href}
                                        prefetch={false}
                                        onClick={() => handleToolSelect(tool)}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-600/10">
                                            <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium group-hover:text-primary transition-colors">{tool.title}</div>
                                            <div className="text-sm text-muted-foreground">{tool.description}</div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {toolCategories.find(cat => cat.id === tool.category)?.name}
                                        </Badge>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No tools found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recentSearches.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Recent Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map(search => (
                                            <Badge
                                                key={search}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-accent"
                                                onClick={() => setSearchQuery(search)}
                                            >
                                                {search}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Popular Tools
                                </h3>
                                <div className="grid gap-2">
                                    {popularTools.map(tool => (
                                        <Link
                                            key={tool.title}
                                            href={tool.href}
                                            prefetch={false}
                                            onClick={() => handleToolSelect(tool)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-600/10">
                                                <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium group-hover:text-primary transition-colors">{tool.title}</div>
                                                <div className="text-sm text-muted-foreground">{tool.description}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

const ToolsMegaMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Exclude AI tools from the general "Tools" menu
    const nonAiTools = tools.filter(tool => tool.category !== 'ai');
    const nonAiCategories = toolCategories.filter(cat => cat.id !== 'ai');

    return (
        <PopoverContent className="w-screen max-w-none mx-0 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-white/10 shadow-2xl" align="center" side="bottom" sideOffset={8}>
            <ScrollArea className="max-h-[80vh] h-auto sm:h-[550px]">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-4 sm:gap-y-6 pr-2 sm:pr-4 lg:pr-6">
                        {nonAiCategories.map(category => (
                            <div key={category.id} className="flex flex-col space-y-2 sm:space-y-3">
                                <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 pb-1 sm:pb-2 border-b border-border/50 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2">
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
                                    {category.name}
                                </h3>
                                <div className="space-y-1">
                                    {nonAiTools.filter(tool => tool.category === category.id).map(tool => (
                                        <Link
                                            href={tool.href}
                                            key={tool.title}
                                            passHref
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 hover:text-accent-foreground cursor-pointer transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]">
                                                <div className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-600/10 group-hover:from-primary/20 group-hover:to-blue-600/20 transition-all duration-300 group-hover:rotate-3">
                                                    <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 group-hover:scale-110" style={{ color: tool.color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs sm:text-sm font-medium transition-colors block truncate group-hover:text-primary">{tool.title}</span>
                                                    <span className="text-xs text-muted-foreground mt-0.5 block truncate group-hover:text-muted-foreground/80 hidden sm:block">{tool.description}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </PopoverContent>
    );
};

const AIToolsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const aiTools = tools.filter(t => t.category === 'ai');

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95"
                >
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary animate-pulse group-hover:animate-spin" />
                    <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-semibold">AI Tools</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:rotate-180" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-4 sm:p-6 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-white/10 shadow-2xl" align="start" side="bottom" sideOffset={8}>
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">AI-Powered Tools</h3>
                    </div>
                    {aiTools.map(tool => (
                        <Link
                            href={tool.href}
                            key={tool.title}
                            passHref
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 text-xs sm:text-sm font-medium text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 hover:text-accent-foreground cursor-pointer transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]">
                                <div className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-600/10 group-hover:from-primary/20 group-hover:to-blue-600/20 transition-all duration-300 group-hover:rotate-3">
                                    <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 group-hover:scale-110" style={{ color: tool.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs sm:text-sm font-medium transition-colors block truncate group-hover:text-primary">{tool.title}</span>
                                    <span className="text-xs text-muted-foreground mt-0.5 block truncate group-hover:text-muted-foreground/80 hidden sm:block">{tool.description}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

const MobileNav = ({ onClose }: { onClose: () => void }) => {
    return (
        <SheetContent side="left">
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                    <Eraser className="h-6 w-6 text-primary" />
                    <span>SmartPDFx</span>
                </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)] w-full pr-4">
                <div className="flex flex-col space-y-4 py-4">
                    <Link href="/" onClick={onClose} className="text-lg font-medium">Home</Link>

                    {/* Popular Tools Section */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-2 mt-4 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Popular Tools
                        </h3>
                        <div className="flex flex-col space-y-2">
                            <Link href="/pdf-to-word" onClick={onClose} className="flex items-center gap-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                <FileText className="h-5 w-5" />
                                <span>PDF to Word</span>
                            </Link>
                            <Link href="/jpg-to-pdf" onClick={onClose} className="flex items-center gap-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                <FileImage className="h-5 w-5" />
                                <span>JPG to PDF</span>
                            </Link>
                        </div>
                    </div>

                    {toolCategories.map(category => (
                        <div key={category.id}>
                            <h3 className="font-semibold text-foreground mb-2 mt-4">{category.name}</h3>
                            <div className="flex flex-col space-y-2">
                                {tools.filter(tool => tool.category === category.id).map(tool => (
                                    <Link href={tool.href} key={tool.title} onClick={onClose} className="flex items-center gap-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
  
  const upiId = "manishants@ybl";
  const paypalId = "manishants@gmail.com";

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
                  src="/qr.jpg"
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
    
    return null;
}


export function AppHeader() {
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    const [isDonateOpen, setIsDonateOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (pathname.startsWith('/admin')) {
      return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-14 items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end gap-2">
              <ThemeSwitcher />
              <AuthArea />
            </div>
          </div>
        </header>
      );
    }


    return (
        <>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Mobile Navigation */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="hover:bg-accent">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <MobileNav onClose={() => setIsMobileMenuOpen(false)} />
                </Sheet>

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                        <Image
                          src="/smartpdf_logo.png"
                          alt="SmartPDFx"
                          width={32}
                          height={32}
                          className="h-8 w-8 transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#fa812f]/20 to-[#8239e5]/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="hidden font-bold text-xl bg-gradient-to-r from-[#fa812f] via-[#8239e5] to-[#ff4e4e] bg-clip-text text-transparent sm:inline-block">
                        SmartPDFx
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                    <AIToolsMenu />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95">
                                <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary group-hover:rotate-12 transition-transform duration-300" />
                                <span className="font-semibold">Tools</span>
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:rotate-180" />
                            </Button>
                        </PopoverTrigger>
                        <ToolsMegaMenu />
                    </Popover>

                    {/* Popular Tools */}
                    <Button variant="ghost" asChild className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95">
                        <Link href="/pdf-to-word">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-semibold">PDF to Word</span>
                        </Link>
                    </Button>

                    <Button variant="ghost" asChild className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95">
                        <Link href="/jpg-to-pdf">
                            <FileImage className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-semibold">JPG to PDF</span>
                        </Link>
                    </Button>

                    <Button variant="ghost" asChild className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95">
                        <Link href="/merge-pdf">
                            <FileJson className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-semibold">Merge PDF</span>
                        </Link>
                    </Button>



                    <Button variant="ghost" asChild className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-foreground hover:text-accent-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-primary/10 transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 active:scale-95">
                        <Link href="/#tools">
                            <Compass className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-semibold">Explore</span>
                        </Link>
                    </Button>
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(true)}
                        className="relative hover:bg-accent/50 transition-colors group"
                    >
                        <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="sr-only">Search Tools</span>
                    </Button>
                    
                    <ThemeSwitcher />
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDonateOpen(true)}
                        className="relative hover:bg-accent/50 transition-colors group"
                    >
                        <Heart className="h-4 w-4 fill-current text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="sr-only">Support Us</span>
                    </Button>

                    <AuthArea />
                </div>
            </div>
        </header>
        <SmartSearchDialog isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
        <DonateDialog isOpen={isDonateOpen} onOpenChange={setIsDonateOpen} />
        </>
    );
}
