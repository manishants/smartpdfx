
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, ArrowRight, RefreshCw, FileType, CheckCircle, Minimize2 } from "lucide-react";
import { compressImage } from '@/lib/actions/compress-image';
import { convertImagesToPdf } from '@/lib/actions/convert-images-to-pdf';
import { useToast } from '@/hooks/use-toast';
import type { CompressPdfOutput } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as pdfjsLib from 'pdfjs-dist';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export const dynamic = 'force-dynamic';

// It's recommended to host this worker file yourself
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


interface UploadedFile {
  file: File;
  name: string;
}

type ProcessingState = 'idle' | 'convertingToImages' | 'compressing' | 'convertingToPdf' | 'done';

const ToolDescription = () => (
    <div className="max-w-4xl mx-auto my-12 text-center">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Advanced PDF Compression Technology</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Our PDF Compressor provides a powerful solution to drastically reduce the file size of your documents without sacrificing readability. We use a sophisticated, client-side process: the tool first deconstructs your PDF into individual high-quality images, then our powerful <Link href="/compress-image" className="text-primary hover:underline">image compression</Link> engine optimizes each one. Finally, it reassembles them into a new, lightweight PDF.
                </p>
                <p>
                    <strong>Features:</strong> This method is perfect for large documents with many images, ensuring they become easy to share via email or upload to the web. Your files are processed in your browser, offering maximum privacy and security.
                </p>
                <p className="text-sm">
                    This service is free to use. To support our work, please consider a <Link href="#" className="text-primary font-bold hover:underline">Donation of just ₹1</Link>. It helps us keep the lights on!
                </p>
            </CardContent>
        </Card>
    </div>
);


const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the PDF compression work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses a multi-step process for optimal compression. First, we convert each page of your PDF into a high-quality JPEG image. Then, we run our advanced image compression algorithm on each of these images. Finally, we rebuild a new PDF document from the compressed images. This method significantly reduces file size while maintaining good visual quality.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will I lose quality when compressing my PDF?</AccordionTrigger>
                <AccordionContent>
                    There will be a slight reduction in quality, as our method involves image compression. However, we've optimized the process to ensure the text remains sharp and readable, and images are clear. For most documents, the quality difference is barely noticeable, but the file size reduction is significant.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my files safe?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is our priority. Your files are processed securely on our servers and are automatically and permanently deleted one hour after processing. We do not store or access your files.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function CompressPdfPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressPdfOutput | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(75);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
       if (selectedFile.type === 'application/pdf') {
        setFile({ file: selectedFile, name: selectedFile.name });
        setResult(null);
        setProcessingState('idle');
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
      }
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const convertPdfToImagesClient = async (pdfFile: File): Promise<string[]> => {
    const images: string[] = [];
    const fileBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Use a good scale for quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            images.push(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG for better compression
        }
    }
    return images;
  }

  const handleCompress = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to compress.", variant: "destructive" });
        return;
    }
    setIsProcessing(true);
    setResult(null);
    try {
      
      // Step 1: Convert PDF to images on the client
      setProcessingState('convertingToImages');
      setProgress(10);
      const imageUris = await convertPdfToImagesClient(file.file);
      if (!imageUris || imageUris.length === 0) throw new Error("Could not extract images from PDF.");

      // Step 2: Compress each image
      setProcessingState('compressing');
      const compressedImageUris: string[] = [];
      for (let i = 0; i < imageUris.length; i++) {
        const compressedResult = await compressImage({ imageUri: imageUris[i], quality: quality });
        compressedImageUris.push(compressedResult.compressedImageUri);
        setProgress(10 + (70 * (i + 1)) / imageUris.length);
      }

      // Step 3: Convert compressed images back to PDF
      setProcessingState('convertingToPdf');
      setProgress(90);
      const { pdfUri: compressedPdfUri } = await convertImagesToPdf({ imageUris: compressedImageUris });
      
      const originalSize = file.file.size;
      const compressedBlob = await (await fetch(compressedPdfUri)).blob();
      const compressedSize = compressedBlob.size;

      setResult({
        compressedPdfUri,
        originalSize,
        compressedSize,
      });
      setProcessingState('done');
      setProgress(100);

    } catch (error: any) {
      console.error("Compression failed:", error);
      toast({
        title: "Compression Failed",
        description: error.message || "Something went wrong while compressing your PDF. Please try again.",
        variant: "destructive"
      });
      setProcessingState('idle');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-compressed.pdf`;
      
      const a = document.createElement('a');
      a.href = result.compressedPdfUri;
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
    setProcessingState('idle');
    setProgress(0);
  };

  const compressionPercentage = useMemo(() => {
    if (!result || !result.originalSize) return 0;
    const reduction = result.originalSize - result.compressedSize;
    if (reduction <= 0) return 0;
    return Math.round((reduction / result.originalSize) * 100);
  }, [result]);
  
  const processingMessage = useMemo(() => {
    switch (processingState) {
        case 'convertingToImages': return 'Step 1/3: Analyzing PDF pages...';
        case 'compressing': return 'Step 2/3: Compressing images...';
        case 'convertingToPdf': return 'Step 3/3: Rebuilding PDF...';
        default: return 'Compressing PDF';
    }
  }, [processingState]);

  return (
    <>
    <div className="space-y-8 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Compress PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Reduce the file size of your PDF documents quickly and easily.
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

            {file && !result && !isProcessing && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                    <Badge variant="outline" className="mt-2">{formatBytes(file.file.size)}</Badge>
                </div>
                 <div className="w-full space-y-4">
                    <Label htmlFor="quality">Compression Quality: {quality}%</Label>
                    <Slider 
                        id="quality"
                        value={[quality]}
                        onValueChange={([v]) => setQuality(v)}
                        min={10}
                        max={100}
                        step={1}
                    />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleCompress}
                  disabled={isProcessing}
                >
                  <Minimize2 className="mr-2"/>Compress PDF
                </Button>
              </div>
            )}
            
             {isProcessing && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-lg font-semibold">{processingMessage}</p>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
                </div>
             )}


            {result && file && !isProcessing && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Compression Successful!</h2>
                  {compressionPercentage > 0 ? (
                    <p className="text-muted-foreground">
                        Your file is now <span className="font-bold text-primary">{compressionPercentage}%</span> smaller.
                    </p>
                    ) : (
                    <p className="text-muted-foreground">The file size could not be reduced further.</p>
                    )
                  }
                 <div className="flex items-center gap-4 text-sm font-mono mt-2">
                    <span className="text-muted-foreground">{formatBytes(result.originalSize)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                    <span className="font-bold text-foreground">{formatBytes(result.compressedSize)}</span>
                 </div>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Compressed PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Compress Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ToolDescription />
      <FAQ />
    </div>
    <AllTools />
    </>
  );
}
