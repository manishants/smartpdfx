
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileUp, Loader2, RefreshCw, FileType } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import * as pdfjsLib from 'pdfjs-dist';
import { Packer, Document, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the PDF to Word conversion work?</AccordionTrigger>
                <AccordionContent>
                    Our tool works entirely in your browser. It reads the PDF file, analyzes the text content along with its styling (font, size, bold, italic), and then uses that information to reconstruct a new, editable Microsoft Word (.docx) document that preserves the original look and feel.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will my formatting and images be kept?</AccordionTrigger>
                <AccordionContent>
                    This tool does an excellent job of preserving text formatting like font styles, sizes, and colors. However, it does not transfer embedded images. The output is a richly formatted Word document with the text content, perfect for editing or copying.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>What happens with scanned PDFs (OCR)?</AccordionTrigger>
                <AccordionContent>
                    If your PDF is a scanned document (an image of text), this tool cannot extract the text because there is no text layer. For scanned documents, you should use our AI-powered <a href="/pdf-ocr" className="text-primary underline">PDF OCR tool</a> to extract the text first.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
       if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    
    toast({
        title: "Heads Up!",
        description: "If your PDF is a scanned document (image-based), the resulting Word file may be empty. For scanned PDFs, use our OCR tool.",
        duration: 6000,
    });
    
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      const numPages = pdf.numPages;
      const paragraphs: Paragraph[] = [];

      for(let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent({
              normalizeWhitespace: true,
          });
          
          if (textContent.items.length === 0) continue;

          let currentLine: TextRun[] = [];

          textContent.items.forEach((item: any, index: number) => {
              if (item.str.trim() === '' && item.hasEOL) {
                  if (currentLine.length > 0) {
                      paragraphs.push(new Paragraph({ children: currentLine }));
                      currentLine = [];
                  }
                   paragraphs.push(new Paragraph({ children: [] })); // Empty paragraph for new line
              } else if (item.str.trim() !== '') {
                  const fontName = item.fontName;
                  const isBold = fontName.toLowerCase().includes('bold');
                  const isItalic = fontName.toLowerCase().includes('italic') || fontName.toLowerCase().includes('oblique');

                  currentLine.push(new TextRun({
                      text: item.str,
                      font: fontName.split('-')[0] || 'Calibri',
                      size: Math.round(item.height * 2), // pdf.js height is in px, docx size is in half-points
                      bold: isBold,
                      italics: isItalic,
                  }));
              }
              if (item.hasEOL) {
                  if (currentLine.length > 0) {
                      paragraphs.push(new Paragraph({ children: currentLine }));
                      currentLine = [];
                  }
              }
          });
           if (currentLine.length > 0) {
              paragraphs.push(new Paragraph({ children: currentLine }));
           }
      }


      if (paragraphs.length === 0) {
        throw new Error("No text could be extracted. The PDF might be image-based.");
      }

      const doc = new Document({
        sections: [{
          children: paragraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}.docx`;

      saveAs(blob, newFilename);

    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Could not extract text from the PDF.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setIsConverting(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">PDF to Word</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your PDF into an editable Word document.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!file && (
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
            )}

            {file && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                </div>
                <div className="flex gap-4">
                    <Button 
                      size="lg" 
                      onClick={handleConvert}
                      disabled={isConverting}
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Converting...
                        </>
                       ) : <><FileUp className="mr-2"/>Convert to Word & Download</>}
                    </Button>
                     <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Start Over
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
