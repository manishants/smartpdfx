
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, ScanText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { OcrPageInput, OcrPageOutput } from '@/lib/types';
import { ocrPdfPage } from '@/lib/actions/ocr-pdf-to-searchable-pdf';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What is a searchable PDF?</AccordionTrigger>
                <AccordionContent>
                    A searchable PDF looks exactly like the original scanned document, but it contains a hidden layer of text that you can select, copy, and search. This tool creates that text layer using Optical Character Recognition (OCR).
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Why is selecting the language important?</AccordionTrigger>
                <AccordionContent>
                    Telling our AI the correct language of your document significantly improves the accuracy of the text recognition. This is especially important for non-Latin scripts like Hindi (Devanagari).
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Will this change the appearance of my PDF?</AccordionTrigger>
                <AccordionContent>
                    No, the visual appearance of your PDF will remain exactly the same. The tool only adds an invisible layer of text on top of the original document image, making the content interactive without altering how it looks.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

const languages = [
    { value: 'eng', label: 'English' },
    { value: 'hin', label: 'Hindi' },
    { value: 'spa', label: 'Spanish' },
    { value: 'fra', label: 'French' },
    { value: 'deu', label: 'German' },
    { value: 'chi_sim', label: 'Chinese (Simplified)' },
    { value: 'ara', label: 'Arabic' },
]

export default function OcrPdfToSearchablePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [result, setResult] = useState<{ searchablePdfUri: string } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
       if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
      }
    }
  };

  const handleProcess = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to process.", variant: "destructive" });
        return;
    }
    if (!language) {
        toast({ title: "No language selected", description: "Please select the document language.", variant: "destructive" });
        return;
    }
    
    setIsProcessing(true);
    setResult(null);
    setProgress(0);

    try {
      const pdfBuffer = await file.arrayBuffer();
      const sourcePdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
      const numPages = sourcePdf.numPages;

      const newPdfDoc = await PDFDocument.create();
      const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 1; i <= numPages; i++) {
        setProcessingMessage(`Processing page ${i} of ${numPages}...`);
        
        const page = await sourcePdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (!context) throw new Error('Could not create canvas context');

        await page.render({ canvasContext: context, viewport }).promise;
        const imageUri = canvas.toDataURL('image/jpeg');

        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        const jpgImage = await newPdfDoc.embedJpg(imageUri);
        newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        });

        const ocrInput: OcrPageInput = { imageUri, language };
        const ocrResult = await ocrPdfPage(ocrInput);
        
        if (ocrResult && ocrResult.ocrResults) {
            for (const result of ocrResult.ocrResults) {
                if (result.text && result.box) {
                    newPage.drawText(result.text, {
                        x: result.box.x,
                        y: viewport.height - result.box.y - result.box.height,
                        font,
                        size: result.box.height * 0.8,
                        color: rgb(0, 0, 0),
                        opacity: 0,
                    });
                }
            }
        }
        setProgress(((i / numPages) * 100));
      }

      setProcessingMessage('Finalizing PDF...');
      const searchablePdfBytes = await newPdfDoc.save();
      const searchablePdfUri = `data:application/pdf;base64,${Buffer.from(searchablePdfBytes).toString('base64')}`;
      setResult({ searchablePdfUri });
      
    } catch (error: any) {
      console.error("Processing failed:", error);
      toast({
        title: "Processing Failed",
        description: error.message || "An unknown error occurred. The PDF might be corrupted or in an unsupported format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
      setProgress(0);
    }
  };
  
  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-searchable.pdf`;
      
      const a = document.createElement('a');
      a.href = result.searchablePdfUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setLanguage('eng');
    setIsProcessing(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">OCR PDF to Searchable PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert scanned PDFs into searchable documents with selectable text.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!isProcessing && !result && (
              <>
                {!file ? (
                  <div 
                    className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 font-semibold text-primary">Drag & drop a PDF here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                    <Input 
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                   <div className="flex flex-col items-center gap-6">
                      <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                          <FileType className="w-16 h-16 text-primary" />
                          <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                      </div>
                      <div className="w-full max-w-sm space-y-2">
                          <Label htmlFor="language">Document Language</Label>
                          <Select value={language} onValueChange={setLanguage}>
                              <SelectTrigger id="language">
                                  <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                              <SelectContent>
                                  {languages.map(lang => (
                                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <Button 
                        size="lg" 
                        onClick={handleProcess}
                      >
                         <ScanText className="mr-2"/> Make Searchable
                      </Button>
                    </div>
                )}
              </>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-lg font-semibold">{processingMessage}</p>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <p className="text-muted-foreground">{file.name} is now a searchable PDF.</p>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Convert Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
