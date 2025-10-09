

'use server';

/**
 * @fileOverview A flow for editing a PDF by adding text and images.
 *
 * - editPdf - A function that applies edits to a PDF document.
 */

import {
  type EditPdfInput,
  type EditPdfOutput,
} from '@/lib/types';
import { PDFDocument, rgb, StandardFonts, degrees, LineCapStyle } from 'pdf-lib';

// Helper to convert hex color string to an RGB object for pdf-lib
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return { r: 0, g: 0, b: 0 }; // Default to black if parse fails
    }
    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
    };
}


export async function editPdf(input: EditPdfInput): Promise<EditPdfOutput> {
    const { pdfUri, edits } = input;

    const pdfBuffer = Buffer.from(
      pdfUri.substring(pdfUri.indexOf(',') + 1),
      'base64'
    );

    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    for (const edit of edits) {
      if (edit.pageIndex < 0 || edit.pageIndex >= pdfDoc.getPageCount()) {
        console.warn(`Invalid page index ${edit.pageIndex}, skipping edit.`);
        continue;
      }

      const page = pdfDoc.getPage(edit.pageIndex);
      const { height: pageHeight } = page.getSize();
      
      const y = pageHeight - edit.y - edit.height; // Convert y-coordinate from top-left to bottom-left

      if (edit.type === 'text') {
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        page.drawText(edit.content, {
          x: edit.x,
          y: pageHeight - edit.y - (edit.fontSize || 12), // Adjust y for text baseline
          font: font,
          size: edit.fontSize || 12,
          color: rgb(0, 0, 0),
          rotate: degrees(edit.rotation || 0),
        });
      } else if (edit.type === 'image') {
        let imageBytes = Buffer.from(
          edit.content.substring(edit.content.indexOf(',') + 1),
          'base64'
        );

        let image;
        if(edit.content.startsWith('data:image/png')) {
            image = await pdfDoc.embedPng(imageBytes);
        } else if (edit.content.startsWith('data:image/jpeg')) {
             image = await pdfDoc.embedJpg(imageBytes);
        } else {
            console.warn(`Unsupported image type for edit on page ${edit.pageIndex}.`);
            continue;
        }

        page.drawImage(image, {
          x: edit.x,
          y: y,
          width: edit.width,
          height: edit.height,
          rotate: degrees(edit.rotation || 0)
        });
      } else if (edit.type === 'rectangle' || edit.type === 'cover') {
          const color = edit.backgroundColor ? hexToRgb(edit.backgroundColor) : rgb(1, 1, 1);
          page.drawRectangle({
              x: edit.x,
              y: y,
              width: edit.width,
              height: edit.height,
              color: rgb(color.r, color.g, color.b),
              rotate: degrees(edit.rotation || 0),
          })
      } else if ((edit.type === 'drawing' || edit.type === 'highlight') && edit.points && edit.points.length > 1) {
            const color = edit.strokeColor ? hexToRgb(edit.strokeColor) : rgb(0, 0, 0);
            const path = edit.points.map(p => `L ${p.x} ${pageHeight - p.y}`).join(' ');
            
            page.drawSvgPath(`M ${edit.points[0].x} ${pageHeight - edit.points[0].y} ${path}`, {
                borderColor: rgb(color.r, color.g, color.b),
                borderWidth: edit.strokeWidth || 5,
                borderLineCap: LineCapStyle.Round,
                borderOpacity: edit.type === 'highlight' ? 0.5 : 1,
            });
      }
    }

    const editedPdfBytes = await pdfDoc.save();
    const editedPdfUri = `data:application/pdf;base64,${Buffer.from(
      editedPdfBytes
    ).toString('base64')}`;

    return { editedPdfUri };
}
