
'use server';

import {
  type OcrPdfToSearchablePdfInput,
  type OcrPdfToSearchablePdfOutput,
  OcrPageInputSchema,
  OcrPageOutputSchema,
  type OcrPageInput,
  type OcrPageOutput,
} from '@/lib/types';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// This is the individual page processor that the client will call.
export async function ocrPdfPage(
  input: OcrPageInput
): Promise<OcrPageOutput> {
  const { imageUri, language } = input;
  
  const OcrResultSchema = z.array(z.object({
    text: z.string().describe("The detected text content."),
    box: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
    }),
  }));

  const findTextOnPagePrompt = ai.definePrompt({
      name: 'findTextOnPagePrompt',
      model: 'googleai/gemini-2.0-flash',
      input: { schema: OcrPageInputSchema },
      output: { schema: OcrResultSchema },
      prompt: `You are an expert OCR system. Analyze the provided image of a document page in the specified language: {{{language}}}. Identify ALL text blocks. For each text block, provide its bounding box (x, y, width, height) and the exact text content. The origin (0,0) is the top-left corner of the page.
  
Image: {{media url=imageUri}}`,
  });

  const { output: ocrResults } = await findTextOnPagePrompt({ imageUri, language });
  
  if (!ocrResults) {
      throw new Error("AI model failed to process the page image.");
  }
  
  return { ocrResults };
}


// The main function is now deprecated as the orchestration happens on the client.
// It is kept for type reference but will not be called.
export async function ocrPdfToSearchablePdf(
  input: OcrPdfToSearchablePdfInput
): Promise<OcrPdfToSearchablePdfOutput> {
  throw new Error("This function is deprecated. The process is now orchestrated on the client.");
}

