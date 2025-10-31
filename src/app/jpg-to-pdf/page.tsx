
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X, FileImage, FileDown, Loader2, Sparkles, Zap, FileText, ImageIcon } from "lucide-react";
import { convertImagesToPdf } from '@/lib/actions/convert-images-to-pdf';
import { useToast } from '@/hooks/use-toast';
import type { ConvertImagesToPdfInput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { ToolSections } from '@/components/tool-sections';
import { getCustomToolSections } from '@/lib/tool-sections-config';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

const FAQ = () => (
  <ModernSection
    title="AI-Powered PDF Creation"
    subtitle="Frequently Asked Questions"
    icon={<Sparkles className="h-6 w-6" />}
    className="mt-12"
  >
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
      <AccordionItem value="item-4">
        <AccordionTrigger>What makes this PDF converter AI-powered?</AccordionTrigger>
        <AccordionContent>
          Our AI engine optimizes image placement, automatically adjusts page layouts for the best visual presentation, and intelligently handles different image sizes and orientations to create professional-looking PDFs.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function JpgToPdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (files: File[] | null) => {
    if (files) {
      const newFiles = files
        .filter(file => {
          if (!file.type.startsWith('image/')) {
            toast({
              title: "Invalid file type",
              description: `${file.name} is not a valid image file. Please select JPG, PNG, GIF, BMP, or WEBP files.`,
              variant: "destructive"
            });
            return false;
          }
          return true;
        })
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
    <ModernPageLayout
      title="AI Image to PDF Converter"
      subtitle="Transform your images into professional PDFs with intelligent layout optimization"
      icon={<FileText className="h-8 w-8" />}
    >
      <ModernSection
        title="Smart PDF Creation"
        subtitle="Upload multiple images and let our AI create the perfect PDF layout"
        icon={<ImageIcon className="h-6 w-6" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!pdfUrl && (
              <div className="space-y-6">
                <ModernUploadArea
                  onFilesSelected={handleFileChange}
                  acceptedTypes={["image/jpeg", "image/png", "image/jpg", "image/gif", "image/bmp", "image/webp"]}
                  multiple={true}
                  title="Upload Images"
                  subtitle="Drag & drop your images here or click to browse"
                  supportText="Supports JPG, PNG, GIF, BMP, WEBP"
                />

                {files.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Selected Images ({files.length})
                      </h3>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group border rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-300">
                          <img src={file.preview} alt={`preview ${index}`} className="w-full h-32 object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveFile(index)} className="rounded-full">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs truncate">{file.file.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={handleConvert}
                    disabled={files.length === 0 || isConverting}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating PDF with AI...
                      </>
                     ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Convert to PDF
                      </>
                     )}
                  </Button>
                </div>
              </div>
            )}

            {pdfUrl && (
              <div className="text-center space-y-6 p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200 dark:border-green-800">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                    <FileImage className="relative h-16 w-16 text-green-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">PDF Created Successfully!</h2>
                  <p className="text-green-600 dark:text-green-400">Your images have been intelligently arranged into a professional PDF.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white">
                    <FileDown className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleReset} className="border-green-300 text-green-700 hover:bg-green-50">
                    <Zap className="mr-2 h-5 w-5" />
                    Convert More Images
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">AI-Powered Features</h3>
              </div>
              <ul className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Intelligent layout optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Automatic image orientation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Smart page sizing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Quality preservation</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Pro Tip</h3>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                For best results, upload images in the order you want them to appear in the PDF. Our AI will optimize the layout while maintaining your preferred sequence.
              </p>
            </div>
          </div>
        </div>
      </ModernSection>

      <ToolSections 
        toolName="JPG to PDF" 
        sections={getCustomToolSections("JPG to PDF")} 
      />

      <FAQ />
    </ModernPageLayout>
  );
}
