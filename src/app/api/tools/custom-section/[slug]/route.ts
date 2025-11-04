import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

interface SectionInput {
  type: 'A' | 'B';
  heading: string;
  paragraph: string;
  image: { src: string; alt: string };
  buttons?: Array<{ text: string; href: string }>;
}

interface BodyInput {
  section: SectionInput;
  index?: number; // if provided, update specific index; otherwise append
}

const filePath = () => path.resolve(process.cwd(), 'src', 'data', 'tool-custom-sections.json');

async function readJson(): Promise<Record<string, any>> {
  try {
    const fp = filePath();
    const raw = await fs.readFile(fp, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e: any) {
    // If file doesn't exist, initialize empty mapping
    return {};
  }
}

async function writeJson(obj: Record<string, any>) {
  const fp = filePath();
  const content = JSON.stringify(obj, null, 2);
  await fs.writeFile(fp, content, 'utf-8');
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await readJson();
  const sections = Array.isArray(data[slug]) ? data[slug] : (data[slug] ? [data[slug]] : []);
  return NextResponse.json({ slug, sections });
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const body = (await req.json()) as BodyInput | SectionInput;
    // Backward compatibility: if body has type directly, treat it as single section
    const section: SectionInput = (body as any).section ? (body as any).section : (body as any);
    const index: number | undefined = typeof (body as any).index === 'number' ? (body as any).index : undefined;

    if (!section || !section.type || !section.heading || !section.paragraph || !section.image?.src || !section.image?.alt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const data = await readJson();
    const entry = {
      type: section.type,
      heading: section.heading,
      paragraph: section.paragraph,
      image: section.image,
      buttons: (section.buttons || []).slice(0, 2),
      updatedAt: new Date().toISOString(),
    };

    const arr = Array.isArray(data[slug]) ? (data[slug] as any[]) : (data[slug] ? [data[slug]] : []);
    if (typeof index === 'number' && index >= 0 && index < arr.length) {
      arr[index] = entry;
    } else {
      arr.push(entry);
    }
    data[slug] = arr;
    await writeJson(data);
    return NextResponse.json({ message: 'Section added/updated successfully. Please test on live page.', slug, sections: data[slug] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save section' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const url = new URL(req.url);
    const indexParam = url.searchParams.get('index');
    const index = indexParam !== null ? Number(indexParam) : undefined;
    const data = await readJson();
    const arr = Array.isArray(data[slug]) ? (data[slug] as any[]) : (data[slug] ? [data[slug]] : []);
    if (typeof index === 'number' && index >= 0 && index < arr.length) {
      arr.splice(index, 1);
      data[slug] = arr;
    } else if (arr.length > 0) {
      // If no index provided, remove all sections for this slug
      delete data[slug];
    }
    await writeJson(data);
    return NextResponse.json({ message: 'Section removed successfully. Please test on live page.', slug, sections: data[slug] || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to remove section' }, { status: 500 });
  }
}