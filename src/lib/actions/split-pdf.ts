
'use server';

/**
 * @fileOverview A flow for splitting a PDF document into multiple smaller PDFs.
 *
 * - splitPdf - A function that extracts specified pages from a PDF into new documents.
 */

import {
  SplitPdfInputSchema,
  SplitPdfOutputSchema,
  type SplitPdfInput,
  type SplitPdfOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';

export async function splitPdf(input: SplitPdfInput): Promise<SplitPdfOutput> {
    const { pdfUri, ranges } = input;
    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );
    const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    const splitPdfs: { filename: string; pdfUri: string }[] = [];

    for (const [index, range] of ranges.entries()) {
      if (range.from > totalPages || range.to > totalPages || range.from > range.to || range.from < 1) {
        console.warn(`Invalid page range [${range.from}-${range.to}] skipped.`);
        continue;
      }

      const newPdf = await PDFDocument.create();
      const pageIndices = [];
      for (let i = range.from; i <= range.to; i++) {
        pageIndices.push(i - 1); // pdf-lib is 0-indexed
      }

      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const newPdfUri = `data:application/pdf;base64,${Buffer.from(
        pdfBytes
      ).toString('base64')}`;

      splitPdfs.push({
        filename: `doc-p${range.from}-${range.to}.pdf`,
        pdfUri: newPdfUri,
      });
    }

    if (splitPdfs.length === 0) {
        throw new Error("No valid pages were selected to split.");
    }

    return { splitPdfs };
}
