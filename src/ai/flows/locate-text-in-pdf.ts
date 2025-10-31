
'use server';

/**
 * @fileOverview A flow for finding text within a PDF document using multimodal OCR.
 * - locateTextInPdf - Finds occurrences of specified text on each page of a PDF.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const LocationSchema = z.object({
  box: z.object({
    x: z.number().describe('The x-coordinate of the top-left corner of the bounding box.'),
    y: z.number().describe('The y-coordinate of the top-left corner of the bounding box.'),
    width: z.number().describe('The width of the bounding box.'),
    height: z.number().describe('The height of the bounding box.'),
  }),
  text: z.string().describe('The actual text found at this location.'),
});

const LocateTextInPdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A PDF document as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  textToFind: z.string().describe('The text string to locate within the PDF.'),
});
export type LocateTextInPdfInput = z.infer<typeof LocateTextInPdfInputSchema>;

const LocateTextInPdfOutputSchema = z.array(LocationSchema);
export type LocateTextInPdfOutput = z.infer<typeof LocateTextInPdfOutputSchema>;


export async function locateTextInPdf(
  input: LocateTextInPdfInput
): Promise<LocateTextInPdfOutput> {
  return locateTextInPdfFlow(input);
}

const locateTextPrompt = ai.definePrompt({
  name: 'locateTextPrompt',
  input: { schema: LocateTextInPdfInputSchema },
  output: { schema: LocateTextInPdfOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an OCR expert. Your task is to find all occurrences of the text that looks like a 12-digit Aadhar number in the provided PDF document.
  
The Aadhar number is a sequence of 12 digits, often formatted as XXXX XXXX XXXX. The text to find is: "{{textToFind}}"

For each occurrence, provide the bounding box coordinates (x, y, width, height) of the entire 12-digit number and the text itself. The origin (0,0) for coordinates should be the top-left corner of the page.

If you do not find any occurrences, return an empty array.

Document: {{media url=pdfUri}}`,
});


const locateTextInPdfFlow = ai.defineFlow(
  {
    name: 'locateTextInPdfFlow',
    inputSchema: LocateTextInPdfInputSchema,
    outputSchema: LocateTextInPdfOutputSchema,
  },
  async (input) => {
    const { output } = await locateTextPrompt(input);
    // If the model returns nothing, return an empty array to prevent errors.
    if (!output) {
      return [];
    }
    return output;
  }
);
