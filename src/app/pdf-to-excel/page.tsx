
"use client";

import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md-p-8">
            <CardTitle className="text-2xl font-bold mb-4">Reliable Excel to PDF Conversion</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Easily convert your Microsoft Excel spreadsheets (.xls, .xlsx) into professional, easy-to-share PDF documents. Our tool ensures that your formatting, tables, and charts are preserved, creating a perfect snapshot of your work.
                </p>
                <p>
                    This is ideal for creating reports, sharing financial data, or archiving documents in a fixed, universal format. The conversion process is fast, secure, and happens right in your browser.
                </p>
            </CardContent>
        </Card>
    </div>
);

const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Will all my Excel sheets be converted?</AccordionTrigger>
                <AccordionContent>
                    Yes, the tool is designed to convert all sheets within your Excel workbook into pages in the final PDF document. Each sheet will be rendered as it appears in Excel.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Are my financial documents and data secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. We prioritize your privacy. Your files are uploaded over a secure connection, processed on our servers, and then permanently deleted one hour after conversion. We never store or share your data.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Can I convert a PDF back to Excel?</AccordionTrigger>
                <AccordionContent>
                    This tool is for Excel to PDF conversion. We are working on a separate AI-powered tool to extract tables from PDFs back into Excel format.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ pdfUri: string } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
       if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select an XLS or XLSX file.", variant: "destructive" });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select an Excel document to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    setResult(null);
    try {
      // Placeholder logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      const conversionResult = { pdfUri: "data:application/pdf;base64," };
      
      if (conversionResult) {
        // setResult(conversionResult);
        toast({ title: "Coming Soon!", description: "This feature is not yet implemented.", variant: "default" });
      } else {
        throw new Error("Conversion returned no data.");
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Something went wrong while converting your document.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
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
        <h1 className="text-4xl font-bold font-headline">Excel to PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your Excel spreadsheets to PDF files.
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
                <p className="mt-4 font-semibold text-primary">Drag & drop an Excel file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
                   ) : <><FileUp className="mr-2"/>Convert to PDF</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" asChild>
                      <a href={result.pdfUri} download={`${file.name}.pdf`}><FileDown className="mr-2" />Download PDF</a>
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
      <ToolDescription />
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
