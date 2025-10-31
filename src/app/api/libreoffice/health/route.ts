import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { findLibreOffice } from '@/lib/libreoffice';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const path = await findLibreOffice();
    if (!path) {
      return NextResponse.json({ ok: false, message: 'LibreOffice (soffice) not found', path: null }, { status: 500 });
    }

    const version = await new Promise<string>((resolve) => {
      const proc = spawn(path, ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      proc.stdout.on('data', (d) => (out += d.toString()));
      proc.on('close', () => resolve(out.trim()));
    });

    return NextResponse.json({ ok: true, path, version });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}