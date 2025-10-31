"use client";

import { useState } from 'react';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileDown, Loader2, RefreshCw, ScanText, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { convertImagesToPdf } from '@/lib/actions/convert-images-to-pdf';
import { ToolSections } from '@/components/tool-sections';
import { getCustomToolSections } from '@/lib/tool-sections-config';
import { AllTools } from '@/components/all-tools';

pdfjsLib.GlobalWorkerOptions.disableWorker = true;

export default function ScanPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [dpi, setDpi] = useState<number>(150);
  const { toast } = useToast();

  const handleFileSelect = (f: File) => {
    if (!f || f.type !== 'application/pdf') {
      toast({ title: 'Invalid file type', description: 'Please select a PDF file.', variant: 'destructive' });
      return;
    }
    setFile(f);
    setResultUri(null);
  };

  const convertToImages = async (pdfFile: File, targetDpi: number): Promise<string[]> => {
    const images: string[] = [];
    const buf = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

    // Convert DPI to scale (PDF default is 72 DPI)
    const scale = targetDpi / 72;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        // Use JPEG to keep file sizes moderate
        const img = canvas.toDataURL('image/jpeg', 0.9);
        images.push(img);
      }
    }
    return images;
  };

  const handleConvert = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a PDF to convert.', variant: 'destructive' });
      return;
    }
    setIsConverting(true);
    setResultUri(null);
    try {
      const imageUris = await convertToImages(file, dpi);
      if (imageUris.length === 0) throw new Error('Could not rasterize PDF pages.');
      const { pdfUri } = await convertImagesToPdf({ imageUris });
      setResultUri(pdfUri);
      toast({ title: 'Scanned PDF ready!', description: 'Your privacy-preserving scanned PDF has been created.' });
    } catch (e: any) {
      toast({ title: 'Conversion failed', description: e.message || 'Unexpected error converting to scanned PDF.', variant: 'destructive' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUri(null);
    setIsConverting(false);
  };

  return (
    <ModernPageLayout
      title="PDF to Scanned PDF"
      description="Convert any PDF to a privacy-preserving, image-based scanned PDF. Optional DPI control for quality vs. size." 
      icon={<ScanText className="w-8 h-8" />}
      badge="Privacy Mode"
      backgroundVariant="home"
    >
      <ModernSection>
        <div className="max-w-3xl mx-auto space-y-8">
          <ModernUploadArea
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF"
            subtitle="We will rasterize each page into an image"
            icon={<FileText className="h-12 w-12 text-primary/60" />}
          />

          {file && (
            <Card className="border border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{file.name}</div>
                    <div className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="dpi" className="text-sm font-medium">DPI</label>
                  <Input id="dpi" type="number" min={72} max={300} value={dpi} onChange={(e) => setDpi(Number(e.target.value) || 150)} className="w-24" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleConvert} disabled={isConverting}>
                    {isConverting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Converting...</>) : (<><ScanText className="mr-2 h-4 w-4" />Convert to Scanned PDF</>)}
                  </Button>
                  <Button variant="outline" onClick={handleReset}><RefreshCw className="mr-2 h-4 w-4" />Reset</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {resultUri && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Scanned PDF generated successfully.</p>
              <Button asChild>
                <a href={resultUri} download={file?.name.replace('.pdf', '-scanned.pdf')}>
                  <FileDown className="mr-2 h-4 w-4" /> Download Scanned PDF
                </a>
              </Button>
            </div>
          )}
        </div>
      </ModernSection>

      <ToolSections toolName="PDF to Scanned PDF" sections={getCustomToolSections('PDF to Scanned PDF')} />

      <ModernSection
        title="Frequently Asked Questions"
        subtitle="Details about the privacy-preserving scanned PDF conversion"
        icon={<ScanText className="h-6 w-6" />}
        className="mt-12"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">What is a scanned PDF?</h3>
            <p className="text-muted-foreground">A scanned PDF is an image-only PDF where each page is a rasterized image, removing selectable text and embedded metadata for stronger privacy.</p>
          </div>
          <div>
            <h3 className="font-semibold">Does this run locally?</h3>
            <p className="text-muted-foreground">Yes. Pages are rasterized in your browser using PDF.js, and the output PDF is assembled client-side. No files are sent to our servers.</p>
          </div>
          <div>
            <h3 className="font-semibold">What DPI should I use?</h3>
            <p className="text-muted-foreground">72 DPI is baseline. 150 DPI offers a good balance of readability and size. Use 300 DPI for higher quality at larger file sizes.</p>
          </div>
        </div>
      </ModernSection>

      <AllTools />
    </ModernPageLayout>
  );
}