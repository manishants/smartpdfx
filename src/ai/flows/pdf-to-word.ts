
'use server';

/**
 * @fileOverview A flow for converting a PDF to an editable Word document.
 * - pdfToWord - Converts a PDF to a DOCX file by extracting text.
 */

import { ai } from '@/ai/genkit';
import {
  PdfToWordInputSchema,
  PdfToWordOutputSchema,
  type PdfToWordInput,
  type PdfToWordOutput,
} from '@/lib/types';
import { Document, Packer, Paragraph } from 'docx';

export async function pdfToWord(
  input: PdfToWordInput
): Promise<PdfToWordOutput> {
  return pdfToWordFlow(input);
}

const pdfToWordFlow = ai.defineFlow(
  {
    name: 'pdfToWordFlow',
    inputSchema: PdfToWordInputSchema,
    outputSchema: PdfToWordOutputSchema,
  },
  async (input) => {
    // Step 1: Use AI to extract text from the PDF
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        {text: `Extract all text from the following PDF document. Preserve the paragraph structure and line breaks as accurately as possible.`},
        {media: {url: input.pdfUri}}
      ],
    });

    const extractedText = llmResponse.text;

    if (!extractedText) {
        throw new Error("The AI model failed to extract any text from the PDF.");
    }
    
    // Step 2: Create a Word document from the extracted text
    const paragraphs = extractedText
        .split('\n')
        .map(line => new Paragraph(line));

    const doc = new Document({
        sections: [{ children: paragraphs }],
    });

    const buffer = await Packer.toBuffer(doc);
    const base64 = buffer.toString('base64');

    const docxUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
    
    return {
      docxUri,
    };
  }
);
