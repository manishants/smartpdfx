"use client";
import { useState, useMemo } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, ArrowRight, RefreshCw, Sparkles, Zap, Minimize2, ImageIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { CompressImageOutput } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { AllTools } from '@/components/all-tools';
import Link from 'next/link';
import { compressImage } from '@/lib/actions/compress-image';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
// ToolSections and useToolSections removed as part of home-only sections architecture
import { AIPoweredFeatures } from '@/components/ai-powered-features';
import { ProTip } from '@/components/pro-tip';
export const dynamic = 'force-dynamic';
interface UploadedFile {
  file: File;
  preview: string;
}
const ToolDescription = () => (
    <ModernSection 
        title="AI-Powered Image Compression" 
        subtitle="Intelligent compression that preserves quality while maximizing size reduction"
        icon={<Sparkles className="h-6 w-6" />}
        className="my-12"
    >
        <div className="space-y-6 text-muted-foreground">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Smart Compression</h3>
                    </div>
                    <p>
                        Our AI-powered compressor uses advanced lossy compression techniques to reduce file sizes by up to 90% while maintaining excellent visual quality. Perfect for web optimization and storage savings.
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Minimize2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Intelligent Processing</h3>
                    </div>
                    <p>
                        By intelligently analyzing and reducing color information, we achieve dramatic size reductions while preserving the visual integrity of your images.
                    </p>
                </div>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-sm">
                    <strong className="text-foreground">Pro Tip:</strong> For specific size targets, try our specialized tools: <Link href="/under-100kb-image" className="text-primary hover:underline font-medium">Under 100KB Image</Link> or <Link href="/under-30kb-image" className="text-primary hover:underline font-medium">Under 30KB Image</Link>.
                </p>
            </div>
        </div>
    </ModernSection>
);
export default function CompressImagePage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressImageOutput | null>(null);
  const { toast } = useToast();
  const handleFileChange = (file: File) => {
    if (file.type.startsWith('image/')) {
      setFile({
        file: file,
        preview: URL.createObjectURL(file),
      });
      setResult(null);
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select an image file (JPG, PNG, GIF, WEBP).", 
        variant: "destructive" 
      });
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile({
          file: droppedFile,
          preview: URL.createObjectURL(droppedFile),
        });
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      }
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
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  const handleCompress = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select an image to compress.", variant: "destructive" });
        return;
    }
    setIsCompressing(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      // For this generic page, we don't set a target size, so it will do a percentage reduction.
      const compressionResult = await compressImage({ imageUri });
      
      if (compressionResult) {
        setResult(compressionResult);
      } else {
        throw new Error("Compression returned no data.");
      }
    } catch (error) {
      console.error("Compression failed:", error);
      toast({
        title: "Compression Failed",
        description: "Something went wrong while compressing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
    }
  };
  
  const getFileExtensionFromMimeType = (dataUri: string) => {
    const mimeType = dataUri.substring(dataUri.indexOf(':') + 1, dataUri.indexOf(';'));
    if (mimeType === 'image/jpeg') return 'jpg';
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';
    return 'jpg'; // fallback
  }
  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newExtension = getFileExtensionFromMimeType(result.compressedImageUri);
      const newFilename = `${originalFilename}-compressed.${newExtension}`;
      
      const a = document.createElement('a');
      a.href = result.compressedImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsCompressing(false);
  };
  const compressionPercentage = useMemo(() => {
    if (!result || !result.originalSize) return 0;
    return Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100);
  }, [result]);
  return (
    <ModernPageLayout
      title="AI Image Compressor"
      description="Reduce image sizes dramatically while preserving visual quality with AI-powered optimization."
      icon={<ImageIcon className="h-8 w-8" />}
      badge="AI-Powered"
      backgroundVariant="home"
    >
      <div className="space-y-8">
        <ModernSection 
          title="Upload & Compress" 
          subtitle="Upload your image and let our AI optimize it for you"
          icon={<Zap className="h-6 w-6" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {!file && (
                <ModernUploadArea
                  onFileSelect={handleFileChange}
                  accept="image/*"
                  maxSize={50 * 1024 * 1024} // 50MB
                  title="Drop your image here"
                  subtitle="Supports JPG, PNG, GIF, WEBP up to 50MB"
                  icon={<ImageIcon className="h-12 w-12" />}
                />
              )}
              {file && !result && (
                <div className="flex flex-col items-center gap-6">
              <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">{file.file.name}</p>
                <Badge variant="secondary" className="text-sm">{formatBytes(file.file.size)}</Badge>
              </div>
              <Button 
                size="lg" 
                onClick={handleCompress}
                disabled={isCompressing}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Compressing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Compress with AI
                  </>
                )}
              </Button>
            </div>
          )}
          {result && file && (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {/* Original Image */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Original</h3>
                  </div>
                  <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                    <Image src={file.preview} alt="Original preview" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                  <Badge variant="outline" className="text-sm">{formatBytes(result.originalSize)}</Badge>
                </div>
                <div className="flex flex-col items-center gap-4 my-8 lg:my-0">
                  <ArrowRight className="h-8 w-8 text-primary hidden lg:block" />
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-4 py-2">
                    <Minimize2 className="h-4 w-4 text-green-600" />
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-base py-1 px-3">
                      -{compressionPercentage}%
                    </Badge>
                  </div>
                </div>
                {/* Compressed Image */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Compressed</h3>
                  </div>
                  <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
                    <Image src={result.compressedImageUri} alt="Compressed preview" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white font-bold">
                    {formatBytes(result.compressedSize)}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FileDown className="mr-2 h-5 w-5" />
                  Download Compressed
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleReset}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Compress Another
                </Button>
              </div>
            </div>
          )}
            </div>
            <div className="lg:col-span-1 space-y-6">
              <AIPoweredFeatures 
                features={[
                  "Smart lossy compression",
                  "Preserves visual quality",
                  "Supports JPG/PNG/GIF/WEBP",
                  "Optimized for web performance"
                ]}
              />
              <ProTip 
                tip="For best results, use high-quality source images. Our AI balances size reduction and clarity automatically."
              />
            </div>
          </div>
        </ModernSection>
        
        {/* Pro Tip moved to right sidebar below AI features */}
        
      {/* Tool-specific sections removed (home-only CMS sections) */}
        
        <ToolDescription />
        <AllTools />
      </div>
    </ModernPageLayout>
  );
}
