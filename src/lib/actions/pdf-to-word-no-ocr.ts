'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import fs from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { PdfToWordInput, PdfToWordOutput } from '@/lib/types';

const execAsync = promisify(exec);

/**
 * Convert a PDF (with selectable text) to DOCX using LibreOffice headless mode.
 * No OCR, no AI, preserves layout/images/fonts as imported by LibreOffice.
 */
export async function pdfToWordNoOcr(input: PdfToWordInput): Promise<PdfToWordOutput> {
  const { pdfUri } = input;

  const base64Data = pdfUri.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid PDF data URI format');
  }

  const tempDir = tmpdir();
  const inputFileName = `pdf_input_${Date.now()}.pdf`;
  const inputPath = join(tempDir, inputFileName);
  // LibreOffice names the output file after the input base name
  const outputPath = join(tempDir, inputFileName.replace(/\.pdf$/i, '.docx'));

  function resolveSofficeCommand(): string {
    const candidates = [
      process.env.LIBREOFFICE_PATH,
      'soffice',
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      '/usr/bin/soffice',
      '/usr/local/bin/soffice',
      '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    ].filter(Boolean) as string[];
    for (const p of candidates) {
      if (p === 'soffice') return p;
      try {
        if (fs.existsSync(p)) {
          return `"${p}"`;
        }
      } catch {}
    }
    return 'soffice';
  }

  try {
    // Write PDF to temp file
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    await writeFile(inputPath, pdfBuffer);

    // Convert PDF to DOCX using LibreOffice (prefer explicit path on Windows)
    const sofficeCmd = resolveSofficeCommand();
    const command = `${sofficeCmd} --headless --norestore --infilter=writer_pdf_import --convert-to docx --outdir "${tempDir}" "${inputPath}"`;
    try {
      await execAsync(command, { timeout: 60000 }); // up to 60s for complex PDFs
    } catch (execError: any) {
      console.error('LibreOffice PDF→DOCX conversion error:', execError);
      throw new Error(
        'LibreOffice conversion failed. Ensure LibreOffice is installed and accessible. ' +
        'You can set LIBREOFFICE_PATH to the full path of soffice (e.g., C:\\Program Files\\LibreOffice\\program\\soffice.exe) or add it to your system PATH.'
      );
    }

    // Read the converted DOCX
    let docxBuffer: Buffer;
    try {
      docxBuffer = await readFile(outputPath);
    } catch (readError) {
      console.error('Failed to read converted DOCX:', readError);
      throw new Error('Failed to read the converted DOCX file. The conversion may have failed.');
    }

    const docxUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${docxBuffer.toString('base64')}`;
    return { docxUri };
  } catch (error: any) {
    console.error('PDF to Word (No OCR) conversion error:', error);
    throw new Error(error.message || 'Failed to convert PDF to Word (No OCR)');
  } finally {
    // Cleanup
    try { await unlink(inputPath); } catch (e) { /* noop */ }
    try { await unlink(outputPath); } catch (e) { /* noop */ }
  }
}