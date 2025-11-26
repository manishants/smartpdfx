'use server';

import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import * as XLSX from 'xlsx';
import { extractTablesWithTabula, tsvToAoa } from '@/lib/tabula';

export type PdfToExcelActionInput = { pdfUri: string };
export type PdfToExcelActionOutput = { xlsxUri?: string; error?: string };

/**
 * Convert a PDF (data URI) to XLSX using Tabula (No OCR). Requires Java and tabula.jar.
 * Returns a data URI for the XLSX or an error message.
 */
export async function pdfToExcel(
  input: PdfToExcelActionInput
): Promise<PdfToExcelActionOutput> {
  const { pdfUri } = input;

  const base64 = pdfUri.substring(pdfUri.indexOf(',') + 1);
  const buffer = Buffer.from(base64, 'base64');

  const temp = tmpdir();
  const inputPath = join(temp, `input-${Date.now()}.pdf`);
  const outputDir = temp;

  try {
    await writeFile(inputPath, buffer);
    const res = await extractTablesWithTabula({ inputPath, outputDir, format: 'TSV', pages: 'all' });
    if (!res.success || !res.outputPaths || res.outputPaths.length === 0) {
      return { error: res.error || 'Tabula produced no table output.' };
    }

    const wb = XLSX.utils.book_new();
    let sheetCount = 0;

    const { readFileSync } = await import('fs');
    for (const p of res.outputPaths) {
      try {
        const tsv = readFileSync(p, 'utf8');
        const aoa = tsvToAoa(tsv);
        if (aoa.length) {
          const ws = XLSX.utils.aoa_to_sheet(aoa);
          XLSX.utils.book_append_sheet(wb, ws, `Table ${++sheetCount}`);
        }
      } catch {}
    }

    if (sheetCount === 0) {
      return { error: 'No tables detected by Tabula.' };
    }

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const buf = Buffer.from(out as ArrayBuffer);
    const xlsxUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${buf.toString('base64')}`;
    return { xlsxUri };
  } catch (err: any) {
    return { error: err?.message || 'PDF to XLSX conversion error.' };
  } finally {
    try { await unlink(inputPath); } catch {}
  }
}