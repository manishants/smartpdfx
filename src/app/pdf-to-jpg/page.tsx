
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileImage, FileArchive, Sparkles, Zap, ImageIcon, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { ToolSections } from '@/components/tool-sections';
import { getCustomToolSections } from '@/lib/tool-sections-config';
import { pdfToPng } from '@/lib/actions/pdf-to-png';


type PdfToJpgOutput = {
  imageUris: string[];
};

const ToolDescription = () => (
  <ModernSection
    title="AI-Enhanced PDF Processing"
    subtitle="Convert PDF pages to high-quality images with intelligent optimization"
    icon={<ImageIcon className="h-6 w-6" />}
    className="mt-12"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Smart Conversion</h3>
        </div>
        <p className="text-muted-foreground">
          Our AI-powered engine converts every page of your PDF document into individual, high-quality JPG images with optimal resolution and clarity.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Intelligent Processing</h3>
        </div>
        <p className="text-muted-foreground">
          Advanced algorithms ensure text and graphics are sharp and clear in the resulting JPG files, perfect for presentations, websites, and professional use.
        </p>
      </div>
    </div>
    <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
          <FileArchive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="font-semibold text-amber-900 dark:text-amber-100">Pro Tip</h3>
      </div>
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Download individual images by clicking on them, or get all images at once in a convenient ZIP archive for easy organization and sharing.
      </p>
    </div>
  </ModernSection>
);

const FAQ = () => (
  <ModernSection
    title="AI-Powered PDF Conversion"
    subtitle="Frequently Asked Questions"
    icon={<Sparkles className="h-6 w-6" />}
    className="mt-12"
  >
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
      <AccordionItem value="item-6">
        <AccordionTrigger>How does AI enhance the conversion process?</AccordionTrigger>
        <AccordionContent>
          Our AI algorithms optimize image rendering, automatically adjust quality settings based on content type, and ensure the best possible output for different types of PDF content including text, graphics, and mixed media.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<PdfToJpgOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File) => {
    if (file && file.type === 'application/pdf') {
      setFile(file);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
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
      pdfjsLib.GlobalWorkerOptions.disableWorker = true;
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

  const handleServerConvert = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a PDF to convert.', variant: 'destructive' });
      return;
    }
    setIsConverting(true);
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const base64 = Buffer.from(buf).toString('base64');
      const pdfUri = `data:application/pdf;base64,${base64}`;
      const out = await pdfToPng({ pdfUri });
      if (out.error) throw new Error(out.error);
      if (!out.imageUris || out.imageUris.length === 0) throw new Error('No images returned');
      setResult({ imageUris: out.imageUris });
      toast({ title: 'Server Export Complete', description: `Converted ${out.imageUris.length} page(s) via LibreOffice.` });
    } catch (error: any) {
      console.error('Server export failed:', error);
      toast({ title: 'Server Export Failed', description: error.message || 'LibreOffice conversion error.', variant: 'destructive' });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <ModernPageLayout>
      <ModernSection
        title="PDF to JPG Converter"
        subtitle="Transform your PDF documents into high-quality JPG images with AI-powered precision"
        icon={<ImageIcon className="h-8 w-8" />}
        className="text-center"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Area */}
          <ModernUploadArea
            onFileSelect={handleFileChange}
            accept="application/pdf"
            title="Upload PDF File"
            subtitle="Select a PDF file to convert to JPG images"
            icon={<FileText className="h-12 w-12 text-primary/60" />}
          />

          {/* File Info */}
          {file && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                   <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                 </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">{file.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Convert to JPG
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleServerConvert}
                  disabled={isConverting}
                  variant="secondary"
                  className="ml-2"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Convert via LibreOffice (Server)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {result && result.imageUris && result.imageUris.length > 0 && (
            <ModernSection
              title="Conversion Complete"
              subtitle={`Successfully converted ${result.imageUris.length} page${result.imageUris.length > 1 ? 's' : ''} to JPG`}
              icon={<Sparkles className="h-6 w-6" />}
              className="mt-8"
            >
              <div className="space-y-6">
                {/* Download All Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadAll}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download All as ZIP
                  </Button>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.imageUris.map((imageData, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <div className="aspect-[3/4] relative bg-gray-50 dark:bg-gray-900">
                        <img
                          src={imageData}
                          alt={`Page ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Page {index + 1}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = imageData;
                              link.download = `page-${index + 1}.jpg`;
                              link.click();
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          >
                            <FileDown className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Convert Another Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setIsConverting(false);
                    }}
                    variant="outline"
                    className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Convert Another PDF
                  </Button>
                </div>
              </div>
            </ModernSection>
          )}
        </div>
      </ModernSection>

      <ToolDescription />

      <ToolSections 
        toolName="PDF to JPG" 
        sections={getCustomToolSections("PDF to JPG")} 
      />

      <FAQ />
      <AllTools />
    </ModernPageLayout>
  );
}
