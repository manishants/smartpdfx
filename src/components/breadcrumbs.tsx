
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                {items.map((item, index) => (
                    <Fragment key={item.label}>
                        <li>
                            {item.href ? (
                                <Link href={item.href} className="hover:text-primary transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="font-medium text-foreground">{item.label}</span>
                            )}
                        </li>
                        {index < items.length - 1 && (
                            <li>
                                <ChevronRight className="h-4 w-4" />
                            </li>
                        )}
                    </Fragment>
                ))}
            </ol>
        </nav>
    );
}
