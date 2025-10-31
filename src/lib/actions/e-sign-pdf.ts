
'use server';

/**
 * @fileOverview A flow for electronically signing a PDF document.
 *
 * - eSignPdf - A function that places a signature image onto a PDF at specified locations.
 */

import {
  ESignPdfInputSchema,
  ESignPdfOutputSchema,
  type ESignPdfInput,
  type ESignPdfOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';

export async function eSignPdf(input: ESignPdfInput): Promise<ESignPdfOutput> {
    const { pdfUri, signatureImageUri, placements } = input;

    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );
    const signatureBuffer = Buffer.from(
      signatureImageUri.substring(signatureImageUri.indexOf(',') + 1),
      'base64'
    );

    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const signatureImage = await pdfDoc.embedPng(signatureBuffer);

    for (const placement of placements) {
      const { pageIndex, x, y, width, height } = placement;

      if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
        console.warn(`Invalid page index ${pageIndex}, skipping placement.`);
        continue;
      }

      const page = pdfDoc.getPage(pageIndex);
      const { height: pageHeight } = page.getSize();

      page.drawImage(signatureImage, {
        x,
        // pdf-lib's y-coordinate is from the bottom of the page, so we need to convert it.
        y: pageHeight - y - height,
        width,
        height,
      });
    }

    const signedPdfBytes = await pdfDoc.save();
    const signedPdfUri = `data:application/pdf;base64,${Buffer.from(
      signedPdfBytes
    ).toString('base64')}`;

    return { signedPdfUri };
}
