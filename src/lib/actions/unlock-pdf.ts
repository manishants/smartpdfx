
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

    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );
    
    try {
      // Load encrypted PDF with the provided open password.
      const pdfDoc = await PDFDocument.load(pdfBuffer, { password });
      
      // pdf-lib does not support saving encrypted PDFs; saving produces an unencrypted document.
      const unlockedPdfBytes = await pdfDoc.save();

      const unlockedPdfBase64 = Buffer.from(unlockedPdfBytes).toString('base64');
      const unlockedPdfUri = `data:application/pdf;base64,${unlockedPdfBase64}`;

      try {
        await addLog({ type: 'unlock_pdf', message: 'Unlocked password-protected PDF', context: { inputSize: pdfBuffer.length, outputSize: unlockedPdfBytes.length } })
      } catch {}

      return { unlockedPdfUri };
    } catch (e: any) {
        // If loading fails, it's most likely an incorrect password or a corrupted file.
        console.error("Unlocking failed:", e.message);
        throw new Error("Incorrect password or corrupted/unsupported PDF. Please double-check the password and try again.");
    }
}
