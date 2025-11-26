'use server';

/**
 * AI-enabled PDF to Excel converter.
 * - no_ocr: uses local LibreOffice converter for fast export.
 * - ai_ocr: uses Gemini OCR to extract tables/text and builds XLSX.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { PdfToExcelInput, PdfToExcelOutput } from '@/lib/types';
import { PdfToExcelInputSchema, PdfToExcelOutputSchema } from '@/lib/types';
import { pdfToExcel as pdfToExcelNoOcr } from '@/lib/actions/pdf-to-excel';
import * as XLSX from 'xlsx';

const TableSchema = z.array(z.array(z.string()));

const PdfToExcelAiOutputSchema = z.object({
  tables: z.array(TableSchema).optional().describe('Array of tables, each as rows of cell strings.'),
  lines: z.array(z.string()).optional().describe('Fallback: lines of text if no clear tables found.'),
});

const pdfToExcelPrompt = ai.definePrompt({
  name: 'pdfToExcelPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: z.object({ pdfUri: z.string() }) },
  output: { schema: PdfToExcelAiOutputSchema },
  prompt: `Analyze the following PDF and extract data suitable for an Excel spreadsheet.

Return structured TABLES whenever possible. For each table, return rows as arrays of strings, preserving the reading order.
If no tables are present, return a list of text LINES, one per line, to place in a single-column sheet.

Document:
{{media url=pdfUri}}`,
});

const pdfToExcelPrompt15 = ai.definePrompt({
  name: 'pdfToExcelPrompt15',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: z.object({ pdfUri: z.string() }) },
  output: { schema: PdfToExcelAiOutputSchema },
  prompt: `Analyze the following PDF and extract tabular data suitable for Excel.
Return TABLES as arrays of row arrays (strings). If no tables detected, return text LINES for a single-column sheet.

Document:
{{media url=pdfUri}}`,
});

const pdfToExcelFlow = ai.defineFlow(
  {
    name: 'pdfToExcelFlow',
    inputSchema: PdfToExcelInputSchema,
    outputSchema: PdfToExcelAiOutputSchema,
  },
  async (input) => {
    const { pdfUri } = input;
    try {
      const { output } = await pdfToExcelPrompt({ pdfUri });
      if (!output) throw new Error('AI failed to extract content');
      return output;
    } catch (err) {
      const { output } = await pdfToExcelPrompt15({ pdfUri });
      if (!output) throw new Error('AI fallback failed to extract content');
      return output;
    }
  }
);

export async function pdfToExcelAi(
  input: PdfToExcelInput
): Promise<PdfToExcelOutput> {
  // No OCR uses local LibreOffice for best fidelity
  if (input.conversionMode === 'no_ocr') {
    const res = await pdfToExcelNoOcr({ pdfUri: input.pdfUri });
    if (res.error || !res.xlsxUri) throw new Error(res.error || 'Excel conversion failed');
    return { xlsxUri: res.xlsxUri };
  }

  const aiResult = await pdfToExcelFlow({ pdfUri: input.pdfUri });

  // Build workbook
  const wb = XLSX.utils.book_new();

  if (aiResult.tables && aiResult.tables.length > 0) {
    aiResult.tables.forEach((table, idx) => {
      try {
        const ws = XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws, `Table ${idx + 1}`);
      } catch (e) {
        // If any table fails, skip it
      }
    });
  } else {
    const lines = aiResult.lines || [];
    const aoa = [['Text'], ...lines.map((l) => [l])];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'Content');
  }

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const buf = Buffer.from(out as ArrayBuffer);
  const xlsxUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buf.toString('base64')}`;
  return { xlsxUri };
}