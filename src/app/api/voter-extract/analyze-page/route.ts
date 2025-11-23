import { NextRequest, NextResponse } from 'next/server';
import { extractVoters } from '@/ai/flows/extract-voter-list';
import { recoverHouseNumbers } from '@/ai/flows/recover-house-numbers';
import { recoverVoterIds } from '@/ai/flows/recover-voter-ids';
import { recoverAcTriple } from '@/ai/flows/recover-ac-triple';
import { recoverWardPart } from '@/ai/flows/recover-ward-part';
import { recoverVoterDetails } from '@/ai/flows/recover-voter-details';
import type { ExtractVotersInput, Voter } from '@/lib/types';
import { getRotatingGeminiKey } from '@/lib/apiKeysStore';
import { getActiveGeminiKey, reloadAi } from '@/ai/genkit';
// Removed local OCR fallback per request; use Gemini only.

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

// Removed auto-disabling logic; assume valid configured key per user instruction.


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
    // Ensure AI instance reflects latest enabled key immediately (no waiting for rotation timer)
    try {
      const activeKey = getActiveGeminiKey();
      const desiredKey = getRotatingGeminiKey();
      if (desiredKey && desiredKey !== activeKey) {
        reloadAi();
      }
    } catch {}
    const body = await req.json();
    const imageUri: string = body?.imageUri;
    if (!imageUri || typeof imageUri !== 'string') {
      return NextResponse.json({ error: 'imageUri is required' }, { status: 400 });
    }
    const perPageInput: ExtractVotersInput = { fileUri: imageUri };
    let voters: Voter[] = [];
    const pageResult = await retryGenkit(() => extractVoters(perPageInput));
    voters = Array.isArray(pageResult?.voters) ? pageResult.voters : [];

    // Recover EPIC voter IDs if missing
    // Recover voter IDs across the entire page (do not restrict by initial extraction)
    let pagePairs: { id: string; voterId: string }[] = [];
    try {
      const { pairs } = await retryGenkit(() => recoverVoterIds({ imageUri }));
      pagePairs = pairs || [];
    } catch {}
    const idToEpic = new Map<string, string>();
    for (const p of pagePairs) {
      const id = (p.id || '').trim();
      const epic = normalizeEpic(p.voterId);
      if (id && epic) idToEpic.set(id, epic);
    }

    // Prefer normalized EPIC on base results, but we will later merge by ids to include missing boxes
    const withEpic: Voter[] = voters.map(v => ({ ...v, voterId: normalizeEpic(v.voterId) }));

    // Recover house numbers (prefer full text)
    let withHouse: Voter[] = withEpic;
    try {
      const { pairs } = await retryGenkit(() => recoverHouseNumbers({ imageUri }));
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

    // Recover AC/Part/SNo triple and attach (all page)
    const acMap = new Map<string, string>();
    try {
      const { pairs } = await retryGenkit(() => recoverAcTriple({ imageUri }));
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

    // Recover FULL details for all candidate ids present on the page
    const candidateIds = Array.from(
      new Set([
        ...withHouse.map(v => (v.id || '').trim()).filter(Boolean),
        ...pagePairs.map(p => (p.id || '').trim()).filter(Boolean),
      ])
    );

    let details: Voter[] = [];
    try {
      if (candidateIds.length > 0) {
        const { voters: det } = await retryGenkit(() => recoverVoterDetails({ imageUri, candidateIds }));
        details = Array.isArray(det) ? det : [];
      } else {
        const { voters: det } = await retryGenkit(() => recoverVoterDetails({ imageUri }));
        details = Array.isArray(det) ? det : [];
      }
    } catch {}
    const idToDetails = new Map<string, Voter>();
    for (const d of details) {
      const id = (d.id || '').trim();
      if (id) idToDetails.set(id, d);
    }

    // Build final list using union of ids found
    let unionIds = Array.from(new Set(candidateIds));
    if (unionIds.length === 0 && details.length > 0) {
      unionIds = details.map(d => (d.id || '').trim()).filter(Boolean);
    }
    const normalized = unionIds.map((id) => {
      const base = withHouse.find(v => (v.id || '').trim() === id);
      const det = idToDetails.get(id);
      const epic = idToEpic.get(id) || normalizeEpic(base?.voterId || det?.voterId || '');
      const house = normalizeHouseText(
        (base?.houseNumber || '') || (det?.houseNumber || '')
      );
      return {
        id,
        name: (det?.name || base?.name || ''),
        fatherOrHusbandName: (det?.fatherOrHusbandName || base?.fatherOrHusbandName || ''),
        age: (det?.age || base?.age || ''),
        gender: (det?.gender || base?.gender || ''),
        voterId: epic,
        assemblyConstituencyNumber: normalizeAssemblyNumber(det?.assemblyConstituencyNumber || base?.assemblyConstituencyNumber || ''),
        assemblyConstituencyName: normalizeAssemblyName(det?.assemblyConstituencyName || base?.assemblyConstituencyName || ''),
        sectionNumber: normalizeDigits(det?.sectionNumber || base?.sectionNumber || ''),
        houseNumber: house,
        ageAsOn: normalizeDate(det?.ageAsOn || base?.ageAsOn || ''),
        publicationDate: normalizeDate(det?.publicationDate || base?.publicationDate || ''),
        acPartInfo: normalizeAcTriple((acMap.get(id) || (det as any)?.acPartInfo || (base as any)?.acPartInfo || '')),
        wardPartNo,
        wardPartName,
      } as Voter;
    });

    return NextResponse.json({ voters: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
}
