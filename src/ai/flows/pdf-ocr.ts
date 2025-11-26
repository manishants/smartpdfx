
'use server';

/**
 * @fileOverview A flow for extracting text from a PDF document (OCR).
 *
 * - pdfOcr - A function that handles extracting text from a PDF.
 * - PdfOcrInput - The input type for the pdfOcr function.
 * - PdfOcrOutput - The return type for the pdfOcr function.
 */

import { ai } from '@/ai/genkit';
import {
  PdfOcrInputSchema,
  PdfOcrOutputSchema,
  type PdfOcrInput,
  type PdfOcrOutput,
} from '@/lib/types';

export async function pdfOcr(
  input: PdfOcrInput
): Promise<PdfOcrOutput> {
  return pdfOcrFlow(input);
}

const pdfOcrFlow = ai.defineFlow(
  {
    name: 'pdfOcrFlow',
    inputSchema: PdfOcrInputSchema,
    outputSchema: PdfOcrOutputSchema,
  },
  async (input) => {
    const { pdfUri } = input;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        { text: 'Extract all text from the following PDF document. If there is no text, return an empty string.' },
        { media: { url: pdfUri } },
      ],
    });

    return {
      text: llmResponse.text,
    };
  }
);
