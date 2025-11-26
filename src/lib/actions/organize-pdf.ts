
'use server';

import {
  OrganizePdfInputSchema,
  OrganizePdfOutputSchema,
  type OrganizePdfInput,
  type OrganizePdfOutput,
} from '@/lib/types';
import { PDFDocument } from 'pdf-lib';

export async function organizePdf(
  input: OrganizePdfInput
): Promise<OrganizePdfOutput> {
  const { pdfUri, pageOrder } = input;
  
  const pdfBuffer = Buffer.from(
    pdfUri.substring(pdfUri.indexOf(',') + 1),
    'base64'
  );
  
  const sourcePdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(sourcePdf, pageOrder);
  copiedPages.forEach(page => newPdf.addPage(page));

  const organizedPdfBytes = await newPdf.save();
  const organizedPdfUri = `data:application/pdf;base64,${Buffer.from(
    organizedPdfBytes
  ).toString('base64')}`;

  return { organizedPdfUri };
}
