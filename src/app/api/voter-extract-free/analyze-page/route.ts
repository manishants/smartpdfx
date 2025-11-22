import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'
import type { Voter } from '@/lib/types'

// Helper: decode data URI to Buffer
function dataUriToBuffer(dataUri: string): Buffer {
  const m = dataUri.match(/^data:([^;]+);base64,(.*)$/)
  if (!m) throw new Error('Invalid data URI')
  return Buffer.from(m[2], 'base64')
}

function normalizeEpic(s?: string): string {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function extractPageMetadata(text: string): {
  wardPartNo?: string
  wardPartName?: string
  acPartInfo?: string
  ageAsOn?: string
  publicationDate?: string
} {
  const t = text.replace(/\r/g, '')

  // Ward Part No: e.g., "Ward Part No. 5 : 12"
  const wardNoMatch = t.match(/Ward\s*Part\s*No\.?\s*([0-9०-९]+\s*:\s*[0-9०-९]+)/i)
  const wardPartNo = wardNoMatch ? wardNoMatch[1].replace(/\s+/g, ' ') : undefined

  // Ward Part Name: e.g., "Ward Part Name. SHIVAJI NAGAR"
  const wardNameMatch = t.match(/Ward\s*Part\s*Name\.?\s*([\w\s\-–—]+)/i)
  const wardPartName = wardNameMatch ? wardNameMatch[1].trim() : undefined

  // AC triple: e.g., "172/25/001"
  const acTripleMatch = t.match(/\b[0-9०-९]+\s*\/\s*[0-9०-९]+\s*\/\s*[0-9०-९]+\b/)
  const acPartInfo = acTripleMatch ? acTripleMatch[0].replace(/\s*\/\s*/g, '/') : undefined

  // Dates (Age As On / Publication Date): dd-mm-yyyy
  const dateMatch = t.match(/\b\d{2}-\d{2}-\d{4}\b/g)
  const ageAsOn = dateMatch?.[0]
  const publicationDate = dateMatch?.[1]

  return { wardPartNo, wardPartName, acPartInfo, ageAsOn, publicationDate }
}

function extractHouseAfterColon(s?: string): string {
  if (!s) return ''
  const str = (s || '').trim()
  const mLabel = str.match(/घर\s*क्र(?:मांक|माक|\.)\s*[:：\-—]\s*(.+)$/)
  if (mLabel) return (mLabel[1] || '').trim()
  const asciiIdx = str.indexOf(':')
  const fullIdx = str.indexOf('：')
  let idx = -1
  if (asciiIdx !== -1 && fullIdx !== -1) idx = Math.min(asciiIdx, fullIdx)
  else idx = asciiIdx !== -1 ? asciiIdx : fullIdx
  if (idx !== -1) return str.slice(idx + 1).replace(/^\s+|\s+$/g, '')
  const labelNoDelim = str.match(/घर\s*क्र(?:मांक|माक|\.)\s*(.+)$/)
  if (labelNoDelim) return (labelNoDelim[1] || '').trim()
  return str
}

export function parseVotersFromText(text: string, meta: ReturnType<typeof extractPageMetadata>): Voter[] {
  const lines = text.replace(/\r/g, '').split(/\n+/).map(l => l.trim()).filter(Boolean)
  const voters: Voter[] = []

  // Map of EPIC to assembled record
  const epicRecords = new Map<string, Partial<Voter>>()

  // Scan lines to collect fields around EPIC occurrences
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // EPIC patterns: prefer explicit labels, else raw alphanumeric block length ~10
    const epicLabelMatch = line.match(/(?:EPIC|EPIC\s*No\.?|Epic|Epic\s*No\.?)\s*[:：]?\s*([A-Z0-9]{7,12})/i)
    let epicCandidate = epicLabelMatch?.[1]
    if (!epicCandidate) {
      const rawEpicMatch = line.match(/\b([A-Z]{2,4}[0-9]{6,8}[A-Z0-9]?)\b/)
      epicCandidate = rawEpicMatch?.[1]
    }
    if (!epicCandidate) continue

    const epic = normalizeEpic(epicCandidate)
    if (!epic || epic.length < 8) continue

    const rec: Partial<Voter> = epicRecords.get(epic) || {}
    rec.voterId = epic

    // Local context window: previous 5 lines and next 8 lines
    const ctxPrev = lines.slice(Math.max(0, i - 5), i)
    const ctxNext = lines.slice(i + 1, Math.min(lines.length, i + 9))
    const ctx = [...ctxPrev, line, ...ctxNext].join(' \n ')

    // Serial ID (क्रमांक / Sr No / ID)
    const idMatch = ctx.match(/(?:Sr\.?\s*No\.?|Serial\s*No\.?|ID|क्रमांक)\s*[:：]?\s*([0-9०-९]{1,4})/i)
    rec.id = idMatch ? idMatch[1]?.replace(/[^0-9०-९]/g, '') : rec.id

    // Name (Name / नाम)
    const nameMatch = ctx.match(/(?:Name|नाम)\s*[:：]?\s*([\p{L}\s\-–—\.]+?)(?:\s{2,}|$)/u)
    if (nameMatch) {
      rec.name = nameMatch[1]?.trim()
    } else {
      // Heuristic: line before EPIC often ends with name
      const prevLine = ctxPrev[ctxPrev.length - 1] || ''
      if (prevLine && !prevLine.match(/EPIC|House|घर|Age|Age\s*As\s*On|Publication/i)) {
        rec.name = prevLine.trim()
      }
    }

    // Father/Husband
    const fhMatch = ctx.match(/(?:Father\s*\/\s*Husband|Father|Husband|पिता\s*\/\s*पति|पिता|पति)\s*[:：]?\s*([\p{L}\s\-–—\.]+)/u)
    if (fhMatch) rec.fatherOrHusbandName = fhMatch[1]?.trim()

    // Gender
    const genderMatch = ctx.match(/\b(Male|Female|Other|M|F|पुरुष|महिला)\b/i)
    if (genderMatch) rec.gender = genderMatch[1]

    // Age
    const ageMatch = ctx.match(/(?:Age|वय)\s*[:：]?\s*([0-9]{1,3})/i)
    if (ageMatch) rec.age = ageMatch[1]

    // House No (House No / घर क्र.)
    const houseMatch = ctx.match(/(?:House\s*No\.?|घर\s*क्र(?:मांक|माक|\.)|घर\s*क्रमांक)\s*[:：\-—]?\s*([^\n]+)/i)
    if (houseMatch) rec.houseNumber = extractHouseAfterColon(houseMatch[0])

    // Attach page-level metadata if present
    if (meta.acPartInfo) (rec as any).acPartInfo = meta.acPartInfo
    if (meta.wardPartNo) (rec as any).wardPartNo = meta.wardPartNo
    if (meta.wardPartName) (rec as any).wardPartName = meta.wardPartName
    if (meta.ageAsOn) rec.ageAsOn = meta.ageAsOn
    if (meta.publicationDate) rec.publicationDate = meta.publicationDate

    epicRecords.set(epic, rec)
  }

  // Finalize records
  for (const rec of epicRecords.values()) {
    voters.push({
      id: (rec.id || '').toString(),
      voterId: rec.voterId || '',
      name: rec.name || '',
      fatherOrHusbandName: rec.fatherOrHusbandName || '',
      gender: rec.gender || '',
      age: rec.age || '',
      houseNumber: rec.houseNumber || '',
      assemblyConstituencyNumber: '',
      assemblyConstituencyName: '',
      sectionNumber: '',
      ageAsOn: rec.ageAsOn || '',
      publicationDate: rec.publicationDate || '',
      ...(rec as any).acPartInfo ? { acPartInfo: (rec as any).acPartInfo } : {},
      ...(rec as any).wardPartNo ? { wardPartNo: (rec as any).wardPartNo } : {},
      ...(rec as any).wardPartName ? { wardPartName: (rec as any).wardPartName } : {},
    } as Voter)
  }

  return voters
}

export async function POST(req: NextRequest) {
  try {
    const { imageUri } = await req.json()
    if (!imageUri || typeof imageUri !== 'string') {
      return NextResponse.json({ error: 'imageUri is required' }, { status: 400 })
    }

    const buffer = dataUriToBuffer(imageUri)

    // Recognize with multiple languages for better recall (Latin + Devanagari)
    const result = await Tesseract.recognize(buffer, 'eng+hin+mar', {
      // Use public tessdata CDN; Tesseract.js will fetch required traineddata files
      // You can override via env if needed: TESSDATA_URL
      // logger: m => console.log(m)
    })
    const text = result?.data?.text || ''

    const meta = extractPageMetadata(text)
    const voters = parseVotersFromText(text, meta)

    return NextResponse.json({ voters })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to analyze page' }, { status: 500 })
  }
}

