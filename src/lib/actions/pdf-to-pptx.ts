'use server';

import { convertPdfToPptx, isLibreOfficeAvailable } from '@/lib/libreoffice';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function pdfToPptx(input: { pdfUri: string }): Promise<{ pptxUri?: string; error?: string }>{
  try {
    const available = await isLibreOfficeAvailable();
    if (!available) return { error: 'LibreOffice not found on server. Please install to enable fast export.' };

    const outDir = join(tmpdir(), `lo-export-${Date.now()}`);
    await fs.mkdir(outDir, { recursive: true });

    const inputPath = join(outDir, 'input.pdf');
    const pdfBuffer = Buffer.from(input.pdfUri.split(',')[1], 'base64');
    await fs.writeFile(inputPath, pdfBuffer);

    const res = await convertPdfToPptx(inputPath, outDir);
    if (!res.success || !res.outputPath) {
      return { error: res.error || 'LibreOffice export failed.' };
    }

    // Check if the output file actually exists before trying to read it
    try {
      await fs.access(res.outputPath);
    } catch {
      // If the expected output file doesn't exist, look for any .pptx file in the output directory
      const files = await fs.readdir(outDir);
      const pptxFile = files.find(f => f.endsWith('.pptx'));
      if (pptxFile) {
        res.outputPath = join(outDir, pptxFile);
      } else {
        return { error: 'LibreOffice conversion completed but no PPTX file was found in output directory' };
      }
    }

    const pptxBuffer = await fs.readFile(res.outputPath);
    const pptxUri = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${pptxBuffer.toString('base64')}`;
    return { pptxUri };
  } catch (e: any) {
    return { error: e.message || 'Unexpected error converting to PPTX.' };
  }
}