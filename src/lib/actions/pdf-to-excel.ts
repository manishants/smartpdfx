'use server';

import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { convertPdfToXlsx, isLibreOfficeAvailable } from '@/lib/libreoffice';

export type PdfToExcelActionInput = { pdfUri: string };
export type PdfToExcelActionOutput = { xlsxUri?: string; error?: string };

/**
 * Convert a PDF (data URI) to XLSX using LibreOffice only.
 * Returns a data URI for the XLSX or an error message.
 */
export async function pdfToExcel(
  input: PdfToExcelActionInput
): Promise<PdfToExcelActionOutput> {
  const { pdfUri } = input;
  const available = await isLibreOfficeAvailable();
  if (!available) {
    return { error: 'LibreOffice (soffice) not found. Please install it to enable No OCR Excel conversion.' };
  }

  const base64 = pdfUri.substring(pdfUri.indexOf(',') + 1);
  const buffer = Buffer.from(base64, 'base64');

  const temp = tmpdir();
  const inputPath = join(temp, `input-${Date.now()}.pdf`);
  const outputDir = temp;

  try {
    await writeFile(inputPath, buffer);
    const res = await convertPdfToXlsx(inputPath, outputDir);
    if (!res.success || !res.outputPath) {
      return { error: res.error || 'LibreOffice failed to export XLSX (no export filter for PDF→Excel).' };
    }
    const outBuffer = await readFile(res.outputPath);
    const xlsxUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${outBuffer.toString('base64')}`;
    return { xlsxUri };
  } catch (err: any) {
    return { error: err?.message || 'PDF to XLSX conversion error.' };
  } finally {
    try { await unlink(inputPath); } catch {}
    // Output file is left alone; it resides in tmp and will be cleaned by OS.
  }
}