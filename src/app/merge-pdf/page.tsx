
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X, FileType, FileDown, Loader2, RefreshCw, FileJson } from "lucide-react";
import { mergePdfs } from '@/lib/actions/merge-pdf';
import { useToast } from '@/hooks/use-toast';
import type { MergePdfInput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  name: string;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How many PDF files can I merge at once?</AccordionTrigger>
                <AccordionContent>
                    You can upload and merge multiple PDF files at once. While there's no strict limit, we recommend merging a reasonable number of files for faster processing. For very large batches, performance may vary.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>In what order will the PDFs be merged?</AccordionTrigger>
                <AccordionContent>
                    The PDFs will be merged in the order they are listed on the screen after you upload them. To change the order, you can remove the files and re-upload them in the desired sequence.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my files and their content secure?</AccordionTrigger>
                <AccordionContent>
                    Yes, your security is our priority. All files are uploaded over a secure (HTTPS) connection. We process your files on our servers and permanently delete them one hour after the merge is complete. We never share your files with third parties.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function MergePdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
        .filter(file => file.type === 'application/pdf')
        .map(file => ({
          file,
          name: file.name,
        }));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files)
        .filter(file => file.type === 'application/pdf')
        .map(file => ({
          file,
          name: file.name,
        }));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleMerge = async () => {
    if (files.length < 2) {
        toast({ title: "Not enough files", description: "Please select at least two PDFs to merge.", variant: "destructive" });
        return;
    }
    setIsMerging(true);
    setPdfUrl(null);
    try {
      const pdfUris = await Promise.all(files.map(f => fileToDataUri(f.file)));
      const input: MergePdfInput = { pdfUris };
      
      const result = await mergePdfs(input);
      
      if (result && result.mergedPdfUri) {
        setPdfUrl(result.mergedPdfUri);
      } else {
        throw new Error("Merging returned no data.");
      }
    } catch (error) {
      console.error("Merging failed:", error);
      toast({
        title: "Merging Failed",
        description: "Something went wrong while merging your PDFs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMerging(false);
    }
  };
  
  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  const handleReset = () => {
    setFiles([]);
    setPdfUrl(null);
    setIsMerging(false);
  }

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Merge PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Combine multiple PDF files into one single document.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!pdfUrl && (
              <>
                <div 
                  className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                  <p className="mt-4 font-semibold text-primary">Drag & drop PDF files here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to select files</p>
                  <Input 
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Selected Files ({files.length}):</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileType className="h-5 w-5 text-primary shrink-0" />
                            <span className="truncate text-sm">{file.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)} className="h-6 w-6 shrink-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <Button 
                    size="lg" 
                    onClick={handleMerge}
                    disabled={files.length < 2 || isMerging}
                  >
                    {isMerging ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Merging...
                      </>
                     ) : <><FileJson className="mr-2"/> Merge PDFs</>}
                  </Button>
                </div>
              </>
            )}

            {pdfUrl && (
              <div className="text-center flex flex-col items-center gap-4">
                 <FileJson className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Merging Successful!</h2>
                 <p className="text-muted-foreground mt-2">Your merged PDF is ready for download.</p>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Merged PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Merge More
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
