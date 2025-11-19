import { NextRequest, NextResponse } from 'next/server';
import { extractVoters } from '@/ai/flows/extract-voter-list';
import { recoverHouseNumbers } from '@/ai/flows/recover-house-numbers';
import { recoverVoterIds } from '@/ai/flows/recover-voter-ids';
import type { ExtractVotersInput, Voter } from '@/lib/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldRetry = (error: any) => {
  const msg = String(error?.message || error || '').toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('too many requests') ||
    msg.includes('resource exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('timeout')
  );
};
async function retryGenkit<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 1200): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (!shouldRetry(err) || i === attempts - 1) break;
      const jitter = Math.floor(Math.random() * 250);
      await sleep(baseDelayMs * (i + 1) + jitter);
    }
  }
  throw lastErr;
}

const normalizeEpic = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const normalizeDigits = (s?: string) => {
  const m = (s || '').match(/\d+/);
  return m ? m[0] : '';
};
const normalizeDate = (s?: string) => {
  const m = (s || '').match(/\b\d{2}-\d{2}-\d{4}\b/);
  return m ? m[0] : '';
};
const normalizeAssemblyNumber = (s?: string) => {
  const m = (s || '').match(/\d{1,4}/);
  return m ? m[0] : '';
};
const normalizeAssemblyName = (s?: string) => {
  const str = (s || '').trim();
  if (!str) return '';
  const parts = str.split(/\s*-\s*/);
  if (parts.length >= 2) return parts.slice(1).join('-').trim();
  return str.replace(/^\d+\s*-\s*/, '').trim();
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageUri: string = body?.imageUri;
    if (!imageUri || typeof imageUri !== 'string') {
      return NextResponse.json({ error: 'imageUri is required' }, { status: 400 });
    }

    const perPageInput: ExtractVotersInput = { fileUri: imageUri };
    const pageResult = await retryGenkit(() => extractVoters(perPageInput));
    const voters: Voter[] = Array.isArray(pageResult?.voters) ? pageResult.voters : [];

    // Recover EPIC voter IDs if missing
    const candidateIds = voters.map(v => v.id).filter(Boolean);
    let withEpic: Voter[] = voters;
    try {
      const { pairs } = await retryGenkit(() => recoverVoterIds({ imageUri, candidateIds }));
      const idToEpic = new Map<string, string>();
      for (const p of pairs) {
        const id = (p.id || '').trim();
        const epic = normalizeEpic(p.voterId);
        if (id && epic) idToEpic.set(id, epic);
      }
      withEpic = voters.map(v => {
        const existing = normalizeEpic(v.voterId);
        if (existing) return { ...v, voterId: existing };
        const recovered = v.id ? normalizeEpic(idToEpic.get(v.id)) : '';
        return recovered ? { ...v, voterId: recovered } : v;
      });
    } catch {
      withEpic = voters.map(v => ({ ...v, voterId: normalizeEpic(v.voterId) }));
    }

    // Recover house numbers if missing
    let withHouse: Voter[] = withEpic;
    try {
      const { pairs } = await retryGenkit(() => recoverHouseNumbers({ imageUri, candidateIds }));
      const idToHouse = new Map<string, string>();
      for (const p of pairs) {
        const id = (p.id || '').trim();
        const hn = normalizeDigits(p.houseNumber);
        if (id && hn) idToHouse.set(id, hn);
      }
      withHouse = withEpic.map(v => {
        const existing = normalizeDigits(v.houseNumber);
        if (existing) return { ...v, houseNumber: existing };
        const recovered = v.id ? normalizeDigits(idToHouse.get(v.id)) : '';
        return recovered ? { ...v, houseNumber: recovered } : v;
      });
    } catch {
      withHouse = withEpic.map(v => ({ ...v, houseNumber: normalizeDigits(v.houseNumber) }));
    }

    const normalized = withHouse.map(v => ({
      ...v,
      voterId: normalizeEpic(v.voterId),
      assemblyConstituencyNumber: normalizeAssemblyNumber(v.assemblyConstituencyNumber),
      assemblyConstituencyName: normalizeAssemblyName(v.assemblyConstituencyName),
      sectionNumber: normalizeDigits(v.sectionNumber),
      houseNumber: normalizeDigits(v.houseNumber),
      ageAsOn: normalizeDate(v.ageAsOn),
      publicationDate: normalizeDate(v.publicationDate),
    }));

    return NextResponse.json({ voters: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
}