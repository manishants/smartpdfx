# Maharashtra Municipal Voter List Tool (Free OCR)

This tool replicates the features of the "Maharashtra Municipal Voter List Tool (V2)" while replacing Genkit AI (LLM-driven extraction) with a free, open-source alternative: Tesseract.js OCR. It maintains feature parity across analysis, data normalization, UI display, and Excel export.

## Library Selection Rationale

- Chosen Library: `tesseract.js` (v6)
- Criteria and fit:
  - Feature compatibility: OCR provides raw text extraction enabling the same parsing pipeline used by V2 with Genkit; we implemented robust regex/context parsing to recover voter fields and page metadata.
  - Performance: Tesseract.js running server-side with `eng+hin+mar` traineddata yields reliable recall on municipal voter grids. We added DPI fallback (220 → 300) to boost low-count pages.
  - Community/docs: Widely used, maintained, clear API, CDN for traineddata.
  - License: Apache-2.0 compatible; no usage fees or quotas.

## Feature Parity

- Inputs: Image and PDF uploads (50-page sequential processing cap, same as V2).
- Extraction: Page-by-page OCR with retry and higher-DPI fallback for low-count pages.
- Fields: `id`, `voterId` (EPIC), `name`, `fatherOrHusbandName`, `gender`, `age`, `houseNumber`, plus page-level `acPartInfo`, `wardPartNo`, `wardPartName`, `ageAsOn`, `publicationDate`.
- Normalization: EPIC uppercasing, AC/Part triple normalization, house-number extraction after colon, date normalization.
- Dedup: EPIC-based deduplication only when a strong key exists; otherwise retain all.
- UI: Identical table columns, progress indicators, Excel export filename (`maharashtra-municipal-voters-free.xlsx`).
- API: New route mirrors V2 output shape for backward compatibility.

## Implementation Details

- API route: `src/app/api/voter-extract-free/analyze-page/route.ts`
  - OCR using `Tesseract.recognize(buffer, 'eng+hin+mar')`.
  - `extractPageMetadata(text)`: recovers ward-part number/name, `acPartInfo (e.g., 172/25/001)`, and dates.
  - `parseVotersFromText(text, meta)`: context-window parsing around EPIC occurrences; captures name, FH name, gender, age, house number; attaches metadata.
- UI page: `src/app/maharastra-muncipal-voters-free/page.tsx`
  - PDF processing uses pdf.js; renders to JPEG at 220 DPI and falls back to 300 DPI.
  - Sequential processing with fixed page cap of 50; progress display updated per page.
  - Data quality notes added when normalization fails (e.g., missing colon in house number).
- SEO hiding:
  - Robots: `src/app/robots.ts` disallows `/maharastra-muncipal-voters-free/**`.
  - Sitemap: `src/app/sitemap.ts` excludes `maharastra-muncipal-voters-free` directory.

## Migration Instructions

1. Navigate to the free tool at `/maharastra-muncipal-voters-free`.
2. Upload the same PDFs/images used in V2.
3. Verify the table outputs and Excel export match V2’s format.
4. Integrations consuming the JSON from V2 can consume the free tool’s output, as the voter objects maintain the same fields.
5. No changes required for other tools; Genkit remains in place elsewhere.

## Known Limitations

- OCR vs LLM:
  - OCR depends on render quality; we mitigate with DPI fallback and multi-language models, but extreme image noise may reduce recall.
  - Field recovery is rule/regex-driven; rare formatting deviations may require parser rule updates.
- Performance:
  - OCR is CPU-bound; page processing time may be longer than LLM-based structured extraction under some configurations.
- Dates/labels:
  - If PDFs omit explicit labels or use unusual typography, metadata extraction may be partial.

## Testing

- Unit tests: `src/__tests__/voter-extract-free.spec.ts`
  - Verifies metadata extraction and voter parsing across English/Devanagari samples.
  - Confirms EPIC, names, FH names, gender, age, and house-number extraction.
- Run: `npm run test:free` (or `npm run test` for all).

## Performance Tips

- Use clean PDFs whenever possible; avoid scans with heavy compression.
- If a page returns very few voters, let the page finish; fallback DPI automatically re-runs.
- Batch size remains sequential to avoid concurrency-related skips observed previously.

## Maintenance

- Parser rules in `route.ts` can be extended for new labels or local language variants.
- Tesseract.js language packs can be tuned by adjusting the `recognize` languages.

