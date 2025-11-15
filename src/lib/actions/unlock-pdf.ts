
'use server';

/**
 * @fileOverview A flow for unlocking password-protected PDF files.
 *
 * - unlockPdf - Removes the password from a PDF document.
 * - UnlockPdfInput - The input type for the unlockPdf function.
 * - UnlockPdfOutput - The return type for the unlockPdf function.
 */

import {
  UnlockPdfInputSchema,
  UnlockPdfOutputSchema,
  type UnlockPdfInput,
  type UnlockPdfOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';
import { addLog } from '@/lib/logsStore'

export async function unlockPdf(input: UnlockPdfInput): Promise<UnlockPdfOutput> {
  const { pdfUri, password } = input;

  // Robust data URI parsing
  const commaIndex = pdfUri.indexOf(',');
  if (commaIndex === -1) {
    throw new Error('Invalid file data. Please re-upload the PDF.');
  }
  const header = pdfUri.substring(0, commaIndex).toLowerCase();
  if (!header.includes('application/pdf')) {
    // Continue but log for diagnostics
    try { await addLog({ type: 'unlock_pdf_warn', message: 'Non-PDF data URI header', context: { header } }) } catch {}
  }

  const base64 = pdfUri.substring(commaIndex + 1);
  const pdfBuffer = Buffer.from(base64, 'base64');

  const tryLoad = async (pw?: string) => {
    if (pw === undefined) return PDFDocument.load(pdfBuffer);
    return PDFDocument.load(pdfBuffer, { password: pw });
  };

  try {
    // 1) Try with the exact password first, and rebuild pages into a fresh doc
    const pdfDoc = await tryLoad(password);
    const pageCount = pdfDoc.getPageCount();
    const newDoc = await PDFDocument.create();
    const indices = Array.from({ length: pageCount }, (_, i) => i);
    const pages = await newDoc.copyPages(pdfDoc, indices);
    pages.forEach((p) => newDoc.addPage(p));
    const unlockedPdfBytes = await newDoc.save({ useObjectStreams: true });
    const unlockedPdfBase64 = Buffer.from(unlockedPdfBytes).toString('base64');
    const unlockedPdfUri = `data:application/pdf;base64,${unlockedPdfBase64}`;

    try {
      await addLog({ type: 'unlock_pdf', message: 'Unlocked and rebuilt password-protected PDF', context: { inputSize: pdfBuffer.length, outputSize: unlockedPdfBytes.length, pages: pageCount } })
    } catch {}

    return { unlockedPdfUri };
  } catch (firstErr: any) {
    const msg = String(firstErr?.message || firstErr);

    // 2) Retry with trimmed password if user accidentally added spaces
    const trimmed = password.trim();
    if (trimmed !== password) {
      try {
        const pdfDoc = await tryLoad(trimmed);
        const pageCount = pdfDoc.getPageCount();
        const newDoc = await PDFDocument.create();
        const indices = Array.from({ length: pageCount }, (_, i) => i);
        const pages = await newDoc.copyPages(pdfDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const unlockedPdfBytes = await newDoc.save({ useObjectStreams: true });
        const unlockedPdfBase64 = Buffer.from(unlockedPdfBytes).toString('base64');
        const unlockedPdfUri = `data:application/pdf;base64,${unlockedPdfBase64}`;
        try { await addLog({ type: 'unlock_pdf', message: 'Unlocked with trimmed password (rebuilt)', context: { inputSize: pdfBuffer.length, outputSize: unlockedPdfBytes.length, pages: pageCount } }) } catch {}
        return { unlockedPdfUri };
      } catch {}
    }

    // 3) Detect if the PDF opens without a password (no open password set)
    try {
      const pdfDoc = await tryLoad(undefined);
      try { await addLog({ type: 'unlock_pdf_info', message: 'Opened without password', context: { inputSize: pdfBuffer.length } }) } catch {}
      // Attempt a full rebuild to strip any viewer restrictions by re-writing pages into a fresh document
      try {
        const newDoc = await PDFDocument.create();
        const indices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
        const pages = await newDoc.copyPages(pdfDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const rebuiltBytes = await newDoc.save({ useObjectStreams: true });
        const rebuiltBase64 = Buffer.from(rebuiltBytes).toString('base64');
        const rebuiltUri = `data:application/pdf;base64,${rebuiltBase64}`;
        try { await addLog({ type: 'unlock_pdf', message: 'Rebuilt unencrypted PDF (no open password)', context: { inputSize: pdfBuffer.length, outputSize: rebuiltBytes.length } }) } catch {}
        return { unlockedPdfUri: rebuiltUri };
      } catch {}
      // If rebuild fails, inform clearly
      throw new Error('This PDF does not have an open password. Owner-only permission restrictions may apply and cannot always be removed.');
    } catch {}

    // 3b) Fallback: Try loading with encryption ignored and rebuild
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();
      const indices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
      const pages = await newDoc.copyPages(pdfDoc, indices);
      pages.forEach((p) => newDoc.addPage(p));
      const rebuiltBytes = await newDoc.save({ useObjectStreams: true });
      const rebuiltBase64 = Buffer.from(rebuiltBytes).toString('base64');
      const rebuiltUri = `data:application/pdf;base64,${rebuiltBase64}`;
      try { await addLog({ type: 'unlock_pdf', message: 'Rebuilt PDF with ignoreEncryption fallback', context: { inputSize: pdfBuffer.length, outputSize: rebuiltBytes.length, pages: pdfDoc.getPageCount() } }) } catch {}
      return { unlockedPdfUri: rebuiltUri };
    } catch {}

    // 4) Classify common error messages for clarity
    if (/invalid password|password invalid|incorrect password|failed to decrypt/i.test(msg)) {
      throw new Error('Incorrect password. Please re-enter exactly (case-sensitive) and check for extra spaces.');
    }
    if (/unsupported|not implemented|aes-256|v5 security|cfm/i.test(msg)) {
      throw new Error('This PDF uses an encryption format not supported by our engine. Please open it in a desktop PDF app, remove the password, then re-save and try again.');
    }
    if (/no startxref found|failed to parse|malformed pdf/i.test(msg)) {
      throw new Error('The file appears to be corrupted or not a valid PDF. Please verify the file and try again.');
    }

    // Fallback generic message
    console.error('Unlocking failed:', msg);
    throw new Error('Unlocking failed. The password may be incorrect or the PDF is unsupported.');
  }
}
