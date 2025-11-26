
'use server';

/**
 * @fileOverview A flow for adding a password to a PDF file.
 *
 * - protectPdf - Adds a password to a PDF document.
 */

import {
  ProtectPdfInputSchema,
  ProtectPdfOutputSchema,
  type ProtectPdfInput,
  type ProtectPdfOutput,
} from '@/lib/types';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execFileAsync = promisify(execFile);

export async function protectPdf(input: ProtectPdfInput): Promise<ProtectPdfOutput> {
  // Validate input shape early
  ProtectPdfInputSchema.parse(input);
  const { pdfUri, password } = input;

  // Convert data URI to Buffer
  const pdfBuffer = Buffer.from(
    pdfUri.substring(pdfUri.indexOf(',') + 1),
    'base64'
  );

  // Prepare temp paths
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = path.join(os.tmpdir(), `smartpdfx-protect-${stamp}-in.pdf`);
  const outputPath = path.join(os.tmpdir(), `smartpdfx-protect-${stamp}-out.pdf`);

  // qpdf binary: allow override via env, otherwise rely on PATH
  const qpdfBin = process.env.QPDF_PATH || 'qpdf';

  try {
    // Write input PDF to disk
    await writeFile(inputPath, pdfBuffer);

    // Use AES-256 and set user+owner to the same value to force prompt
    const args = [
      '--encrypt', password, password, '256',
      '--print=none', '--modify=none', '--extract=n',
      '--', inputPath, outputPath,
    ];

    // Execute qpdf
    await execFileAsync(qpdfBin, args, { windowsHide: true });

    // Optional verification: show encryption details and ensure AES-256 present
    try {
      const { stdout } = await execFileAsync(qpdfBin, ['--show-encryption', outputPath], { windowsHide: true });
      const normalized = stdout.toString();
      const isAes256 = /R\s*=\s*6/.test(normalized) && /AESv\d/.test(normalized);
      if (!isAes256) {
        console.warn('qpdf verification did not indicate AES-256 encryption. Output:\n', normalized);
      }
    } catch (verifyErr) {
      // Non-fatal. If verification fails, we still return the encrypted file.
      console.warn('qpdf verification failed:', verifyErr);
    }

    // Read encrypted file and return as data URI
    const protectedPdfBuffer = await readFile(outputPath);
    const protectedPdfUri = `data:application/pdf;base64,${protectedPdfBuffer.toString('base64')}`;

    // Validate output shape
    ProtectPdfOutputSchema.parse({ protectedPdfUri });
    return { protectedPdfUri };
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (/ENOENT/.test(msg) || /not recognized as an internal or external command/i.test(msg)) {
      console.error('qpdf binary not found. Ensure qpdf is installed and QPDF_PATH is set if needed.');
      throw new Error('Encryption engine not available. Please install qpdf and ensure it is on PATH or set QPDF_PATH.');
    }
    console.error('PDF protection failed:', msg);
    throw new Error('Failed to protect the PDF using AES-256 encryption.');
  } finally {
    // Clean up temp files
    try { await unlink(inputPath); } catch {}
    try { await unlink(outputPath); } catch {}
  }
}
