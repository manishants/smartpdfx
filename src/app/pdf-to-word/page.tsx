
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Download, RefreshCw, Upload, Sparkles, Zap, CheckCircle, AlertCircle, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdfToWord } from "@/ai/flows/pdf-to-word";
import { AIPoweredFeatures } from "@/components/ai-powered-features";
import { ProTip } from "@/components/pro-tip";
import { ModernPageLayout } from "@/components/modern-page-layout";
import { ModernSection } from "@/components/modern-section";
import { ModernUploadArea } from "@/components/modern-upload-area";
import { AllTools } from "@/components/all-tools";
// Tool-specific sections removed
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';

interface ConversionResult {
  success: boolean;
  docxUri?: string;
  error?: string;
}


const FAQ = () => (
  <div className="mt-12 max-w-4xl mx-auto">
    <Card className="backdrop-blur-sm bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">How accurate is the PDF to Word conversion?</AccordionTrigger>
            <AccordionContent>
              Our AI-powered conversion technology maintains high accuracy for text, formatting, and layout preservation. 
              Complex documents with intricate designs may require minor adjustments after conversion.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">What file formats are supported?</AccordionTrigger>
            <AccordionContent>
              We support PDF files up to 50MB in size. The output is a fully editable Microsoft Word document (.docx format) 
              compatible with Word 2007 and later versions.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">Is my document secure during conversion?</AccordionTrigger>
            <AccordionContent>
              Yes, your documents are processed securely and are automatically deleted from our servers after conversion. 
              We do not store or share your files with third parties.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">Can I convert password-protected PDFs?</AccordionTrigger>
            <AccordionContent>
              Currently, password-protected PDFs need to be unlocked before conversion. You can use our PDF unlock tool 
              first, then proceed with the conversion.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </div>
);

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<'no_ocr' | 'ai_ocr'>('ai_ocr');
  const { toast } = useToast();
  // Tool-specific sections removed

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a PDF file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setProgress(0);
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) {
              clearInterval(progressInterval);
              progressInterval = null;
            }
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const pdfUri = await fileToDataUri(file);
      const { docxUri } = await pdfToWord({ pdfUri, conversionMode: mode });

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setProgress(100);

      if (docxUri) {
        setResult({ success: true, docxUri });
        toast({ title: "Conversion successful!", description: "Your PDF has been converted to Word format." });
      } else {
        setResult({ success: false, error: "Conversion failed" });
        toast({ title: "Conversion failed", description: "An error occurred during conversion.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Conversion error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setResult({ success: false, error: message });
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setProgress(0);
      toast({ title: "Conversion failed", description: message, variant: "destructive" });
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setIsConverting(false);
    }
  };
  
  const handleDownload = () => {
    if (!result?.docxUri || !file) return;
    const a = document.createElement("a");
    a.href = result.docxUri;
    a.download = file.name.replace(/\.pdf$/i, ".docx");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setIsConverting(false);
  };

  return (
    <>
      <ModernPageLayout
        title="PDF to Word Converter"
        description="Transform your PDF documents into fully editable Word files with our advanced AI-powered conversion technology."
        icon={<FileText className="h-8 w-8" />}
        badge="AI-Powered"
        backgroundVariant="home"
      >
        <div className="space-y-8">
          {/* Upload Section */}
          <ModernSection>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Upload Area */}
              <div className="lg:col-span-2">
                {!file ? (
                  <ModernUploadArea
                    onFileSelect={handleFileChange}
                    accept="application/pdf"
                    maxSize={50 * 1024 * 1024}
                    isLoading={isConverting}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-gradient-to-r from-primary/10 to-blue-600/10 p-6 rounded-full border border-primary/20">
                          <Upload className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          Drop your PDF here or click to browse
                        </h3>
                        <p className="text-muted-foreground">
                          Supports PDF files up to 50MB
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span>AI-Enhanced</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>Fast Processing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>High Accuracy</span>
                        </div>
                      </div>
                      {/* Mode Selector */}
                      <div className="w-full max-w-xl mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 ${mode === 'no_ocr' ? 'border-primary' : 'border-border/50'}`}
                            onClick={() => setMode('no_ocr')}
                          >
                            <input type="radio" name="mode" className="mt-1" checked={mode === 'no_ocr'} readOnly />
                            <div>
                              <div className="font-medium">No OCR</div>
                              <div className="text-xs text-muted-foreground">Convert PDFs with selectable text into editable Word files. Uses local converter, no API key.</div>
                            </div>
                          </label>
                          <label className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 ${mode === 'ai_ocr' ? 'border-primary' : 'border-border/50'}`}
                            onClick={() => setMode('ai_ocr')}
                          >
                            <input type="radio" name="mode" className="mt-1" checked={mode === 'ai_ocr'} readOnly />
                            <div>
                              <div className="font-medium">AI OCR</div>
                              <div className="text-xs text-muted-foreground">Convert scanned PDFs with non-selectable text into editable Word files. Preserves layout and avoids text overlap.</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </ModernUploadArea>
                ) : (
                  <div className="space-y-6">
                    {/* File Info */}
                    <Card className="bg-gradient-to-r from-primary/5 to-blue-600/5 border border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg">
                              <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{file.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ready
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mode Selector - Visible after file selection */}
                    <Card className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label
                            className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 ${mode === 'no_ocr' ? 'border-primary' : 'border-border/50'}`}
                            onClick={() => setMode('no_ocr')}
                          >
                            <input type="radio" name="mode" className="mt-1" checked={mode === 'no_ocr'} readOnly />
                            <div>
                              <div className="font-medium">No OCR</div>
                              <div className="text-xs text-muted-foreground">Convert PDFs with selectable text into editable Word files. Uses local converter, no API key.</div>
                            </div>
                          </label>
                          <label
                            className={`cursor-pointer rounded-lg border p-4 flex items-start gap-3 ${mode === 'ai_ocr' ? 'border-primary' : 'border-border/50'}`}
                            onClick={() => setMode('ai_ocr')}
                          >
                            <input type="radio" name="mode" className="mt-1" checked={mode === 'ai_ocr'} readOnly />
                            <div>
                              <div className="font-medium">AI OCR</div>
                              <div className="text-xs text-muted-foreground">Convert scanned PDFs with non-selectable text into editable Word files. Preserves layout and avoids overlapping text.</div>
                            </div>
                          </label>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Conversion Progress */}
                    {isConverting && (
                      <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                Converting PDF to Word...
                              </h3>
                              <span className="text-sm text-muted-foreground">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-sm text-muted-foreground">
                              Our AI is analyzing and converting your document. This may take a few moments.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Conversion Result */}
                    {result && (
                      <Card className={`${result.success 
                        ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20' 
                        : 'bg-gradient-to-r from-red-500/5 to-pink-500/5 border border-red-500/20'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${result.success 
                              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                              : 'bg-gradient-to-r from-red-500/10 to-pink-500/10'
                            }`}>
                              {result.success ? (
                                <CheckCircle className="h-8 w-8 text-green-600" />
                              ) : (
                                <AlertCircle className="h-8 w-8 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                {result.success ? 'Conversion Successful!' : 'Conversion Failed'}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.success 
                                  ? 'Your PDF has been successfully converted to Word format.'
                                  : result.error || 'An error occurred during conversion.'
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {!result && (
                        <Button 
                          onClick={handleConvert}
                          disabled={isConverting}
                          className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-6 text-lg"
                        >
                          {isConverting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5" />
                              Convert to Word
                            </>
                          )}
                        </Button>
                      )}

                      {result?.success && (
                        <Button 
                          onClick={handleDownload}
                          className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-6 text-lg"
                        >
                          <FileDown className="mr-2 h-5 w-5" />
                          Download Word File
                        </Button>
                      )}

                      <Button 
                        onClick={handleReset}
                        variant="outline"
                        className="flex-1 py-6 text-lg border-border/50 hover:bg-accent/50"
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Start Over
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* AI Features Component - Right Side */}
              <div className="lg:col-span-1 space-y-6">
                <AIPoweredFeatures 
                  features={[
                    "Advanced text recognition",
                    "Preserves formatting & layout", 
                    "Handles complex documents",
                    "Maintains image quality"
                  ]}
                />
                <ProTip 
                  tip="For best results, ensure your PDF has clear, readable text. Our AI works exceptionally well with documents that have good contrast and standard fonts."
                />
              </div>
            </div>
            
            {/* Pro Tip moved to right sidebar below AI features */}
          </ModernSection>

          {/* AI Information Section */}
          <ModernSection>
            <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">AI-Powered Conversion Technology</h3>
                    <p className="text-muted-foreground mb-4">
                      Our advanced AI algorithms ensure high-quality conversion while preserving formatting, 
                      layout, and text structure from your original PDF document.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600">
                          <Zap className="w-3 h-3 mr-1" />
                          Fast
                        </Badge>
                        <span className="text-sm text-muted-foreground">Lightning speed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Accurate
                        </Badge>
                        <span className="text-sm text-muted-foreground">High precision</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Smart
                        </Badge>
                        <span className="text-sm text-muted-foreground">AI-enhanced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ModernSection>
        </div>
      </ModernPageLayout>
      
      {/* Tool-specific sections removed */}
      <ModernSection>
        <FAQ />
      </ModernSection>
      <ToolHowtoRenderer slug="pdf-to-word" />
      <ToolCustomSectionRenderer slug="pdf-to-word" />
      <AllTools />
    </>
  );
}
