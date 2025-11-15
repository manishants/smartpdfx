export type SectionType = 'A' | 'B';

export interface SectionButton {
  text: string;
  href: string;
}

export interface ToolCustomSectionData {
  type: SectionType;
  heading: string;
  paragraph: string;
  image: {
    src: string;
    alt: string;
  };
  buttons?: SectionButton[]; // up to two buttons
  updatedAt?: string; // ISO string for auditing
}

// Import JSON at build-time so content is part of the static output
// eslint-disable-next-line @typescript-eslint/no-var-requires
const data: Record<string, ToolCustomSectionData[] | null> = require('@/data/tool-custom-sections.json');

export const toolCustomSections: Record<string, ToolCustomSectionData[] | null> = data || {};

// Helper: determine if a URL is external (http/https/mailto/tel)
export function isExternalUrl(url: string) {
  // mailto/tel are always external for our purposes
  if (/^(mailto:|tel:)/i.test(url)) return true;

  // Relative paths are internal
  if (/^\/(?!\/)/.test(url)) return false;

  // Absolute URLs: treat same-origin as internal
  try {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : undefined);
    const parsed = new URL(url, currentOrigin || 'http://localhost');
    if (currentOrigin) {
      return parsed.origin !== currentOrigin;
    }
    // If we don't know current origin (SSR fallback), assume internal when NEXT_PUBLIC_SITE_URL matches
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;
      return parsed.origin !== siteOrigin;
    }
    // Conservative default: treat as external
    return /^(https?:)/i.test(parsed.protocol);
  } catch {
    // If URL cannot be parsed, default to internal to avoid adding noreferrer to internal links
    return false;
  }
}