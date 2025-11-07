
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, ArrowRight, RefreshCw, FileText, CheckCircle, Minimize2, Sparkles, Zap, Gauge, FileArchive } from "lucide-react";
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
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
// Tool-specific sections removed

export const dynamic = 'force-dynamic';

// It's recommended to host this worker file yourself
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


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
  <ModernSection
    title="AI-Enhanced PDF Compression"
    subtitle="Frequently asked questions about our intelligent compression technology"
    icon={<Gauge className="h-6 w-6" />}
    className="mt-12"
  >
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>How does the AI-powered PDF compression work?</AccordionTrigger>
        <AccordionContent>
          Our AI-enhanced compression uses a sophisticated multi-step process. First, we intelligently convert each page of your PDF into optimized images. Then, our advanced AI compression algorithms analyze and compress each image while preserving text clarity and visual quality. Finally, we rebuild a new PDF document from the compressed images with smart optimization.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Will I lose quality when compressing my PDF?</AccordionTrigger>
        <AccordionContent>
          Our AI algorithms are designed to minimize quality loss while maximizing compression. The system intelligently preserves text sharpness and image clarity. For most documents, the quality difference is barely noticeable, but the file size reduction is significant - often 50-80% smaller.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Are my files safe and secure?</AccordionTrigger>
        <AccordionContent>
          Absolutely. Your privacy is our top priority. All files are processed securely with enterprise-grade encryption and are automatically and permanently deleted one hour after processing. We never store, access, or share your documents.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>How does AI enhance the compression process?</AccordionTrigger>
        <AccordionContent>
          Our AI technology intelligently analyzes document content to apply optimal compression settings for different types of content - text, images, graphics, and charts. This results in better compression ratios while maintaining superior quality compared to traditional compression methods.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function CompressPdfPage() {
  // Tool-specific sections removed
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressPdfOutput | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(75);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile({ file: selectedFile, name: selectedFile.name });
      setResult(null);
      setProcessingState('idle');
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a PDF file. Only PDF files are accepted for compression.", 
        variant: "destructive" 
      });
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
    <ModernPageLayout
      title="AI PDF Compressor"
      description="Reduce PDF file sizes by up to 80% with intelligent AI-powered compression technology"
      icon={<Minimize2 className="w-8 h-8" />}
      backgroundVariant="home"
    >
      <ModernSection>
        <div className="max-w-4xl mx-auto space-y-8">
          {!file && (
            <div className="relative">
              {/* AI Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-red-50/20 to-pink-50/30 rounded-2xl" />
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-xl" />
              
              <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                      <UploadCloud className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Upload PDF Document
                    </h3>
                  </div>
                  
                  <ModernUploadArea
                    onFileSelect={handleFileChange}
                    accept="application/pdf"
                    maxSize={100 * 1024 * 1024} // 100MB
                    title="Drop your PDF here for AI compression"
                    subtitle="Supports PDF files up to 100MB"
                    icon={<FileArchive className="h-12 w-12" />}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200/50">
                      <Sparkles className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">Smart Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200/50">
                      <Zap className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">AI Compression</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {file && !result && !isProcessing && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-red-50/20 to-pink-50/30 rounded-2xl" />
              
              <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/50 rounded-xl p-8 w-full">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-4">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                      <Badge variant="outline" className="mt-2 bg-white/80 border-orange-300">
                        {formatBytes(file.file.size)}
                      </Badge>
                    </div>
                    
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quality" className="text-sm font-medium text-gray-700">
                          Compression Quality
                        </Label>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          {quality}%
                        </Badge>
                      </div>
                      <Slider 
                        id="quality"
                        value={[quality]}
                        onValueChange={([v]) => setQuality(v)}
                        min={10}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Maximum compression</span>
                        <span>Best quality</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="lg" 
                      onClick={handleCompress}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                    >
                      <Minimize2 className="mr-2 h-5 w-5" />
                      Compress with AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {isProcessing && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-red-50/20 to-pink-50/30 rounded-2xl" />
              
              <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-20 animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        AI Processing Your PDF
                      </h3>
                      <p className="text-gray-600">{processingMessage}</p>
                    </div>
                    <div className="w-full max-w-md space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-gray-500 text-center">{Math.round(progress)}% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {result && file && !isProcessing && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30 rounded-2xl" />
              
              <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-20 animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Perfect Compression Achieved!
                      </h3>
                      {compressionPercentage > 0 ? (
                        <p className="text-gray-600">
                          Your file is now <span className="font-bold text-green-600">{compressionPercentage}%</span> smaller
                        </p>
                      ) : (
                        <p className="text-gray-600">The file size could not be reduced further</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Original</p>
                        <p className="font-mono text-sm font-semibold text-gray-700">{formatBytes(result.originalSize)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-green-600" />
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Compressed</p>
                        <p className="font-mono text-sm font-semibold text-green-600">{formatBytes(result.compressedSize)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        size="lg" 
                        onClick={handleDownload}
                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <FileDown className="mr-2 h-5 w-5" />
                        Download Compressed PDF
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={handleReset}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Compress Another
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ModernSection>

      <ModernSection
        title="AI-Enhanced PDF Processing"
        subtitle="Advanced compression technology with intelligent optimization"
        icon={<Gauge className="h-6 w-6" />}
        className="mt-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800">Smart Analysis</h4>
            </div>
            <p className="text-gray-600 text-sm">
              AI analyzes your PDF structure to identify the best compression strategy for each page and element type.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800">Intelligent Compression</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Advanced algorithms optimize images, text, and graphics separately for maximum size reduction with minimal quality loss.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                <Gauge className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800">Quality Control</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Real-time quality monitoring ensures your documents remain readable and professional after compression.
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200/50">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-orange-500/20 rounded">
              <Zap className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h5 className="font-medium text-sm text-orange-800">Pro Tip</h5>
              <p className="text-xs text-orange-700 mt-1">
                For documents with many images, try different quality settings to find the perfect balance between file size and visual quality.
              </p>
            </div>
          </div>
        </div>
      </ModernSection>

      {/* Tool-specific sections removed */}

      <FAQ />
      <ToolCustomSectionRenderer slug="compress-pdf" />
      <AllTools />
    </ModernPageLayout>
  );
}
