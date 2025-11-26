import type { Metadata } from "next";
import HomeClient from "./_components/home-client";
import { getPageSEO } from "@/lib/seoStore";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getPageSEO("/");
  const title = seo?.title?.trim();
  const description = seo?.description?.trim();
  const keywords = seo?.keywords && seo.keywords.length > 0 ? seo.keywords : undefined;
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: "/" },
  };
}

export default function Home() {
  return <HomeClient />;
}