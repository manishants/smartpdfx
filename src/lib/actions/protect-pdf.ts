
'use server';

/**
 * @fileOverview A flow for adding a password to a PDF file.
 *
 * - protectPdf - Adds a password to a PDF document.
 * - ProtectPdfInput - The input type for the protectPdf function.
 * - ProtectPdfOutput - The return type for the protectPdf function.
 */

import {
  ProtectPdfInputSchema,
  ProtectPdfOutputSchema,
  type ProtectPdfInput,
  type ProtectPdfOutput,
} from '@/lib/types';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function protectPdf(input: ProtectPdfInput): Promise<ProtectPdfOutput> {
    const { pdfUri, password } = input;

    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );
    
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { 
          // allow loading of encrypted files, though we aren't un-encrypting
          ignoreEncryption: true 
      });

      // The key is to set the encryption options in the `save` method.
      const protectedPdfBytes = await pdfDoc.save({
          userPassword: password,
          ownerPassword: password, // You can set a different owner password if needed
          permissions: {
              printing: 'high',
              modifying: false,
              copying: false,
              annotating: false,
              fillingForms: false,
              contentAccessibility: false,
              documentAssembly: false
          }
      });

      const protectedPdfBase64 = Buffer.from(protectedPdfBytes).toString('base64');
      const protectedPdfUri = `data:application/pdf;base64,${protectedPdfBase64}`;

      return { protectedPdfUri };
    } catch (e: any) {
        console.error("PDF protection failed:", e.message);
        throw new Error("Failed to protect the PDF. The file might be corrupted or in an unsupported format.");
    }
}
