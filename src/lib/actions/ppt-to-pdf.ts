
'use server';

import {
  PptToPdfInputSchema,
  PptToPdfOutputSchema,
  type PptToPdfInput,
  type PptToPdfOutput,
} from '@/lib/types';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function pptToPdf(input: PptToPdfInput): Promise<PptToPdfOutput> {
  const { pptxUri } = input;
  
  // Extract base64 data from data URI
  const base64Data = pptxUri.substring(pptxUri.indexOf(',') + 1);
  const pptxBuffer = Buffer.from(base64Data, 'base64');
  
  // Create temporary files
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input-${Date.now()}.pptx`);
  const outputPath = path.join(tempDir, `output-${Date.now()}.pdf`);
  
  try {
    // Write PPTX file to disk
    fs.writeFileSync(inputPath, pptxBuffer);
    
    // Use LibreOffice to convert PPTX to PDF (requires LibreOffice to be installed)
    // Alternative: Use a cloud service or different conversion library
    await execAsync(`libreoffice --headless --convert-to pdf --outdir "${path.dirname(outputPath)}" "${inputPath}"`);
    
    // Read the converted PDF
    const pdfBuffer = fs.readFileSync(outputPath);
    const pdfUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    
    // Clean up temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    
    return { pdfUri };
  } catch (error) {
    // Clean up temporary files in case of error
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
    
    // For now, throw a more descriptive error
    throw new Error("PPT to PDF conversion requires LibreOffice to be installed on the server. This feature is currently not available in this environment.");
  }
}
