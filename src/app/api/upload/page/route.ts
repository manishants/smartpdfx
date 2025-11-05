import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const desiredName = (formData.get('filename') as string) || '';
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    // Basic validation: only allow images
    if (!(file.type || '').startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicDir = path.resolve(process.cwd(), 'public', 'page');
    await fs.mkdir(publicDir, { recursive: true });

    // Use original filename without automatic renaming or stamping
    // Keep the exact name provided by the user or the file itself
    const rawName = desiredName || (file as any).name || 'uploaded-image.png';
    const filename = path.basename(rawName); // prevent directory traversal

    const targetPath = path.join(publicDir, filename);
    await fs.writeFile(targetPath, buffer);

    // Return public path to be used in section data
    const publicPath = `/page/${filename}`;
    return NextResponse.json({ message: 'Upload successful', path: publicPath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}