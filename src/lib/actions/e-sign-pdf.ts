
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
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function eSignPdf(input: ESignPdfInput): Promise<ESignPdfOutput> {
  const { pdfUri, signatureImageUri, signatures, placements } = input;

  const pdfBuffer = Buffer.from(
    pdfUri.substring(pdfUri.indexOf(',') + 1),
    'base64'
  );
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  // Prepare signature assets
  const embeddedImages: Record<string, any> = {};

  if (Array.isArray(signatures) && signatures.length > 0) {
    for (const asset of signatures) {
      const base64 = asset.imageUri.substring(asset.imageUri.indexOf(',') + 1);
      const buf = Buffer.from(base64, 'base64');
      // Try PNG first, fallback to JPEG
      try {
        embeddedImages[asset.id] = await pdfDoc.embedPng(buf);
      } catch {
        embeddedImages[asset.id] = await pdfDoc.embedJpg(buf);
      }
    }
  } else if (signatureImageUri) {
    const base64 = signatureImageUri.substring(signatureImageUri.indexOf(',') + 1);
    const buf = Buffer.from(base64, 'base64');
    try {
      embeddedImages['__single__'] = await pdfDoc.embedPng(buf);
    } catch {
      embeddedImages['__single__'] = await pdfDoc.embedJpg(buf);
    }
  }

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const placement of placements) {
    const { pageIndex, x, y, width, height, signatureId, dateText, dateOffsetX = 0, dateOffsetY = 0, dateFontSize = 10 } = placement as any;

    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      console.warn(`Invalid page index ${pageIndex}, skipping placement.`);
      continue;
    }

    const page = pdfDoc.getPage(pageIndex);
    const { height: pageHeight } = page.getSize();

    const key = signatureId ?? '__single__';
    const image = embeddedImages[key];
    if (!image) {
      console.warn(`Missing embedded image for signatureId='${key}', skipping placement.`);
      continue;
    }

    // Draw signature image
    page.drawImage(image, {
      x,
      y: pageHeight - y - height, // convert from top-left origin to pdf-lib bottom-origin
      width,
      height,
    });

    // Optionally draw date text
    if (dateText) {
      const textX = x + dateOffsetX;
      const textYTopOrigin = y + dateOffsetY; // Top-origin coordinate
      const textY = pageHeight - textYTopOrigin; // Convert to bottom-origin
      page.drawText(dateText, {
        x: textX,
        y: textY,
        size: dateFontSize,
        font: helvetica,
      });
    }
  }

  const signedPdfBytes = await pdfDoc.save();
  const signedPdfUri = `data:application/pdf;base64,${Buffer.from(
    signedPdfBytes
  ).toString('base64')}`;

  return { signedPdfUri };
}
