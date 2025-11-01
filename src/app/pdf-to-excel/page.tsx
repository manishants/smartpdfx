'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, FileText, Upload, Download, Loader2, RefreshCw, FileUp } from 'lucide-react';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { ToolSections } from '@/components/tool-sections';
import { getCustomToolSections } from '@/lib/tool-sections-config';
import { pdfToExcel } from '@/lib/actions/pdf-to-excel';

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [xlsxUri, setXlsxUri] = useState<string | null>(null);
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
      // Use FileReader to avoid Node Buffer in the browser
      const pdfUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await pdfToExcel({ pdfUri });
      if (res.error) throw new Error(res.error);
      if (!res.xlsxUri) throw new Error('No XLSX output');
      setXlsxUri(res.xlsxUri);
      toast({ title: 'Conversion Successful', description: 'Your Excel file is ready to download.' });
    } catch (e: any) {
      toast({ title: 'Conversion Failed', description: e.message || 'LibreOffice export error.', variant: 'destructive' });
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
    <ModernPageLayout>
      <ModernSection
        title="PDF to Excel"
        subtitle="Export tables and text from PDF into an XLSX spreadsheet via LibreOffice"
        icon={<FileSpreadsheet className="h-8 w-8" />}
        className="text-center"
      >
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
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleConvert} disabled={isConverting}>
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Convert with LibreOffice
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
      </ModernSection>

      <ToolSections toolName="PDF to Excel" sections={getCustomToolSections('PDF to Excel')} />
    </ModernPageLayout>
  );
}