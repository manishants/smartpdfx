import { NextRequest, NextResponse } from 'next/server';
import { extractVoters } from '@/ai/flows/extract-voter-list';
import { recoverHouseNumbers } from '@/ai/flows/recover-house-numbers';
import { recoverVoterIds } from '@/ai/flows/recover-voter-ids';
import { recoverAcTriple } from '@/ai/flows/recover-ac-triple';
import { recoverWardPart } from '@/ai/flows/recover-ward-part';
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

const normalizeAcTriple = (s?: string) => {
  const m = (s || '').match(/[0-9०-९]+\s*\/\s*[0-9०-९]+\s*\/\s*[0-9०-९]+/);
  return m ? m[0].replace(/\s*\/\s*/g, '/') : '';
};

const normalizeHouseText = (s?: string) => (s || '').trim();
const normalizeWardPartNo = (s?: string) => {
  const raw = (s || '').trim();
  if (!raw) return '';
  // Accept ASCII or Devanagari digits with optional spaces and fullwidth colon.
  const m = raw.match(/[0-9०-९]+\s*[:：]\s*[0-9०-९]+/);
  if (!m) return '';
  return m[0].replace(/\s*[:：]\s*/, ' : ');
};
const normalizeWardPartName = (s?: string) => (s || '').replace(/^[-—–]\s*/, '').trim();

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

    // Recover house numbers (prefer full text)
    let withHouse: Voter[] = withEpic;
    try {
      const { pairs } = await retryGenkit(() => recoverHouseNumbers({ imageUri, candidateIds }));
      const idToHouse = new Map<string, string>();
      for (const p of pairs) {
        const id = (p.id || '').trim();
        const hn = normalizeHouseText(p.houseNumber);
        if (id && hn) idToHouse.set(id, hn);
      }
      withHouse = withEpic.map(v => {
        const existing = normalizeHouseText(v.houseNumber);
        const recovered = v.id ? normalizeHouseText(idToHouse.get(v.id)) : '';
        const preferRecovered = !!recovered && ((!/^[0-9०-९]+$/.test(recovered)) || (recovered.length > existing.length));
        const house = preferRecovered ? recovered : existing;
        return house ? { ...v, houseNumber: house } : v;
      });
    } catch {
      withHouse = withEpic.map(v => ({ ...v, houseNumber: normalizeHouseText(v.houseNumber) }));
    }

    // Recover AC/Part/SNo triple and attach
    const acMap = new Map<string, string>();
    try {
      const { pairs } = await retryGenkit(() => recoverAcTriple({ imageUri, candidateIds }));
      for (const p of pairs) {
        const id = (p.id || '').trim();
        const ac = normalizeAcTriple(p.acPartInfo);
        if (id && ac) acMap.set(id, ac);
      }
    } catch {}

    // Recover Ward Part info once per page
    let wardPartNo = '';
    let wardPartName = '';
    try {
      const { partNo, partName } = await retryGenkit(() => recoverWardPart({ imageUri }));
      wardPartNo = normalizeWardPartNo(partNo);
      wardPartName = normalizeWardPartName(partName);
    } catch {}

    const normalized = withHouse.map(v => ({
      ...v,
      voterId: normalizeEpic(v.voterId),
      assemblyConstituencyNumber: normalizeAssemblyNumber(v.assemblyConstituencyNumber),
      assemblyConstituencyName: normalizeAssemblyName(v.assemblyConstituencyName),
      sectionNumber: normalizeDigits(v.sectionNumber),
      houseNumber: normalizeHouseText(v.houseNumber),
      ageAsOn: normalizeDate(v.ageAsOn),
      publicationDate: normalizeDate(v.publicationDate),
      acPartInfo: normalizeAcTriple((acMap.get(v.id || '') || (v as any).acPartInfo || '')),
      wardPartNo,
      wardPartName,
    }));

    return NextResponse.json({ voters: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
}