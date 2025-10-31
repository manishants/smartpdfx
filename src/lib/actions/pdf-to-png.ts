'use server';

import { convertPdfToPng, isLibreOfficeAvailable } from '@/lib/libreoffice';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function toDataUri(mime: string, buf: Buffer) {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function pdfToPng(input: { pdfUri: string }): Promise<{ imageUris?: string[]; error?: string }>{
  try {
    const available = await isLibreOfficeAvailable();
    if (!available) return { error: 'LibreOffice not found on server. Please install to enable fast export.' };

    const outDir = join(tmpdir(), `lo-export-${Date.now()}`);
    await fs.mkdir(outDir, { recursive: true });

    const inputPath = join(outDir, 'input.pdf');
    const pdfBuffer = Buffer.from(input.pdfUri.split(',')[1], 'base64');
    await fs.writeFile(inputPath, pdfBuffer);

    const res = await convertPdfToPng(inputPath, outDir);
    if (!res.success || !res.outputPaths || res.outputPaths.length === 0) {
      return { error: res.error || 'LibreOffice PNG export failed.' };
    }

    const images: string[] = [];
    for (const p of res.outputPaths) {
      const buf = await fs.readFile(p);
      images.push(toDataUri('image/png', buf));
    }
    return { imageUris: images };
  } catch (e: any) {
    return { error: e.message || 'Unexpected error converting to PNG.' };
  }
}