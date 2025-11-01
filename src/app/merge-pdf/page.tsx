
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X, FileText, FileDown, Loader2, RefreshCw, FileJson, Sparkles, Zap, Layers, Combine } from "lucide-react";
import { mergePdfs } from '@/lib/actions/merge-pdf';
import { useToast } from '@/hooks/use-toast';
import type { MergePdfInput } from '@/lib/types';
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
  name: string;
}

const FAQ = () => (
  <ModernSection
    title="AI-Powered PDF Merging"
    subtitle="Frequently Asked Questions"
    icon={<Layers className="h-6 w-6" />}
    className="mt-12"
  >
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>How many PDF files can I merge at once?</AccordionTrigger>
        <AccordionContent>
          You can upload and merge multiple PDF files at once. Our AI-powered system can handle large batches efficiently. While there's no strict limit, we recommend merging a reasonable number of files for optimal processing speed.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>In what order will the PDFs be merged?</AccordionTrigger>
        <AccordionContent>
          The PDFs will be merged in the order they are listed on the screen after you upload them. You can easily reorder files by dragging and dropping them, or remove and re-upload them in the desired sequence.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Are my files and their content secure?</AccordionTrigger>
        <AccordionContent>
          Yes, your security is our priority. All files are uploaded over a secure (HTTPS) connection. We process your files on our servers and permanently delete them one hour after the merge is complete. We never share your files with third parties.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>How does AI enhance the merging process?</AccordionTrigger>
        <AccordionContent>
          Our AI algorithms optimize the merging process by analyzing document structures, preserving formatting, maintaining bookmarks and metadata, and ensuring the highest quality output while minimizing file size.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function MergePdfPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are accepted. Please select PDF files only.",
        variant: "destructive"
      });
      return;
    }
    const newItem = { file, name: file.name };
    setFiles(prevFiles => [...prevFiles, newItem]);
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
    <ModernPageLayout
      title="AI-Powered PDF Merger"
      description="Intelligently combine multiple PDF files into one seamless document with advanced AI optimization."
      icon={<Combine className="h-8 w-8" />}
      badge="AI Enhanced"
      gradient="from-purple-600 via-blue-600 to-cyan-500"
    >
      {!pdfUrl ? (
        <ModernSection
          title="Smart PDF Merging"
          subtitle="Upload multiple PDFs and let our AI create the perfect merged document"
          icon={<Sparkles className="h-6 w-6" />}
        >
          <ModernUploadArea
            onFileSelect={handleFileChange}
            accept="application/pdf"
            multiple={true}
            isLoading={isMerging}
            icon={<FileText className="h-12 w-12" />}
            title="Drop PDF files here"
            subtitle="or click to select multiple PDF files"
            className="mb-8"
          />

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Selected Files ({files.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Files will be merged in this order
                </p>
              </div>
              
              <div className="grid gap-3">
                {files.map((file, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-background to-muted/50 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                        {index + 1}
                      </div>
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={handleMerge}
                  disabled={files.length < 2 || isMerging}
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI is merging your PDFs...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Merge {files.length} PDFs with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {files.length === 0 && (
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Smart Merging</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Optimization</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Upload at least 2 PDF files to start merging
                </p>
              </div>
            </div>
          )}
        </ModernSection>
      ) : (
        <ModernSection
          title="Merge Complete!"
          subtitle="Your PDFs have been successfully merged with AI optimization"
          icon={<Sparkles className="h-6 w-6" />}
          className="text-center"
        >
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-4 rounded-full">
                  <FileText className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Perfect Merge Achieved!
              </h3>
              <p className="text-muted-foreground">
                Your merged PDF is ready with AI-enhanced optimization
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDownload}
                className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FileDown className="mr-2 h-5 w-5" />
                Download Merged PDF
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="border-primary/20 hover:bg-primary/5"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Merge More PDFs
              </Button>
            </div>
          </div>
        </ModernSection>
      )}

      <ModernSection
        title="AI-Enhanced Merging Features"
        subtitle="Experience the power of intelligent PDF processing"
        icon={<Zap className="h-6 w-6" />}
        className="mt-12"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold">Smart Document Analysis</h4>
            </div>
            <p className="text-muted-foreground text-sm">
              Our AI analyzes document structures, preserves formatting, and maintains bookmarks for seamless merging.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold">Intelligent Optimization</h4>
            </div>
            <p className="text-muted-foreground text-sm">
              Advanced algorithms optimize file size while maintaining quality, ensuring fast downloads and storage efficiency.
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/20 rounded">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h5 className="font-medium text-sm">Pro Tip</h5>
              <p className="text-xs text-muted-foreground mt-1">
                For best results, upload PDFs in the order you want them to appear in the final merged document.
              </p>
            </div>
          </div>
        </div>
      </ModernSection>

      <ToolSections 
        toolName="PDF Merging" 
        sections={getCustomToolSections("PDF Merging")} 
      />

      <FAQ />
      <AllTools />
    </ModernPageLayout>
  );
}
