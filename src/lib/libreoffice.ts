import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export type LibreOfficeConvertOptions = {
  inputPath: string;
  outputDir: string;
  filter?: string; // e.g. 'png', 'pptx', 'xlsx'
};

let cachedSofficePath: string | null = null;

export async function isLibreOfficeAvailable(): Promise<boolean> {
  const path = await findLibreOffice();
  return !!path;
}

export async function findLibreOffice(): Promise<string | null> {
  if (cachedSofficePath) return cachedSofficePath;

  const isWin = process.platform === 'win32';
  if (isWin) {
    // Common Windows install locations
    const windowsCandidates = [
      'C:/Program Files/LibreOffice/program/soffice.exe',
      'C:/Program Files (x86)/LibreOffice/program/soffice.exe',
    ];

    for (const c of windowsCandidates) {
      if (existsSync(c)) {
        cachedSofficePath = c;
        return c;
      }
    }

    // Try resolving via PATH on Windows
    const resolvedWin = await new Promise<string | null>((resolve) => {
      const proc = spawn('powershell', ['-NoProfile', '-Command', 'Get-Command soffice.exe | Select-Object -ExpandProperty Path'], { stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      proc.stdout.on('data', (d) => (out += d.toString()));
      proc.on('close', () => {
        const p = out.trim();
        resolve(p.length ? p : null);
      });
    });

    if (resolvedWin && existsSync(resolvedWin)) {
      cachedSofficePath = resolvedWin;
      return resolvedWin;
    }
  } else {
    // Linux/macOS common locations
    const posixCandidates = [
      '/usr/bin/soffice',
      '/usr/local/bin/soffice',
      '/usr/lib/libreoffice/program/soffice',
    ];

    for (const c of posixCandidates) {
      if (existsSync(c)) {
        cachedSofficePath = c;
        return c;
      }
    }

    // Try resolving via PATH using a POSIX shell
    const resolvedPosix = await new Promise<string | null>((resolve) => {
      const cmd = process.env.SHELL && process.env.SHELL.includes('powershell') ? '/bin/sh' : '/bin/sh';
      const proc = spawn(cmd, ['-lc', 'command -v soffice || which soffice'], { stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      proc.stdout.on('data', (d) => (out += d.toString()));
      proc.on('close', () => {
        const p = out.trim();
        resolve(p.length ? p : null);
      });
    });

    if (resolvedPosix && existsSync(resolvedPosix)) {
      cachedSofficePath = resolvedPosix;
      return resolvedPosix;
    }
  }

  return null;
}

export async function convertWithLibreOffice(opts: LibreOfficeConvertOptions): Promise<{ outputPath?: string; success: boolean; error?: string }>{
  const soffice = await findLibreOffice();
  if (!soffice) return { success: false, error: 'LibreOffice (soffice) not found on this system.' };

  const filter = opts.filter || '';
  const args = ['--headless', '--norestore', '--convert-to', filter, '--outdir', opts.outputDir, opts.inputPath];

  return await new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const env = { ...process.env } as NodeJS.ProcessEnv;
    // LibreOffice bundles Python; external PYTHONHOME/PYTHONPATH can break LO scripts, causing
    // "Could not find platform independent libraries <prefix>". Remove them for this process.
    delete (env as any).PYTHONHOME;
    delete (env as any).PYTHONPATH;
    const proc = spawn(soffice, args, { windowsHide: true, env });
    proc.stdout?.on('data', (d) => (stdout += d.toString()));
    proc.stderr?.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (err) => resolve({ success: false, error: String(err) }));
    proc.on('close', (code) => {
      if (code !== 0) return resolve({ success: false, error: `LibreOffice exited with code ${code}. stderr: ${stderr}` });
      // Try to infer output filename (LibreOffice uses input base name)
      const base = opts.inputPath.split(/[\\/]/).pop() || 'output';
      const name = base.replace(/\.[^.]+$/, '');
      const outExt = filter || 'output';
      const outputGuess = join(opts.outputDir, `${name}.${outExt}`);

      try {
        const { existsSync, readdirSync } = require('fs');
        if (existsSync(outputGuess)) {
          return resolve({ success: true, outputPath: outputGuess });
        }
        // Fallback: search for files matching name + extension (case-insensitive)
        const files: string[] = readdirSync(opts.outputDir)
          .filter((f: string) => {
            const lower = f.toLowerCase();
            return lower.startsWith(name.toLowerCase()) && lower.endsWith(`.${outExt.toLowerCase()}`);
          })
          .map((f: string) => join(opts.outputDir, f))
          .sort((a: string, b: string) => a.localeCompare(b));
        if (files.length) {
          return resolve({ success: true, outputPath: files[0] });
        }
      } catch (e) {
        // ignore fs access errors, we'll return a diagnostic error below
      }

      return resolve({ success: false, error: `LibreOffice reported success but output file not found. Tried: ${outputGuess}. stdout: ${stdout} stderr: ${stderr}` });
    });
  });
}

// Convenience wrappers (may not work for all PDFs; LibreOffice support varies)
export async function convertPdfToPptx(inputPath: string, outputDir: string) {
  return convertWithLibreOffice({ inputPath, outputDir, filter: 'pptx' });
}

export async function convertPdfToXlsx(inputPath: string, outputDir: string) {
  return convertWithLibreOffice({ inputPath, outputDir, filter: 'xlsx' });
}

export async function convertPdfToPng(inputPath: string, outputDir: string): Promise<{ success: boolean; outputPaths?: string[]; error?: string }>{
  const res = await convertWithLibreOffice({ inputPath, outputDir, filter: 'png' });
  if (!res.success) return { success: false, error: res.error };
  // LibreOffice may output multiple PNGs (one per page) using patterns like name.png, name_1.png, name_2.png
  const base = inputPath.split(/[\\/]/).pop() || 'output';
  const name = base.replace(/\.[^.]+$/, '');
  const { readdirSync } = await import('fs');
  const files = readdirSync(outputDir)
    .filter(f => f.endsWith('.png') && (f.startsWith(name) || f.startsWith(`${name}_`)))
    .map(f => join(outputDir, f))
    .sort((a, b) => a.localeCompare(b));
  return { success: true, outputPaths: files.length ? files : (res.outputPath ? [res.outputPath] : []) };
}