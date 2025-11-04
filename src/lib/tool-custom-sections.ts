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
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}