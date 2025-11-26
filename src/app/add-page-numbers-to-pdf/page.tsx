"use client";
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileDown, Loader2, RefreshCw, Milestone, FileType, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { addPageNumbersToPdf } from '@/lib/actions/add-page-numbers-to-pdf';
import type { AddPageNumbersInput, AddPageNumbersOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';
export const dynamic = 'force-dynamic';
interface UploadedFile {
  file: File;
  name: string;
}
type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Can I customize the font or color of the page numbers?</AccordionTrigger>
                <AccordionContent>
                    Currently, our tool adds page numbers in a standard font (Helvetica), size, and color (black) for simplicity and consistency. We are working on adding customization options in a future update.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What format will the page numbers be in?</AccordionTrigger>
                <AccordionContent>
                    The page numbers will be in the format "Page X / Y", where X is the current page number and Y is the total number of pages in the document.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Are my uploaded files secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. We take your privacy very seriously. Your PDF is uploaded over a secure connection (HTTPS), processed on our server to add the page numbers, and then permanently deleted one hour later.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);
export default function AddPageNumbersPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AddPageNumbersOutput | null>(null);
  const { toast } = useToast();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile({ file: selectedFile, name: selectedFile.name });
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
  const handleProcess = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a PDF.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    try {
      const pdfUri = await fileToDataUri(file.file);
      const input: AddPageNumbersInput = { pdfUri, position };
      
      const processResult = await addPageNumbersToPdf(input);
      
      if (processResult && processResult.numberedPdfUri) {
        setResult(processResult);
      } else {
        throw new Error("Processing returned no data.");
      }
    } catch (error: any) {
      console.error("Processing failed:", error);
      toast({
        title: "Processing Failed",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-numbered.pdf`;
      
      const a = document.createElement('a');
      a.href = result.numberedPdfUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsProcessing(false);
  };
  return (
    <>
    <div className="py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Add Page Numbers to PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Easily insert page numbers into your PDF documents.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto mt-8">
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
                <div className="w-full max-w-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-center">Bottom Center</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Numbers...
                    </>
                   ) : <><Milestone className="mr-2"/> Add Page Numbers</>}
                </Button>
              </div>
            )}
            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Success!</h2>
                 <p className="text-muted-foreground">Page numbers have been added to {file.name}.</p>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Numbered PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Process Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
        <FAQ />
      <ToolHowtoRenderer slug="add-page-numbers-to-pdf" />
      <ToolCustomSectionRenderer slug="add-page-numbers-to-pdf" />
      </div>
    </div>
    <AllTools />
    </>
  );
}
