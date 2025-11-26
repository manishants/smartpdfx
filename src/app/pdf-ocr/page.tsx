
"use client";

import { useState } from 'react';
import { Packer, Document, Paragraph } from 'docx';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, RefreshCw, Wand2, Clipboard, ClipboardCheck, FileDown, FileType, Sparkles, Zap, Eye } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { PdfOcrInput, PdfOcrOutput } from '@/lib/types';
import { pdfOcr } from '@/ai/flows/pdf-ocr';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
}

const FAQ = () => (
  <div className="relative max-w-4xl mx-auto">
    {/* AI Background Elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30 rounded-2xl" />
    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl" />
    <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-lg" />
    
    <div className="relative p-8">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border border-blue-200/50 rounded-xl bg-white/50 backdrop-blur-sm px-6">
          <AccordionTrigger className="text-lg font-semibold hover:text-blue-600 transition-colors">
            What kind of PDFs work best for OCR?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed">
            Our AI-powered PDF OCR tool works exceptionally well with both scanned documents and native PDFs. For text-based PDFs (created from Word, etc.), extraction is nearly perfect. For scanned documents, higher resolution and clear text yield optimal results with our advanced AI recognition.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border border-purple-200/50 rounded-xl bg-white/50 backdrop-blur-sm px-6">
          <AccordionTrigger className="text-lg font-semibold hover:text-purple-600 transition-colors">
            Can it read handwritten text in a PDF?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed">
            Our AI model is optimized for printed text and achieves exceptional accuracy. While it may recognize some clear, print-style handwriting, it's specifically designed for typed and printed content to ensure maximum reliability.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border border-cyan-200/50 rounded-xl bg-white/50 backdrop-blur-sm px-6">
          <AccordionTrigger className="text-lg font-semibold hover:text-cyan-600 transition-colors">
            Is there a limit to the PDF file size or number of pages?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed">
            Our AI can handle substantial PDFs efficiently. For optimal performance, we recommend files under 50 MB with fewer than 100 pages. All files are processed securely and automatically deleted after one hour for your privacy.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
);


export default function PdfOcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<PdfOcrOutput | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const isAbortError = (error: any) => {
    const msg = String(error?.message || '');
    // Detect common abort patterns across browsers and environments
    return (
      error?.name === 'AbortError' ||
      msg.includes('AbortError') ||
      msg.includes('ERR_ABORTED') ||
      msg.toLowerCase().includes('aborted')
    );
  };

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
      setProgress(0);
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a PDF file.", 
        variant: "destructive" 
      });
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

  const handleExtract = async () => {
    if (!file) {
      toast({ 
        title: "No file selected", 
        description: "Please select a PDF to process.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsExtracting(true);
    setResult(null);
    setProgress(0);
    let progressInterval: any;
    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const pdfUri = await fileToDataUri(file);
      const input: PdfOcrInput = { pdfUri };
      
      const extractionResult = await pdfOcr(input);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (extractionResult) {
        setResult(extractionResult);
        toast({ 
          title: "Text extracted successfully!", 
          description: `Extracted ${extractionResult.text.length} characters from your PDF.` 
        });
      } else {
        throw new Error("Text extraction returned no data.");
      }
    } catch (error: any) {
      if (!isAbortError(error)) {
        console.error("Extraction failed:", error);
        toast({
          title: "Extraction Failed",
          description: error.message || "Something went wrong while extracting text. Please try again.",
          variant: "destructive"
        });
        setProgress(0);
      }
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsExtracting(false);
    setHasCopied(false);
    setProgress(0);
  };
  
  const handleCopyToClipboard = () => {
    if (result && result.text) {
      navigator.clipboard.writeText(result.text);
      setHasCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!result || !result.text) {
      toast({ 
        title: "No text to download", 
        description: "Please extract text from a PDF first.", 
        variant: "destructive" 
      });
      return;
    }

    const { saveAs } = (await import('file-saver'));

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: result.text }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "extracted-text.docx");
      toast({ title: "Document downloaded successfully!" });
    });
  };

  return (
    <ModernPageLayout
      title="AI PDF OCR"
      description="Extract text from any PDF document using advanced AI technology"
      icon={<Eye className="w-8 h-8" />}
      backgroundVariant="home"
    >
      <ModernSection>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="relative">
              {/* AI Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30 rounded-2xl" />
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl" />
              
              <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <UploadCloud className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Upload PDF Document
                    </h3>
                  </div>
                  
                  <ModernUploadArea
                    onFileSelect={handleFileChange}
                    accept="application/pdf"
                    maxSize={50 * 1024 * 1024} // 50MB
                    className="border-2 border-dashed border-blue-300/50 bg-gradient-to-br from-blue-50/30 to-purple-50/20"
                  />
                  
                  {file && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <FileType className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      {isExtracting && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">
                              AI is reading your PDF... {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3 mt-4">
                        <Button 
                          onClick={handleExtract}
                          disabled={isExtracting}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isExtracting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Extracting...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Extract Text
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={handleReset}
                          disabled={isExtracting}
                          className="border-blue-300 hover:bg-blue-50"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="relative">
              {/* AI Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 rounded-2xl" />
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-xl" />
              
              <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                        <FileType className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Extracted Text
                      </h3>
                    </div>
                    
                    {result && result.text && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="hover:bg-green-50"
                      >
                        {hasCopied ? (
                          <ClipboardCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Textarea
                      placeholder={
                        isExtracting 
                          ? "AI is analyzing your PDF and extracting text..." 
                          : "Extracted text will appear here..."
                      }
                      value={result?.text || ''}
                      readOnly
                      className="h-80 text-base bg-white/70 border-green-200/50 focus:border-green-400/50 resize-none"
                    />
                    
                    {isExtracting && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-lg">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">
                              AI Processing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {result && result.text && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Extraction Complete
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Successfully extracted {result.text.length.toLocaleString()} characters
                      </p>
                      
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleDownload}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download DOCX
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={handleCopyToClipboard}
                          className="border-green-300 hover:bg-green-50"
                        >
                          {hasCopied ? (
                            <ClipboardCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clipboard className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ModernSection>
      
      <ModernSection>
        <FAQ />
      </ModernSection>
      <ToolHowtoRenderer slug="pdf-ocr" />
      <ToolCustomSectionRenderer slug="pdf-ocr" />
      
      <AllTools />
    </ModernPageLayout>
  );
}
