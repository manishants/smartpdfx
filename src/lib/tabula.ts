import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export type TabulaExtractOptions = {
  inputPath: string;
  outputDir: string;
  format?: 'TSV' | 'CSV';
  pages?: string; // e.g. 'all' or '1-3'
};

async function isJavaAvailable(): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const proc = spawn(process.platform === 'win32' ? 'java.exe' : 'java', ['-version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let sawOutput = false;
    const finish = () => resolve(sawOutput);
    proc.stdout?.on('data', () => { sawOutput = true; });
    proc.stderr?.on('data', () => { sawOutput = true; });
    proc.on('error', () => resolve(false));
    proc.on('close', finish);
  });
}

function findTabulaJar(): string | null {
  const fromEnv = process.env.TABULA_JAR_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const candidates = [
    join(process.cwd(), 'tabula.jar'),
    'C:/Program Files/Tabula/tabula.jar',
    '/usr/local/share/tabula/tabula.jar',
    '/usr/share/tabula/tabula.jar',
  ];
  for (const c of candidates) {
    try { if (existsSync(c)) return c; } catch {}
  }
  return null;
}

export async function extractTablesWithTabula(opts: TabulaExtractOptions): Promise<{ success: boolean; outputPaths?: string[]; error?: string }>{
  const javaOk = await isJavaAvailable();
  if (!javaOk) return { success: false, error: 'Java not found. Install JRE/JDK and ensure java is on PATH.' };

  const jar = findTabulaJar();
  if (!jar) return { success: false, error: 'Tabula jar not found. Set TABULA_JAR_PATH to tabula.jar location.' };

  const format = opts.format || 'TSV';
  const pages = opts.pages || 'all';
  const outName = `tabula-${Date.now()}.${format.toLowerCase()}`;
  const outputFile = join(opts.outputDir, outName);

  return await new Promise((resolve) => {
    const proc = spawn(
      process.platform === 'win32' ? 'java.exe' : 'java',
      ['-jar', jar, '-p', pages, '-f', format, '-o', outputFile, opts.inputPath],
      { windowsHide: true }
    );

    let stderr = '';
    proc.stderr?.on('data', (d) => (stderr += d.toString()));
    proc.on('error', (err) => resolve({ success: false, error: String(err) }));
    proc.on('close', (code) => {
      if (code !== 0) return resolve({ success: false, error: `Tabula exited with code ${code}. ${stderr}` });
      // Collect TSV/CSV files written to outputDir (Tabula may output to the specified file only)
      const files = [] as string[];
      try {
        if (existsSync(outputFile)) files.push(outputFile);
        const others = readdirSync(opts.outputDir)
          .filter((f) => f.toLowerCase().endsWith(`.${format.toLowerCase()}`))
          .map((f) => join(opts.outputDir, f));
        for (const f of others) if (!files.includes(f)) files.push(f);
      } catch {}
      if (!files.length) return resolve({ success: false, error: `Tabula produced no ${format} output. stderr: ${stderr}` });
      resolve({ success: true, outputPaths: files });
    });
  });
}

export function tsvToAoa(tsv: string): string[][] {
  const lines = tsv.split(/\r?\n/).filter((l) => l.length);
  return lines.map((line) => line.split('\t'));
}