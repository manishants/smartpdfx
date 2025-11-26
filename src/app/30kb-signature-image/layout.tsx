import type { Metadata } from "next";
import { getPageSEO } from "@/lib/seoStore";
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = getPageSEO("/30kb-signature-image");
  const title = seo?.title?.trim();
  const description = seo?.description?.trim();
  const keywords = seo?.keywords && seo.keywords.length > 0 ? seo.keywords : undefined;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: "/30kb-signature-image" },
  };
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}