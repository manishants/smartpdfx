
'use server';

/**
 * @fileOverview A flow for rotating pages in a PDF document.
 *
 * - rotatePdf - Rotates pages in a PDF based on provided instructions.
 */

import {
  RotatePdfInputSchema,
  RotatePdfOutputSchema,
  type RotatePdfInput,
  type RotatePdfOutput,
} from '@/lib/types';
import { PDFDocument, RotationTypes, degrees } from 'pdf-lib';

export async function rotatePdf(
  input: RotatePdfInput
): Promise<RotatePdfOutput> {
    const { pdfUri, rotations } = input;
    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    for (const rotation of rotations) {
      if (rotation.pageIndex < 0 || rotation.pageIndex >= pdfDoc.getPageCount()) {
        console.warn(`Invalid page index ${rotation.pageIndex}, skipping rotation.`);
        continue;
      }
      const page = pdfDoc.getPage(rotation.pageIndex);
      // The angle is cumulative, so we get the current rotation and add to it.
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotation.angle));
    }

    const rotatedPdfBytes = await pdfDoc.save();
    const rotatedPdfUri = `data:application/pdf;base64,${Buffer.from(
      rotatedPdfBytes
    ).toString('base64')}`;

    return { rotatedPdfUri };
}
