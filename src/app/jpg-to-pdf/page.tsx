
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X, FileImage, FileDown, Loader2 } from "lucide-react";
import { convertImagesToPdf } from '@/lib/actions/convert-images-to-pdf';
import { useToast } from '@/hooks/use-toast';
import type { ConvertImagesToPdfInput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
                <AccordionTrigger>Can I convert other image formats besides JPG?</AccordionTrigger>
                <AccordionContent>
                    Yes! Although the tool is named "JPG to PDF", it supports a variety of image formats including PNG, GIF, WEBP, and BMP. You can upload a mix of different image types, and they will all be converted into a single PDF.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will my images be compressed or lose quality?</AccordionTrigger>
                <AccordionContent>
                    No, we prioritize quality. Your images are embedded into the PDF document without any additional compression. The quality of the images in the PDF will be the same as the original files you uploaded.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>How are the images ordered in the PDF?</AccordionTrigger>
                <AccordionContent>
                    The images will appear in the PDF in the same order that you see them on the screen after uploading. If you want to reorder them, you will need to remove the files and upload them in your desired sequence.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function JpgToPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          file,
          preview: URL.createObjectURL(file),
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
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          file,
          preview: URL.createObjectURL(file),
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

  const handleConvert = async () => {
    if (files.length === 0) {
        toast({ title: "No files selected", description: "Please select at least one image to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    setPdfUrl(null);
    try {
      const imageUris = await Promise.all(files.map(f => fileToDataUri(f.file)));
      const input: ConvertImagesToPdfInput = { imageUris };
      
      const result = await convertImagesToPdf(input);
      
      if (result && result.pdfUri) {
        setPdfUrl(result.pdfUri);
      } else {
        throw new Error("Conversion returned no data.");
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: "Something went wrong while converting your images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleDownload = () => {
    if (pdfUrl && files.length > 0) {
      const firstFilename = files[0].file.name;
      const baseFilename = firstFilename.substring(0, firstFilename.lastIndexOf('.'));
      const newFilename = `${baseFilename}.pdf`;

      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  const handleReset = () => {
    setFiles([]);
    setPdfUrl(null);
    setIsConverting(false);
  }

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Image to PDF Converter</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your JPG, PNG, GIF, and other images to a single PDF file.
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
                  <p className="mt-4 font-semibold text-primary">Drag & drop files here, or click to select files</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, GIF, BMP, WEBP</p>
                  <Input 
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/bmp,image/webp"
                    onChange={handleFileChange}
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Selected Files:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden">
                          <img src={file.preview} alt={`preview ${index}`} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveFile(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <Button 
                    size="lg" 
                    onClick={handleConvert}
                    disabled={files.length === 0 || isConverting}
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                     ) : "Convert to PDF"}
                  </Button>
                </div>
              </>
            )}

            {pdfUrl && (
              <div className="text-center">
                 <FileImage className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <p className="text-muted-foreground mt-2">Your PDF is ready for download.</p>
                 <div className="mt-6 space-x-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      Convert More
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
