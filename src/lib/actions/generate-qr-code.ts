
'use server';

import type {
  GenerateQrCodeInput,
  GenerateQrCodeOutput,
} from '@/lib/types';
import qrcode from 'qrcode';

export async function generateQrCode(
  input: GenerateQrCodeInput
): Promise<GenerateQrCodeOutput> {
  const { text } = input;
  
  const qrCodeImageUri = await qrcode.toDataURL(text, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.9,
    margin: 1,
  });

  return { qrCodeImageUri };
}
