'use client';
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  FileUp,
  Zap
} from 'lucide-react';
import { wordToPdf } from '@/lib/actions/word-to-pdf';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { AIPoweredFeatures } from "@/components/ai-powered-features";
import { ProTip } from "@/components/pro-tip";
import { AllTools } from '@/components/all-tools';
import ToolRelatedBlogLink from '@/components/tool-related-blog-link';
interface ConversionResult {
  success: boolean;
  pdfUri?: string;
  error?: string;
}
const ToolDescription = () => (
  <ModernSection>
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-full border border-blue-500/20">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">LibreOffice Powered</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Advanced Word to PDF Conversion</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your Word documents into professional PDF files with perfect formatting preservation using our LibreOffice-powered conversion engine.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg flex items-center justify-center mx-auto border border-blue-500/20">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-foreground">Perfect Formatting</h3>
          <p className="text-sm text-muted-foreground">
            Preserves all formatting, fonts, images, and layout elements from your original Word document.
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg flex items-center justify-center mx-auto border border-green-500/20">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-foreground">Fast Processing</h3>
          <p className="text-sm text-muted-foreground">
            Quick conversion powered by LibreOffice engine for reliable and efficient document processing.
          </p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg flex items-center justify-center mx-auto border border-purple-500/20">
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-foreground">High Quality</h3>
          <p className="text-sm text-muted-foreground">
            Professional-grade PDF output suitable for printing, sharing, and archiving.
          </p>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 rounded-xl p-6 border border-gray-200/50">
        <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-1">What file formats are supported?</h4>
            <p className="text-muted-foreground">We support DOCX files (Microsoft Word 2007 and later). DOC files are not currently supported.</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">Is my document secure?</h4>
            <p className="text-muted-foreground">Yes, all conversions are processed locally on our servers and files are automatically deleted after processing.</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">What's the maximum file size?</h4>
            <p className="text-muted-foreground">You can convert Word documents up to 50MB in size.</p>
          </div>
        </div>
      </div>
      <ToolRelatedBlogLink slug="word-to-pdf" />
    </div>
  </ModernSection>
);
export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const handleFileChange = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(selectedFile);
      setResult(null);
      setProgress(0);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a DOCX file.",
        variant: "destructive",
      });
    }
  };
  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setProgress(0);
    setResult(null);
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    try {
      // Convert file to data URI using FileReader (handles large files safely)
      const docxUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const output = await wordToPdf({ docxUri });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResult({
        success: true,
        pdfUri: output.pdfUri,
      });
      toast({
        title: "Conversion successful!",
        description: "Your Word document has been converted to PDF.",
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      
      setResult({
        success: false,
        error: error.message || 'Conversion failed',
      });
      toast({
        title: "Conversion failed",
        description: error.message || "An error occurred during conversion.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };
  const handleDownload = () => {
    if (result?.pdfUri) {
      const link = document.createElement('a');
      link.href = result.pdfUri;
      link.download = file?.name.replace(/\.[^/.]+$/, '.pdf') || 'converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setIsConverting(false);
  };
  return (
    <ModernPageLayout
      title="Word to PDF Converter"
      description="Convert your Word documents to professional PDF files with perfect formatting preservation."
      icon={<FileUp className="h-8 w-8" />}
      badge="LibreOffice Powered"
    >
      <div className="space-y-8">
        {/* Upload Section */}
        <ModernSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Upload Area */}
            <div className="lg:col-span-2">
              {!file && (
                <ModernUploadArea
                  onFileSelect={handleFileChange}
                  accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                      <h3 className="text-xl font-semibold text-foreground">Drop your Word document here or click to browse</h3>
                      <p className="text-muted-foreground">Supports DOCX files up to 50MB</p>
                    </div>
                  </div>
                </ModernUploadArea>
              )}

              {file && (
                <div className="space-y-6">
                  {/* File Info */}
                  <Card className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-green-500/20">
                            <FileText className="h-8 w-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{file.name}</h3>
                            <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Ready
                        </Badge>
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
                              Converting Word to PDF...
                            </h3>
                            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Result */}
                  {result && (
                    <Card className={`${result.success ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20' : 'bg-gradient-to-r from-red-500/5 to-rose-500/5 border border-red-500/20'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${result.success ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20' : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20'}`}>
                            {result.success ? (
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            ) : (
                              <RefreshCw className="h-8 w-8 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.success ? 'Conversion Successful!' : 'Conversion Failed'}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {result.success ? 'Your Word document has been successfully converted to PDF.' : (result.error || 'An error occurred during conversion.')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!result && (
                      <Button onClick={handleConvert} disabled={isConverting} className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                        {isConverting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <FileUp className="mr-2 h-5 w-5" />
                            Convert to PDF
                          </>
                        )}
                      </Button>
                    )}

                    {result?.success && (
                      <Button onClick={handleDownload} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-600/90 hover:to-emerald-600/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                        <Download className="mr-2 h-5 w-5" />
                        Download PDF
                      </Button>
                    )}

                    <Button onClick={handleReset} variant="outline" className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-medium py-3 px-6 rounded-lg transition-all duration-200">
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Convert Another
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Features Component - Right Side */}
            <div className="lg:col-span-1 space-y-6">
              <AIPoweredFeatures features={[
                'LibreOffice-powered conversion',
                'Perfect formatting preservation',
                'Maintains document structure',
                'Professional PDF output',
              ]} />
              <ProTip tip="For optimal results, use standard fonts and avoid complex formatting. Our LibreOffice engine handles most Word features perfectly, including tables, images, and headers." />
            </div>
          </div>
        </ModernSection>

        <ToolDescription />
        <AllTools />
        {/* Tool-specific sections removed: page now uses home-only CMS sections */}
      </div>
    </ModernPageLayout>
  );
}
