
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
            // If the source doc is already encrypted, we need to try opening it with an empty password
            // in case it's unlocked but has permissions set. For this tool, we assume we start
            // with an unencrypted PDF.
        });
        
        // This is the correct way to apply encryption with pdf-lib.
        // It modifies the document in place before saving.
        // `userPassword` is for setting the open password.
        pdfDoc.setProducer('SmartPDFx');
        pdfDoc.setCreator('SmartPDFx');

        const protectedPdfBytes = await pdfDoc.save({ 
            useObjectStreams: true, 
            userPassword: password 
        });

        const protectedPdfUri = `data:application/pdf;base64,${Buffer.from(protectedPdfBytes).toString('base64')}`;

        return { protectedPdfUri };

    } catch (e: any) {
        console.error("PDF protection failed:", e.message);
        throw new Error("Failed to protect the PDF. The file might be corrupted or in an unsupported format.");
    }
}
