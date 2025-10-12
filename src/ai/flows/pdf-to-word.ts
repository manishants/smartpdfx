
'use server';

import {
  PdfToWordInputSchema,
  PdfToWordOutputSchema,
  type PdfToWordInput,
  type PdfToWordOutput,
  WordContentSchema,
} from '@/lib/types';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Packer, Document, Paragraph, TextRun } from 'docx';

const ContentItemSchema = z.object({
  text: z.string().describe('The text content.'),
  bold: z.boolean().optional().describe('Whether the text is bold.'),
  italic: z.boolean().optional().describe('Whether the text is italic.'),
  color: z
    .string()
    .optional()
    .describe('The hex color of the text (e.g., #000000).'),
  fontSize: z.number().optional().describe('The font size of the text.'),
});

const pdfToWordFlow = ai.defineFlow(
  {
    name: 'pdfToWordFlow',
    inputSchema: PdfToWordInputSchema,
    outputSchema: z.object({
      content: z.array(ContentItemSchema),
    }),
  },
  async (input) => {
    const { pdfUri } = input;
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: [
        {
          text: `Analyze the following PDF document. Your task is to extract all text content while preserving its structure and styling. For each piece of text, provide:
          1. The text content itself.
          2. Whether the text is bold (true/false).
          3. Whether the text is italic (true/false).
          4. The font size (as a number).
          5. The color of the text in hexadecimal format (e.g., #RRGGBB).
          Return this as a structured array of content objects. Pay close attention to the order of the text as it appears on the page.`,
        },
        { media: { url: pdfUri } },
      ],
      output: {
        schema: z.object({
          content: z.array(ContentItemSchema),
        }),
      },
    });

    const output = llmResponse.output();
    if (!output) {
      throw new Error('The AI failed to process the PDF content.');
    }
    return output;
  }
);

export async function pdfToWord(
  input: PdfToWordInput
): Promise<PdfToWordOutput> {
  const result = await pdfToWordFlow(input);

  const paragraphs = result.content.map(
    (item) =>
      new Paragraph({
        children: [
          new TextRun({
            text: item.text,
            bold: item.bold,
            italics: item.italic,
            color: item.color?.substring(1), // Remove '#' from hex
            size: item.fontSize ? item.fontSize * 2 : 22, // Convert to half-points
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);
  const docxUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBuffer.toString(
    'base64'
  )}`;

  return { docxUri };
}
