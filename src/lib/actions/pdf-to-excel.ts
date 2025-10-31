'use server';

import { convertPdfToXlsx, isLibreOfficeAvailable } from '@/lib/libreoffice';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function pdfToExcel(input: { pdfUri: string }): Promise<{ xlsxUri?: string; error?: string }>{
  try {
    const available = await isLibreOfficeAvailable();
    if (!available) return { error: 'LibreOffice not found on server. Please install to enable fast export.' };

    const outDir = join(tmpdir(), `lo-export-${Date.now()}`);
    await fs.mkdir(outDir, { recursive: true });

    const inputPath = join(outDir, 'input.pdf');
    const pdfBuffer = Buffer.from(input.pdfUri.split(',')[1], 'base64');
    await fs.writeFile(inputPath, pdfBuffer);

    const res = await convertPdfToXlsx(inputPath, outDir);
    if (!res.success || !res.outputPath) {
      return { error: res.error || 'LibreOffice export failed.' };
    }

    const xlsxBuffer = await fs.readFile(res.outputPath);
    const xlsxUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${xlsxBuffer.toString('base64')}`;
    return { xlsxUri };
  } catch (e: any) {
    return { error: e.message || 'Unexpected error converting to Excel.' };
  }
}