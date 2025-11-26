export interface ToolHowtoStep {
  title: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface ToolHowtoData {
  name: string;
  description?: string;
  steps: ToolHowtoStep[];
  updatedAt?: string; // ISO string
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const data: Record<string, ToolHowtoData | null> = require('@/data/tool-howto.json');

export const toolHowtoFallback: Record<string, ToolHowtoData | null> = data || {};