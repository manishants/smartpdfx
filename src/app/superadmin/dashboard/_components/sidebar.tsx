"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Crown, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Globe, 
  Search, 
  ChevronDown,
  PlusCircle,
  Edit,
  Tags,
  Target,
  Code,
  User,
  Lock,
  Bell,
  Database,
  PenTool,
  Calendar,
  TrendingUp,
  Key as KeyIcon,
  LogOut,
  Mail,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const NavLink = ({ 
  href, 
  children, 
  icon: Icon 
}: { 
  href: string; 
  children: React.ReactNode; 
  icon: React.ElementType 
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href} 
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-all duration-200 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:shadow-sm",
        isActive && "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-md hover:from-yellow-600 hover:to-orange-600"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
        isActive && "text-white"
      )} />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

export function SuperadminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isBlogActive = pathname.startsWith('/superadmin/blog');
  const isPageActive = pathname.startsWith('/superadmin/pages');
  const isSEOActive = pathname.startsWith('/superadmin/seo') || pathname.startsWith('/superadmin/pages/seo');

  const handleLogout = async () => {
    try {
      // Attempt to sign out Supabase user if present
      await supabase.auth.signOut();
    } catch {}

    // Redirect to login
    router.push('/superadmin/login');
  };

  return (
    <div className="hidden md:block w-72 border-r bg-gradient-to-b from-white to-slate-50 shadow-lg sticky top-0 h-screen">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b border-slate-200 px-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <Link href="/" className="group flex items-center gap-3 font-bold text-slate-800 hover:text-slate-900 transition-colors duration-200">
            <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">SmartPDFx CMS</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium space-y-2">
            <NavLink href="/superadmin/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            
            {/* Analytics */}
            <NavLink href="/superadmin/analytics" icon={TrendingUp}>
              Analytics
            </NavLink>

            {/* Blog Management */}
            <div className="mt-4">
              <Collapsible defaultOpen={isBlogActive}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                      <PenTool className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-semibold">Blog Management</span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <NavLink href="/superadmin/blog" icon={FileText}>
                    All Posts
                  </NavLink>
                  <NavLink href="/superadmin/blog/create" icon={PlusCircle}>
                    Create Post
                  </NavLink>
                  <NavLink href="/superadmin/blog/drafts" icon={Edit}>
                    Drafts
                  </NavLink>
                  <NavLink href="/superadmin/blog/scheduled" icon={Calendar}>
                    Scheduled Posts
                  </NavLink>
                  <NavLink href="/superadmin/blog/categories" icon={Tags}>
                    Categories & Tags
                  </NavLink>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Page Management */}
            <div className="mt-2">
              <Collapsible defaultOpen={isPageActive}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:text-slate-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-sm [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                      <Globe className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-semibold">Page Builder</span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <NavLink href="/superadmin/pages" icon={Globe}>
                    All Pages
                  </NavLink>
                  <NavLink href="/superadmin/pages/create" icon={PlusCircle}>
                    Create Page
                  </NavLink>
                  <NavLink href="/superadmin/pages/tools" icon={PenTool}>
                    Edit Tool Pages
                  </NavLink>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Sections Manager removed: Use Page Builder to edit page content and sections */}

            {/* SEO Tools */}
            <div className="mt-2">
              <Collapsible defaultOpen={isSEOActive}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-slate-700 transition-all duration-200 hover:text-slate-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:shadow-sm [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                      <Search className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-semibold">SEO Tools</span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-8 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <NavLink href="/superadmin/pages/seo" icon={Globe}>
                    Page SEO Manager
                  </NavLink>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Settings & Profile */}
            <div className="border-t border-slate-200 pt-4 mt-6 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                System & Settings
              </div>
              
              {/* Activity Logs removed per request */}
              
              <NavLink href="/superadmin/profile" icon={User}>
                Profile Settings
              </NavLink>
              
              <NavLink href="/superadmin/security" icon={Lock}>
                Security Settings
              </NavLink>
              
              <NavLink href="/superadmin/notifications" icon={Bell}>
                Notifications
              </NavLink>

              <NavLink href="/superadmin/newsletter" icon={Mail}>
                Newsletter Subscribers
              </NavLink>
              
              <NavLink href="/superadmin/database" icon={Database}>
                Database Management
              </NavLink>

              <NavLink href="/superadmin/settings/api-key" icon={KeyIcon}>
                API Key
              </NavLink>
              
              <NavLink href="/superadmin/export" icon={Download}>
                Export Data
              </NavLink>

              <NavLink href="/superadmin/settings" icon={Settings}>
                System Settings
              </NavLink>
            </div>

            {/* Logout */}
            <div className="pt-4 mt-4 border-t">
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}