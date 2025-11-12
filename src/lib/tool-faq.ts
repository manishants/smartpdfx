export interface ToolFaqItem {
  question: string;
  answer: string;
  updatedAt?: string; // ISO string
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const data: Record<string, ToolFaqItem[] | null> = require('@/data/tool-faq.json');

export const toolFaqFallback: Record<string, ToolFaqItem[] | null> = data || {};