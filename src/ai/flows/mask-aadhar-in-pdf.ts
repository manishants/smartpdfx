
'use server';

/**
 * @fileOverview A flow for masking Aadhar numbers within a PDF document.
 *
 * - maskAadharInPdf - A function that handles masking all pages of a PDF.
 * - MaskAadharInPdfInput - The input type for the maskAadharInPdf function.
 * - MaskAadharInPdfOutput - The return type for the maskAadharInPdf function.
 */

import { ai } from '@/ai/genkit';
import {
  MaskAadharInPdfInputSchema,
  MaskAadharInPdfOutputSchema,
  type MaskAadharInPdfInput,
  type MaskAadharInPdfOutput,
} from '@/lib/types';
import { PDFDocument, rgb } from 'pdf-lib';
import { locateTextInPdf } from './locate-text-in-pdf';

export async function maskAadharInPdf(
  input: MaskAadharInPdfInput
): Promise<MaskAadharInPdfOutput> {
  return maskAadharInPdfFlow(input);
}

const maskAadharInPdfFlow = ai.defineFlow(
  {
    name: 'maskAadharInPdfFlow',
    inputSchema: MaskAadharInPdfInputSchema,
    outputSchema: MaskAadharInPdfOutputSchema,
  },
  async (input) => {
    const pdfBuffer = Buffer.from(
      input.pdfUri.substring(input.pdfUri.indexOf(',') + 1),
      'base64'
    );

    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    const aadharRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;

    for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i);
        
        // Create a temporary PDF with just the current page for analysis
        const tempPdf = await PDFDocument.create();
        const [copiedPage] = await tempPdf.copyPages(pdfDoc, [i]);
        tempPdf.addPage(copiedPage);
        const tempPdfBytes = await tempPdf.save();
        const tempPdfUri = `data:application/pdf;base64,${Buffer.from(tempPdfBytes).toString('base64')}`;

        try {
            const locations = await locateTextInPdf({ pdfUri: tempPdfUri, textToFind: "12-digit Aadhar number" });

            if (locations.length > 0) {
                 for (const loc of locations) {
                    const cleanedText = loc.text.replace(/[\s-]/g, '');
                    if (aadharRegex.test(loc.text) && cleanedText.length === 12) {
                        // Calculate the width to mask (first 8 digits, plus a little for spacing)
                        const maskedWidth = (loc.box.width / 12) * 8.5;
                        
                        page.drawRectangle({
                            x: loc.box.x,
                            // The model returns coordinates with origin at top-left,
                            // but pdf-lib uses bottom-left, so we need to convert the y-coordinate.
                            y: page.getHeight() - loc.box.y - loc.box.height,
                            width: maskedWidth,
                            height: loc.box.height,
                            color: rgb(0, 0, 0), // Black rectangle
                        });
                    }
                }
            }
        } catch (e) {
            console.error(`Could not analyze page ${i+1} for Aadhar numbers. Error: ${e}`);
        }
    }

    const maskedPdfBytes = await pdfDoc.save();
    const maskedPdfUri = `data:application/pdf;base64,${maskedPdfBytes.toString(
      'base64'
    )}`;

    return { maskedPdfUri };
  }
);
