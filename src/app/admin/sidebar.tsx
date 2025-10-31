"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    Settings, 
    BarChart3, 
    Menu, 
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface SidebarProps {
    className?: string;
}

const menuItems = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin',
        active: true
    },
    {
        title: 'Users',
        icon: Users,
        href: '/admin/users',
        active: false
    },
    {
        title: 'Documents',
        icon: FileText,
        href: '/admin/documents',
        active: false
    },
    {
        title: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics',
        active: false
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/admin/settings',
        active: false
    }
];

export default function AdminSidebar({ className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                className
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {!isCollapsed && (
                        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.href}
                                variant={item.active ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isCollapsed && "px-2"
                                )}
                                asChild
                            >
                                <a href={item.href}>
                                    <Icon className={cn(
                                        "h-4 w-4",
                                        !isCollapsed && "mr-2"
                                    )} />
                                    {!isCollapsed && item.title}
                                </a>
                            </Button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                    {!isCollapsed && (
                        <div className="text-xs text-gray-500 text-center">
                            SmartPDFx Admin v1.0
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}