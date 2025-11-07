'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, FileText, Upload, Download, Loader2, RefreshCw, FileUp } from 'lucide-react';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { AIPoweredFeatures } from '@/components/ai-powered-features';
import { ProTip } from '@/components/pro-tip';
// Tool-specific sections removed
import { pdfToExcelAi } from '@/ai/flows/pdf-to-excel';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Ensure pdf.js worker does not fail to load under Next.js dev
pdfjsLib.GlobalWorkerOptions.disableWorker = true;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function convertPdfToExcelClient(pdfFile: File): Promise<string> {
  const buf = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const wb = XLSX.utils.book_new();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;
    const textContent = await page.getTextContent();
    const items = (textContent.items || []) as any[];

    const rows: { y: number; items: { x: number; y: number; w: number; h: number; str: string }[] }[] = [];
    const rowEpsBase = 2; // points

    for (const item of items) {
      const tx = item.transform || [1, 0, 0, 1, 0, 0];
      const fontHeight = Math.sqrt((tx[2] || 0) ** 2 + (tx[3] || 0) ** 2) || 12;
      const yTop = pageHeight - (tx[5] || 0) - fontHeight; // convert baseline to top
      const x = tx[4] || 0;
      const w = item.width || 0;
      const str = (item.str || '').trim();
      if (!str) continue;

      const rowEps = Math.max(rowEpsBase, fontHeight * 0.15);
      let row = rows.find((r) => Math.abs(r.y - yTop) < rowEps);
      if (!row) {
        row = { y: yTop, items: [] };
        rows.push(row);
      }
      row.items.push({ x, y: yTop, w, h: fontHeight, str });
    }

    // Sort rows by their top Y (top-to-bottom)
    rows.sort((a, b) => a.y - b.y);

    const aoa: string[][] = [];
    const gapBase = 12; // points

    for (const row of rows) {
      row.items.sort((a, b) => a.x - b.x);
      const cells: string[] = [];
      let current = '';
      let prev: { x: number; y: number; w: number; h: number; str: string } | null = null;

      for (const it of row.items) {
        if (!prev) {
          current = it.str;
        } else {
          const gap = it.x - (prev.x + prev.w);
          const thresh = Math.max(gapBase, (it.h + prev.h) * 0.25);
          if (gap > thresh) {
            cells.push(current.trim());
            current = it.str;
          } else {
            const needsSpace = /[A-Za-z0-9]$/.test(prev.str) && /^[A-Za-z0-9]/.test(it.str);
            current += (needsSpace ? ' ' : '') + it.str;
          }
        }
        prev = it;
      }
      if (current.length > 0) cells.push(current.trim());
      if (cells.length > 0) aoa.push(cells);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa.length > 0 ? aoa : [['No text content detected']]);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
  }

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  return url;
}
 


export default function PdfToExcelPage() {
  // Tool-specific sections removed
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [xlsxUri, setXlsxUri] = useState<string | null>(null);
  const [mode, setMode] = useState<'no_ocr' | 'ai_ocr'>('no_ocr');
  const { toast } = useToast();

  const handleFileChange = (f: File) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setXlsxUri(null);
    } else {
      toast({ title: 'Invalid file type', description: 'Please select a PDF file.', variant: 'destructive' });
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setXlsxUri(null);
    try {
      if (mode === 'no_ocr') {
        const url = await convertPdfToExcelClient(file);
        setXlsxUri(url);
        toast({ title: 'Conversion complete', description: 'Your Excel file is ready to download.' });
      } else {
        // Use FileReader to avoid Node Buffer in the browser
        const pdfUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await pdfToExcelAi({ pdfUri, conversionMode: 'ai_ocr' });
        setXlsxUri(res.xlsxUri);
        toast({ title: 'Conversion complete', description: 'Tables and text extracted into Excel.' });
      }
    } catch (e: any) {
      toast({ title: 'Conversion Failed', description: e.message || 'Conversion error.', variant: 'destructive' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (xlsxUri && file) {
      const link = document.createElement('a');
      link.href = xlsxUri;
      const name = file.name.replace(/\.[^/.]+$/, '.xlsx');
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFile(null);
    setXlsxUri(null);
    setIsConverting(false);
  };

  return (
    <ModernPageLayout
      title="PDF to Excel"
      description="Extract tables from PDFs into Excel. No OCR runs entirely in your browser using pdf.js; AI OCR handles scanned documents."
      icon={<FileSpreadsheet className="h-8 w-8" />}
      backgroundVariant="home"
    >
      <ModernSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="max-w-4xl mx-auto space-y-8">
          <ModernUploadArea
            onFileSelect={handleFileChange}
            accept="application/pdf"
            title="Upload PDF File"
            subtitle="Select a PDF file to convert to Excel"
            icon={<FileText className="h-12 w-12 text-primary/60" />}
          />

          {file && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <FileText className="h-6 w-6 text-green-700 dark:text-green-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 ${mode === 'no_ocr' ? 'border-primary' : 'border-border/50'}`}
                    onClick={() => setMode('no_ocr')}
                  >
                    <input type="radio" name="mode" className="mt-1" checked={mode === 'no_ocr'} readOnly />
                    <div>
                      <div className="font-medium">No OCR</div>
                      <div className="text-xs text-muted-foreground">Client-side table extraction in your browser. Best for text-based PDFs. No API key required.</div>
                    </div>
                  </label>
                  <label
                    className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 ${mode === 'ai_ocr' ? 'border-primary' : 'border-border/50'}`}
                    onClick={() => setMode('ai_ocr')}
                  >
                    <input type="radio" name="mode" className="mt-1" checked={mode === 'ai_ocr'} readOnly />
                    <div>
                      <div className="font-medium">AI OCR</div>
                      <div className="text-xs text-muted-foreground">Use AI to read scanned PDFs and output tables and text into Excel.</div>
                    </div>
                  </label>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleConvert} disabled={isConverting} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Convert
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                  {xlsxUri && (
                    <Button onClick={handleDownload} variant="secondary">
                      <Download className="mr-2 h-4 w-4" />
                      Download XLSX
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <AIPoweredFeatures 
              features={[
                'Client-side table extraction',
                'AI OCR for scanned PDFs',
                'Multi-sheet Excel output',
                'Fast and private processing',
              ]}
            />
            <ProTip tip="Use No OCR for text-based PDFs to keep everything in-browser. Switch to AI OCR for scanned or image-based documents to extract tables accurately." />
          </div>
        </div>
      </ModernSection>
      {/* FAQ */}
      <ModernSection
        title="PDF to Excel FAQs"
        subtitle="Answers to common questions about table extraction"
        icon={<Upload className="h-6 w-6" />}
        className="mt-12"
        contentClassName="w-full"
      >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does No OCR extraction work?</AccordionTrigger>
            <AccordionContent>
              No OCR analyzes PDF text positions in your browser using pdf.js and groups them into rows and columns heuristically, then builds an Excel workbook with those tables. No server upload.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>When should I use AI OCR?</AccordionTrigger>
            <AccordionContent>
              Use AI OCR for scanned PDFs or documents without selectable text. AI reads the page images and rebuilds tables into Excel.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Why do I see an error on No OCR?</AccordionTrigger>
            <AccordionContent>
              No OCR is browser-only and works on PDFs with selectable text. If your PDF is scanned (no selectable text) or very complex, switch to AI OCR. If you still see errors, try reloading the page or using a simpler PDF.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ModernSection>

      <ToolCustomSectionRenderer slug="pdf-to-excel" />
      <AllTools />
    </ModernPageLayout>
  );
}