'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { WordToPdfInput, WordToPdfOutput } from '@/lib/types';
import { findLibreOffice } from '@/lib/libreoffice';

const execAsync = promisify(exec);

/**
 * @fileOverview A flow for converting Word documents to PDF using LibreOffice.
 *
 * - wordToPdf - Converts a DOCX data URI to a PDF data URI using LibreOffice.
 */

export async function wordToPdf(input: WordToPdfInput): Promise<WordToPdfOutput> {
  const { docxUri } = input;
  
  // Extract base64 data from data URI
  const base64Data = docxUri.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid DOCX data URI format');
  }

  // Create temporary file paths
  const tempDir = tmpdir();
  const inputFileName = `word_input_${Date.now()}.docx`;
  const inputPath = join(tempDir, inputFileName);
  const outputFileName = `word_output_${Date.now()}.pdf`;
  const outputPath = join(tempDir, outputFileName);

  try {
    // Write DOCX data to temporary file
    const docxBuffer = Buffer.from(base64Data, 'base64');
    await writeFile(inputPath, docxBuffer);

    // Resolve LibreOffice path and convert DOCX to PDF
    const sofficePath = await findLibreOffice();
    if (!sofficePath) {
      console.error('LibreOffice (soffice) not found. PATH=', process.env.PATH);
      throw new Error('LibreOffice (soffice) not found on server. Ensure the Docker image installs LibreOffice.');
    }
    const command = `"${sofficePath}" --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`;
    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 60000 }); // allow up to 60s for conversion
      if (stderr && stderr.trim().length) {
        console.warn('LibreOffice stderr:', stderr);
      }
      if (stdout && stdout.trim().length) {
        console.log('LibreOffice stdout:', stdout);
      }
    } catch (execError: any) {
      console.error('LibreOffice conversion error:', execError);
      throw new Error('LibreOffice conversion failed during execution.');
    }

    // Read the converted PDF file
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await readFile(outputPath);
    } catch (readError) {
      console.error('Failed to read converted PDF:', readError);
      throw new Error('Failed to read the converted PDF file. The conversion may have failed.');
    }

    // Convert to data URI
    const pdfUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

    return { pdfUri };

  } catch (error: any) {
    console.error('Word to PDF conversion error:', error);
    throw new Error(error.message || 'Failed to convert Word document to PDF');
  } finally {
    // Clean up temporary files
    try {
      await unlink(inputPath);
    } catch (e) {
      console.warn('Failed to clean up input file:', e);
    }
    
    try {
      await unlink(outputPath);
    } catch (e) {
      console.warn('Failed to clean up output file:', e);
    }
  }
}