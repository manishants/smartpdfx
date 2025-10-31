
'use server';

import {
  DeletePdfPagesInputSchema,
  DeletePdfPagesOutputSchema,
  type DeletePdfPagesInput,
  type DeletePdfPagesOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';

/**
 * @fileOverview An action for deleting pages from a PDF document.
 *
 * - deletePdfPages - Creates a new PDF containing only the specified pages.
 */

export async function deletePdfPages(
  input: DeletePdfPagesInput
): Promise<DeletePdfPagesOutput> {
  const { pdfUri, pagesToKeep } = input;
  
  if (pagesToKeep.length === 0) {
      throw new Error("You must keep at least one page.");
  }
  
  const pdfBuffer = Buffer.from(
    pdfUri.substring(pdfUri.indexOf(',') + 1),
    'base64'
  );
  
  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
  copiedPages.forEach(page => newPdf.addPage(page));

  const modifiedPdfBytes = await newPdf.save();
  const modifiedPdfUri = `data:application/pdf;base64,${Buffer.from(
    modifiedPdfBytes
  ).toString('base64')}`;

  return { modifiedPdfUri };
}
