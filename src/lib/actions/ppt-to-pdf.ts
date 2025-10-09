
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

export async function pptToPdf(input: PptToPdfInput): Promise<PptToPdfOutput> {
  throw new Error("PPT to PDF conversion is not implemented yet.");
}
