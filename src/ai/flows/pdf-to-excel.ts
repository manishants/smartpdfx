
'use server';

/**
 * @fileOverview A flow for converting a PDF to an Excel document.
 * - pdfToExcel - Converts a PDF to an XLSX file.
 */

import { ai } from '@/ai/genkit';
import {
  PdfToExcelInputSchema,
  PdfToExcelOutputSchema,
  type PdfToExcelInput,
  type PdfToExcelOutput,
} from '@/lib/types';

export async function pdfToExcel(
  input: PdfToExcelInput
): Promise<PdfToExcelOutput> {
  return pdfToExcelFlow(input);
}

const pdfToExcelFlow = ai.defineFlow(
  {
    name: 'pdfToExcelFlow',
    inputSchema: PdfToExcelInputSchema,
    outputSchema: PdfToExcelOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        {text: `Please convert the tables within the following PDF document into a Microsoft Excel (XLSX) file. Each table should be placed on a separate sheet. Preserve the data and structure of the tables as accurately as possible.`},
        {media: {url: input.pdfUri}}
      ],
      output: {
        format: 'xlsx',
      },
    });

    if (!output || !output.media || !output.media.url) {
        throw new Error("The AI model failed to convert the PDF to an Excel document.");
    }
    
    return {
      excelUri: output.media.url,
    };
  }
);
