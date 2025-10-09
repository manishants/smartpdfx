
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { pdfToExcel } from '@/ai/flows/pdf-to-excel';
import type { PdfToExcelInput, PdfToExcelOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the PDF to Excel conversion work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses a powerful AI model to analyze the content of your PDF. It specifically looks for tabular data structures. Once it identifies tables, it extracts the data and reconstructs it into a Microsoft Excel (.xlsx) file, placing each detected table onto a separate sheet for clarity.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will complex tables with merged cells be converted correctly?</AccordionTrigger>
                <AccordionContent>
                    The AI does its best to preserve the original structure of the tables, including columns and rows. However, extremely complex tables with many merged cells or irregular layouts might have some conversion inaccuracies. We always recommend reviewing the output file for correctness.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my financial documents safe?</AccordionTrigger>
                <AccordionContent>
                    Absolutely. We prioritize your privacy and security. Your PDF files are uploaded over an encrypted connection (HTTPS), processed automatically by the AI, and then permanently deleted from our servers one hour after the conversion is complete. We never store or share your data.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<PdfToExcelOutput | null>(null);
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
    setResult(null);
    try {
      const pdfUri = await fileToDataUri(file);
      const input: PdfToExcelInput = { pdfUri };
      
      const conversionResult = await pdfToExcel(input);
      
      if (conversionResult) {
        setResult(conversionResult);
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
  
  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}.xlsx`;
      
      const a = document.createElement('a');
      a.href = result.excelUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsConverting(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">PDF to Excel</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Extract tables from your PDF into an editable XLSX file.
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

            {file && !result && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                </div>
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
                   ) : <><FileUp className="mr-2"/>Convert to Excel</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download XLSX
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
