
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
import { PDFDocument } from 'pdf-lib';


export async function protectPdf(input: ProtectPdfInput): Promise<ProtectPdfOutput> {
    const { pdfUri, password } = input;

    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );
    
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { 
          ignoreEncryption: true 
      });

      pdfDoc.setProducer('SmartPDFx');
      pdfDoc.setCreator('SmartPDFx');

      const protectedPdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          userPassword: password,
          ownerPassword: password,
      });

      const protectedPdfBase64 = Buffer.from(protectedPdfBytes).toString('base64');
      const protectedPdfUri = `data:application/pdf;base64,${protectedPdfBase64}`;

      return { protectedPdfUri };
    } catch (e: any) {
        console.error("PDF protection failed:", e.message);
        throw new Error("Failed to protect the PDF. The file might be already encrypted or in an unsupported format.");
    }
}
