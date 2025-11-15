
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eraser, LayoutDashboard, Megaphone, FileText, PlusCircle, ChevronDown, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            isActive && "bg-muted text-primary"
        )}>
            <Icon className="h-4 w-4" />
            {children}
        </Link>
    );
};

export function Sidebar() {
    const pathname = usePathname();
    const isBlogActive = pathname.startsWith('/admin/blog');

    return (
        <div className="hidden border-r bg-background md:block w-64">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Eraser className="h-6 w-6 text-primary" />
                        <span>SmartPDFx Admin</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <NavLink href="/admin/dashboard" icon={LayoutDashboard}>
                            Dashboard
                        </NavLink>
                         <NavLink href="/admin/profile" icon={User}>
                            Profile
                        </NavLink>
                        <NavLink href="/admin/ad-place" icon={Megaphone}>
                            Ad Place
                        </NavLink>
                        <Collapsible defaultOpen={isBlogActive}>
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4" />
                                    <span>Blogs</span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-7 space-y-1">
                                <NavLink href="/admin/blog" icon={FileText}>
                                    All Posts
                                </NavLink>
                                <NavLink href="/admin/blog/new" icon={PlusCircle}>
                                    New Post
                                </NavLink>
                                {/* Comments section removed per request */}
                            </CollapsibleContent>
                        </Collapsible>
                    </nav>
                </div>
            </div>
        </div>
    );
}
