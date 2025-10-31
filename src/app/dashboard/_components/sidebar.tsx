"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    FileText, 
    Edit, 
    Image, 
    FilePlus, 
    FileOutput, 
    Settings, 
    Heart,
    Home,
    Scissors,
    Lock,
    Unlock,
    FileSignature,
    RotateCw,
    Trash2,
    PenTool,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
interface NavLinkProps {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
}
const NavLink = ({ href, icon: Icon, children, className }: NavLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 transition-all",
                isActive 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-100",
                className
            )}
        >
            <Icon className="h-5 w-5" />
            <span>{children}</span>
        </Link>
    );
};
export function UserSidebar() {
    return (
        <div className="hidden border-r border-gray-200 bg-white md:block w-64">
            <div className="flex h-full max-h-screen flex-col">
                <div className="flex h-16 items-center border-b border-gray-200 px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="bg-blue-600 text-white p-1 rounded">
                            <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold">SmartPDFx</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-3">
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 mb-2 px-3 uppercase">Main</p>
                        <nav className="grid items-start text-sm font-medium">
                            <NavLink href="/dashboard" icon={LayoutDashboard}>
                                Dashboard
                            </NavLink>
                        </nav>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 mb-2 px-3 uppercase">PDF Tools</p>
                        <nav className="grid items-start text-sm font-medium">
                            <NavLink href="/dashboard/edit-pdf" icon={Edit}>
                                Edit PDF
                            </NavLink>
                            <NavLink href="/dashboard/merge-pdf" icon={FilePlus}>
                                Merge PDF
                            </NavLink>
                            <NavLink href="/dashboard/compress-pdf" icon={FileOutput}>
                                Compress PDF
                            </NavLink>
                            <NavLink href="/dashboard/pdf-to-word" icon={FileText}>
                                PDF to Word
                            </NavLink>
                            <NavLink href="/dashboard/protect-pdf" icon={Lock}>
                                Protect PDF
                            </NavLink>
                            <NavLink href="/dashboard/unlock-pdf" icon={Unlock}>
                                Unlock PDF
                            </NavLink>
                            <NavLink href="/dashboard/e-sign" icon={FileSignature}>
                                E-Sign PDF
                            </NavLink>
                            <NavLink href="/dashboard/rotate-pdf" icon={RotateCw}>
                                Rotate PDF
                            </NavLink>
                            <NavLink href="/dashboard/delete-pdf-pages" icon={Trash2}>
                                Delete Pages
                            </NavLink>
                        </nav>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-xs font-medium text-gray-400 mb-2 px-3 uppercase">Account</p>
                        <nav className="grid items-start text-sm font-medium">
                            <NavLink href="/dashboard/favorites" icon={Heart}>
                                Favorites
                            </NavLink>
                            <NavLink href="/dashboard/settings" icon={Settings}>
                                Settings
                            </NavLink>
                            <NavLink href="/dashboard/profile" icon={User}>
                                Profile
                            </NavLink>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
