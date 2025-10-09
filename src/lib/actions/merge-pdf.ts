
'use server';

/**
 * @fileOverview A flow for merging multiple PDF documents into one.
 *
 * - mergePdfs - A function that combines multiple PDFs.
 */

import {
  MergePdfInputSchema,
  MergePdfOutputSchema,
  type MergePdfInput,
  type MergePdfOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(input: MergePdfInput): Promise<MergePdfOutput> {
    const { pdfUris } = input;
    const mergedPdf = await PDFDocument.create();

    for (const pdfUri of pdfUris) {
      const pdfBuffer = Buffer.from(
        pdfUri.substring(pdfUri.indexOf(',') + 1),
        'base64'
      );
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfUri = `data:application/pdf;base64,${Buffer.from(
      mergedPdfBytes
    ).toString('base64')}`;

    return { mergedPdfUri };
}
