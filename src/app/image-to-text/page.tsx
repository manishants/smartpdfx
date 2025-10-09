
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, RefreshCw, Wand2, Clipboard, ClipboardCheck, FileDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createWorker, OEM } from 'tesseract.js';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What is OCR?</AccordionTrigger>
                <AccordionContent>
                    OCR stands for Optical Character Recognition. It's a technology that converts different types of documents, such as scanned paper documents, PDF files, or images captured by a digital camera into editable and searchable data.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What kind of images work best?</AccordionTrigger>
                <AccordionContent>
                    For the best results, use high-quality images with clear, printed text. The text should be well-lit and not heavily distorted. The tool can handle various fonts, but standard, clean fonts work best. It may struggle with very stylized or messy handwriting.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is our top priority. The entire OCR process happens in your browser. Your image is never uploaded to our servers, ensuring your data remains completely private.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function ImageToTextPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile({
          file: selectedFile,
          preview: URL.createObjectURL(selectedFile),
        });
        setExtractedText(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      }
    }
  };

  const handleExtract = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image to process.", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    setExtractedText(null);
    setProgress(0);
    setStatus('Initializing OCR engine...');

    const worker = await createWorker('eng+hin', OEM.TESSERACT_LSTM_COMBINED, {
      logger: (m) => {
        setStatus(m.status);
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    try {
        const { data: { text } } = await worker.recognize(file.file);
        setExtractedText(text);
    } catch (error: any) {
      console.error("Extraction failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while extracting text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
      setProgress(0);
      setStatus('');
      await worker.terminate();
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText(null);
    setIsExtracting(false);
    setHasCopied(false);
  };
  
  const handleCopyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!extractedText) {
      toast({ title: "No text to download", description: "Please extract text from an image first.", variant: "destructive" });
      return;
    }

    const { saveAs } = (await import('file-saver'));
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, "extracted-text.txt");
  };

  return (
    <>
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Image to Text (OCR)</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Extract English and Hindi text from any image using client-side OCR.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Upload and Image Preview */}
              <div className="flex flex-col gap-4">
                 {!file && (
                  <div 
                    className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 font-semibold text-primary">Click to upload an image</p>
                    <Input 
                      id="file-upload"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                 )}
                 {file && (
                    <div className="space-y-4">
                        <div className="relative w-full border rounded-lg overflow-hidden shadow-md">
                           <Image src={file.preview} alt="Uploaded preview" width={800} height={600} className="w-full h-auto object-contain" />
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
                              Extracting...
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
                    placeholder={isExtracting ? "Processing in your browser..." : "Extracted text will appear here..."}
                    value={extractedText || ''}
                    readOnly
                    className="h-80 text-base"
                  />
                   {extractedText && (
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
                {isExtracting && (
                    <div className="space-y-2">
                        <p className="text-sm text-center text-muted-foreground capitalize">{status}</p>
                        <Progress value={progress} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        className="w-full"
                        variant="secondary"
                        onClick={handleDownload}
                        disabled={!extractedText}
                    >
                      <FileDown className="mr-2" />
                      Download .txt
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
