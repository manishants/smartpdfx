
'use server';

/**
 * @fileOverview A flow for converting a PDF to a PowerPoint document.
 * - pdfToPpt - Converts a PDF to a PPTX file.
 */

import { ai } from '@/ai/genkit';
import {
  PdfToPptInputSchema,
  PdfToPptOutputSchema,
  type PdfToPptInput,
  type PdfToPptOutput,
} from '@/lib/types';

export async function pdfToPpt(
  input: PdfToPptInput
): Promise<PdfToPptOutput> {
  return pdfToPptFlow(input);
}

const pdfToPptFlow = ai.defineFlow(
  {
    name: 'pdfToPptFlow',
    inputSchema: PdfToPptInputSchema,
    outputSchema: PdfToPptOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        {text: `Please convert the following PDF document into a Microsoft PowerPoint (PPTX) file. Each page of the PDF should become a separate slide. Preserve the layout, text, images, and tables as accurately as possible.`},
        {media: {url: input.pdfUri}}
      ],
      output: {
        format: 'pptx',
      },
    });

    if (!output || !output.media || !output.media.url) {
        throw new Error("The AI model failed to convert the PDF to a PowerPoint document.");
    }
    
    return {
      pptxUri: output.media.url,
    };
  }
);
