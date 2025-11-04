
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Zap, Star, Heart, Mail, MapPin, Phone, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppFooter() {
    return (
        <footer className="relative bg-gradient-to-br from-background via-background/95 to-muted/30 border-t border-border/40">
            {/* AI-Enhanced Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.08),transparent_50%)]" />
            
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute top-20 right-20 w-1 h-1 bg-blue-500/30 rounded-full animate-ping" />
            <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-purple-500/20 rounded-full animate-bounce" />

            <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <Image
                                    src="/smartpdf_logo.png"
                                    alt="SmartPDFx"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 transition-transform hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-sm opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <span className="font-bold text-2xl bg-gradient-to-r from-[#fa812f] via-[#8239e5] to-[#ff4e4e] bg-clip-text text-transparent">
                                    SmartPDFx
                                </span>
                                <Badge variant="secondary" className="ml-2 px-2 py-1 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 text-primary font-medium">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI-Powered
                                </Badge>
                            </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                            The most advanced online toolkit for PDFs, images, and documents. Transform, enhance, and optimize your files with cutting-edge AI technology.
                        </p>
                        
                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-foreground">50+</span>
                                <span className="text-muted-foreground">Tools</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-500" />
                                <span className="font-semibold text-foreground">AI-Powered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="font-semibold text-foreground">Free</span>
                                <span className="text-muted-foreground">to Use</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Quick Links
                        </h3>
                        <nav className="flex flex-col gap-3 text-sm">
                            <Link href="/pdf-to-word" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                PDF to Word
                            </Link>
                            <Link href="/jpg-to-pdf" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                JPG to PDF
                            </Link>

                            <Link href="/compress-pdf" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                Compress PDF
                            </Link>
                            <Link href="/photo-enhancer" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                AI Photo Enhancer
                            </Link>
                        </nav>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary" />
                            Company
                        </h3>
                        <nav className="flex flex-col gap-3 text-sm">
                            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                About Us
                            </Link>
                            <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                Blog
                            </Link>
                            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                Contact Us
                            </Link>
                            <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                Privacy Policy
                            </Link>
                            <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                Terms & Conditions
                            </Link>
                            <Link href="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200">
                                Disclaimer
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-border/50 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <p>&copy; {new Date().getFullYear()} SmartPDFx. All rights reserved.</p>
                            <div className="hidden md:flex items-center gap-1">
                                <span>Made with</span>
                                <Heart className="h-3 w-3 text-red-500 fill-current" />
                                <span>for productivity</span>
                            </div>
                        </div>
                        
                        {/* AI Badge + Socials */}
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="px-3 py-1 bg-gradient-to-r from-primary/5 to-blue-600/5 border-primary/20 text-primary">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Powered by AI
                            </Badge>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Follow us</span>
                                <div className="flex items-center gap-2">
                                    <a href="https://facebook.com/smartpdfx" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 hover:from-primary/20 hover:to-blue-600/20 hover:scale-105 transition">
                                        <Facebook className="h-4 w-4 text-primary" />
                                    </a>
                                    <a href="https://instagram.com/smartpdfx" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 hover:from-primary/20 hover:to-blue-600/20 hover:scale-105 transition">
                                        <Instagram className="h-4 w-4 text-primary" />
                                    </a>
                                    <a href="https://youtube.com/@smartpdfx" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 hover:from-primary/20 hover:to-blue-600/20 hover:scale-105 transition">
                                        <Youtube className="h-4 w-4 text-primary" />
                                    </a>
                                    <a href="https://x.com/smartpdfx" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 hover:from-primary/20 hover:to-blue-600/20 hover:scale-105 transition">
                                        <Twitter className="h-4 w-4 text-primary" />
                                    </a>
                                    <a href="https://linkedin.com/company/smartpdfx" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 hover:from-primary/20 hover:to-blue-600/20 hover:scale-105 transition">
                                        <Linkedin className="h-4 w-4 text-primary" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
