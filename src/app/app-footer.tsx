
import Link from "next/link";
import { Eraser } from "lucide-react";
import { GoogleAd } from "./google-ad";

export function AppFooter() {
    return (
        <footer className="bg-muted text-muted-foreground">
            <GoogleAd />
            <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Eraser className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg text-foreground">SmartPDFx</span>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                        <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
                    </nav>
                </div>
                <div className="mt-8 text-center text-xs border-t border-border pt-4">
                    <p>&copy; {new Date().getFullYear()} SmartPDFx. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
