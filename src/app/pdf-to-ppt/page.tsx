
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import * as pdfjsLib from 'pdfjs-dist';
import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the PDF to PowerPoint conversion work?</AccordionTrigger>
                <AccordionContent>
                    Our tool works entirely in your browser. It renders each page of your PDF as a high-quality image and then inserts each image onto a separate slide in a new PowerPoint (.pptx) file. This ensures your layout and content are visually preserved.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will the text and images be editable in the final PPTX file?</AccordionTrigger>
                <AccordionContent>
                    No. Because each PDF page is converted into a single image, the text and other elements on the slide will not be editable. This method is best for preserving the exact look of your PDF in a presentation format.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my files secure?</AccordionTrigger>
                <AccordionContent>
                   Yes. The entire conversion process happens in your web browser. Your PDF file is never uploaded to our servers, ensuring your data remains completely private.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PdfToPptPage() {
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
    
    try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
        const numPages = pdf.numPages;
        
        const pptx = new PptxGenJS();
        
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High scale for better quality

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imageUri = canvas.toDataURL('image/png');
                
                const slide = pptx.addSlide();
                slide.addImage({
                    data: imageUri,
                    x: 0,
                    y: 0,
                    w: '100%',
                    h: '100%',
                });
            }
        }

        const blob = await pptx.write('blob');
        const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
        saveAs(blob, `${originalFilename}.pptx`);

        toast({
            title: "Conversion Successful!",
            description: "Your PowerPoint file has been downloaded.",
        });

    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Something went wrong while converting your PDF.",
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
        <h1 className="text-4xl font-bold font-headline">PDF to PowerPoint</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your PDF to an editable PPTX file.
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
                    ) : <><FileUp className="mr-2"/>Convert to PPT & Download</>}
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2" /> Start Over
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
