
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { pdfToWord } from '@/ai/flows/pdf-to-word';
import type { PdfToWordInput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the PDF to Word conversion work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses an advanced AI model with Optical Character Recognition (OCR) to scan your PDF. It extracts the text while trying to preserve the original paragraph and line break structure. This text is then used to generate a new, editable Microsoft Word (.docx) document.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will my formatting (bold, italics, etc.) and images be kept?</AccordionTrigger>
                <AccordionContent>
                    This version of our tool focuses on accurately extracting the text content and basic structure. It does not transfer complex formatting like font styles, colors, or embedded images. The output will be a clean Word document with unformatted text, perfect for when you need to copy or edit the content of a PDF.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is there a file size limit?</AccordionTrigger>
                <AccordionContent>
                    For best performance, we recommend uploading PDFs under 50MB. While larger files may work, processing time will be longer. All uploaded files are handled securely and are deleted from our servers one hour after processing to protect your privacy.
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

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    
    try {
      const pdfUri = await fileToDataUri(file);
      const input: PdfToWordInput = { pdfUri };
      
      const result = await pdfToWord(input);
      
      if (result && result.docxUri) {
        const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
        const newFilename = `${originalFilename}.docx`;
        const link = document.createElement("a");
        link.href = result.docxUri;
        link.download = newFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Conversion Successful!", description: "Your DOCX file is downloading." });
      } else {
        throw new Error("Conversion returned no data.");
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Something went wrong while converting your PDF. Please try again.",
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
