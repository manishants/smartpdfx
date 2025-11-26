
'use server';

import {
  AddPageNumbersInputSchema,
  AddPageNumbersOutputSchema,
  type AddPageNumbersInput,
  type AddPageNumbersOutput,
} from '@/lib/types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function addPageNumbersToPdf(
  input: AddPageNumbersInput
): Promise<AddPageNumbersOutput> {
  const { pdfUri, position } = input;

  const pdfBuffer = Buffer.from(
    pdfUri.substring(pdfUri.indexOf(',') + 1),
    'base64'
  );

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const pageNumberText = `${i + 1} / ${pages.length}`;
    const textSize = 12;
    const textWidth = font.widthOfTextAtSize(pageNumberText, textSize);

    let x: number, y: number;
    const margin = 50;

    switch (position) {
      case 'top-left':
        x = margin;
        y = height - margin;
        break;
      case 'top-center':
        x = width / 2 - textWidth / 2;
        y = height - margin;
        break;
      case 'top-right':
        x = width - textWidth - margin;
        y = height - margin;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-center':
        x = width / 2 - textWidth / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin;
        y = margin;
        break;
    }

    page.drawText(pageNumberText, {
      x,
      y,
      size: textSize,
      font,
      color: rgb(0, 0, 0),
    });
  }

  const numberedPdfBytes = await pdfDoc.save();
  const numberedPdfUri = `data:application/pdf;base64,${Buffer.from(
    numberedPdfBytes
  ).toString('base64')}`;

  return { numberedPdfUri };
}
