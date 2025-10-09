
"use client";

import { useState } from 'react';
import { Packer, Document, Paragraph } from 'docx';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, RefreshCw, Wand2, Clipboard, ClipboardCheck, FileDown, FileType } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { PdfOcrInput, PdfOcrOutput } from '@/lib/types';
import { pdfOcr } from '@/ai/flows/pdf-ocr';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What kind of PDFs work best for OCR?</AccordionTrigger>
                <AccordionContent>
                    Our PDF OCR tool works best with scanned documents and PDFs that contain clear, machine-readable text. For PDFs that were created from a text document (like a Word file), the text extraction will be nearly perfect. For scanned documents, higher resolution and clear text will yield better results.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can it read handwritten text in a PDF?</AccordionTrigger>
                <AccordionContent>
                    Currently, our AI model is optimized for printed text. While it may pick up some clear, printed-style handwriting, it is not designed to accurately transcribe cursive or messy handwriting.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is there a limit to the PDF file size or number of pages?</AccordionTrigger>
                <AccordionContent>
                    While our tool is powerful, processing very large PDFs with hundreds of pages can be time-consuming. For best performance, we recommend using PDFs of a reasonable size (e.g., under 50 MB and fewer than 100 pages). Your files are always handled securely and deleted after one hour.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PdfOcrPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<PdfOcrOutput | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile({ file: selectedFile });
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
      }
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExtract = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a PDF to process.", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    setResult(null);
    try {
      const pdfUri = await fileToDataUri(file.file);
      const input: PdfOcrInput = { pdfUri };
      
      const extractionResult = await pdfOcr(input);
      
      if (extractionResult) {
        setResult(extractionResult);
      } else {
        throw new Error("Text extraction returned no data.");
      }
    } catch (error: any) {
      console.error("Extraction failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while extracting text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsExtracting(false);
    setHasCopied(false);
  };
  
  const handleCopyToClipboard = () => {
    if (result && result.text) {
      navigator.clipboard.writeText(result.text);
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!result || !result.text) {
      toast({ title: "No text to download", description: "Please extract text from a PDF first.", variant: "destructive" });
      return;
    }

    const { saveAs } = (await import('file-saver'));

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: result.text }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "extracted-text.docx");
    });
  };

  return (
    <>
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">PDF OCR</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Extract text from any PDF document using AI.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Upload and File Preview */}
              <div className="flex flex-col gap-4">
                 {!file && (
                  <div 
                    className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 font-semibold text-primary">Click to upload a PDF</p>
                    <Input 
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                 )}
                 {file && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                            <FileType className="w-16 h-16 text-primary" />
                            <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.file.name}</p>
                        </div>
                        <Button 
                          className="w-full"
                          size="lg" 
                          onClick={handleExtract}
                          disabled={isExtracting}
                        >
                          {isExtracting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Extracting Text...
                            </>
                           ) : <><Wand2 className="mr-2"/>Extract Text</>}
                        </Button>
                    </div>
                 )}
              </div>

              {/* Right Column: Text Result */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Textarea
                    placeholder={isExtracting ? "AI is reading the PDF..." : "Extracted text will appear here..."}
                    value={result?.text || ''}
                    readOnly
                    className="h-80 text-base"
                  />
                   {result && result.text && (
                     <Button
                       variant="ghost"
                       size="icon"
                       className="absolute top-2 right-2"
                       onClick={handleCopyToClipboard}
                       title="Copy to clipboard"
                     >
                       {hasCopied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                     </Button>
                   )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        className="w-full"
                        variant="secondary"
                        onClick={handleDownload}
                        disabled={!result || !result.text}
                    >
                      <FileDown className="mr-2" />
                      Download .docx
                    </Button>
                    <Button 
                        className="w-full"
                        variant="outline"
                        onClick={handleReset}
                        disabled={!file}
                    >
                      <RefreshCw className="mr-2" />
                      Start Over
                    </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
