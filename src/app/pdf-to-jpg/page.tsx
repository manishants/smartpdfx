
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileImage, FileArchive } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type PdfToJpgOutput = {
  imageUris: string[];
};

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Convert PDF to High-Quality JPG</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Easily convert every page of your PDF document into individual, high-quality JPG images. This tool is perfect for when you need to use PDF pages as images in presentations, on websites, or in any other context where an image format is required.
                </p>
                <p>
                    Our converter renders each page at a good resolution to ensure that the text and graphics are sharp and clear in the resulting JPG files. You can download each image individually or get all of them at once in a convenient ZIP archive.
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
                <AccordionTrigger>What quality will the output JPG images have?</AccordionTrigger>
                <AccordionContent>
                    The tool renders each PDF page at a resolution of 150 DPI (dots per inch) and saves it as a JPG with 90% quality. This provides an excellent balance between image clarity and file size, suitable for most web and print applications.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I convert a password-protected PDF?</AccordionTrigger>
                <AccordionContent>
                    No, our tool cannot process password-protected PDFs. You will need to remove the password from the PDF file before uploading it for conversion. You can use our <a href="/unlock-pdf" className="text-primary underline">Unlock PDF</a> tool for this.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Are my files secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. This entire conversion process happens directly in your browser. Your PDF file is never uploaded to our servers, ensuring maximum privacy and security.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Is there a file size or page limit?</AccordionTrigger>
                <AccordionContent>
                    Since the processing is done on your own computer, the limit depends on your device's memory and processing power. Most modern computers can handle PDFs with dozens of pages without issue.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I convert JPG images back to a PDF?</AccordionTrigger>
                <AccordionContent>
                    Yes, absolutely! We have a dedicated <a href="/jpg-to-pdf" className="text-primary underline">JPG to PDF Converter</a> that allows you to combine one or more images into a single PDF file.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<PdfToJpgOutput | null>(null);
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

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    setResult(null);
    try {
      const fileBuffer = await file.arrayBuffer();
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      const imageUris: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Use a good scale for quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const imageUri = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
          imageUris.push(imageUri);
        }
      }
      
      if (imageUris.length > 0) {
        setResult({ imageUris });
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
  
  const handleDownloadAll = async () => {
    if (result && file) {
        const zip = new JSZip();
        const baseFilename = file.name.substring(0, file.name.lastIndexOf('.'));

        result.imageUris.forEach((uri, index) => {
            const imgData = uri.split(',')[1];
            zip.file(`${baseFilename}-page-${index + 1}.jpg`, imgData, { base64: true });
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${baseFilename}-images.zip`);
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
        <h1 className="text-4xl font-bold font-headline">PDF to JPG</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert each page of your PDF into a JPG image.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto">
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
                   ) : <><FileImage className="mr-2"/>Convert to JPG</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <p className="text-muted-foreground">Generated {result.imageUris.length} image(s).</p>
                 
                 <ScrollArea className="h-48 w-full border rounded-md p-4 mt-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {result.imageUris.map((uri, index) => (
                            <a key={index} href={uri} download={`${file.name}-page-${index + 1}.jpg`}>
                                <Image src={uri} alt={`Page ${index + 1}`} width={100} height={140} className="rounded-md border shadow-md hover:scale-105 transition-transform" />
                            </a>
                        ))}
                    </div>
                 </ScrollArea>
                 
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownloadAll}>
                      <FileArchive className="mr-2" />
                      Download All (.zip)
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
