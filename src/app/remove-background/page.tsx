"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2, CheckCircle, Sparkles, Zap, Scissors, ImageIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { removeBackground } from '@/lib/actions/remove-background';
import type { RemoveBackgroundInput, RemoveBackgroundOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

const ToolDescription = () => (
  <ModernSection
    title="AI-Powered Background Removal"
    subtitle="Instantly remove backgrounds with precision AI technology"
    icon={<Scissors className="h-6 w-6" />}
    className="mt-12"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Smart Detection</h3>
        </div>
        <p className="text-muted-foreground">
          Our advanced AI automatically detects subjects and removes backgrounds with pixel-perfect precision, handling complex edges like hair and fur.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Instant Processing</h3>
        </div>
        <p className="text-muted-foreground">
          Get professional results in seconds. Perfect for product photos, portraits, and creating transparent images for design work.
        </p>
      </div>
    </div>
  </ModernSection>
);

const FAQ = () => (
  <ModernSection 
    title="Frequently Asked Questions" 
    subtitle="Everything you need to know about background removal"
    icon={<Sparkles className="h-6 w-6" />}
    className="mt-12"
  >
    <Accordion type="single" collapsible className="w-full space-y-4">
      <AccordionItem value="item-1" className="border border-primary/20 rounded-lg px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <AccordionTrigger className="text-left hover:text-primary transition-colors">
          What types of images work best for background removal?
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">
          <div className="space-y-3">
            <p>The AI works best with images that have clear contrast between the subject and background. Portrait photos, product images, and objects with defined edges produce the most accurate results.</p>
            <p>For best results, use images with good lighting and avoid backgrounds that are too similar in color to your subject.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border border-primary/20 rounded-lg px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <AccordionTrigger className="text-left hover:text-primary transition-colors">
          What format will my image be saved in?
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">
          The processed image is saved as a PNG file with a transparent background, making it perfect for use in designs, presentations, or any application where you need a subject without a background.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" className="border border-primary/20 rounded-lg px-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <AccordionTrigger className="text-left hover:text-primary transition-colors">
          Is there a limit to image size or file size?
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">
          For optimal performance, we recommend images under 10MB. The AI can process images up to 4000x4000 pixels while maintaining quality and processing speed.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RemoveBackgroundOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (files: File[] | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile({
          file: selectedFile,
          preview: URL.createObjectURL(selectedFile),
        });
        setResult(null);
      } else {
        toast({ 
          title: "Invalid file type", 
          description: "Please select an image file (JPG, PNG, WEBP, etc.).", 
          variant: "destructive" 
        });
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

  const handleRemoveBackground = async () => {
    if (!file) {
      toast({ 
        title: "No file selected", 
        description: "Please select an image to process.", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const photoUri = await fileToDataUri(file.file);
      const input: RemoveBackgroundInput = { photoUri };
      const processResult = await removeBackground(input);
      
      setResult(processResult);
      toast({
        title: "Background removed successfully!",
        description: "Your image is ready for download.",
      });
    } catch (error) {
      console.error("Background removal failed:", error);
      toast({
        title: "Processing Failed",
        description: "Something went wrong. Please try another image.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-no-bg.png`;
      
      const a = document.createElement('a');
      a.href = result.resultUri;
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
  };

  return (
    <ModernPageLayout
      title="Remove Background"
      subtitle="AI-powered background removal for perfect cutouts"
      icon={<Scissors className="h-8 w-8" />}
    >
      <ModernSection
        title="Upload Your Image"
        subtitle="Select an image to remove its background"
        icon={<ImageIcon className="h-6 w-6" />}
      >
        <div className="space-y-8">
          {!file && (
            <ModernUploadArea
              onFileChange={handleFileChange}
              acceptedTypes="image/*"
              maxFiles={1}
              title="Drop your image here"
              subtitle="Supports JPG, PNG, WEBP and other image formats"
            />
          )}

          {file && !result && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative max-w-md border rounded-lg overflow-hidden shadow-lg bg-white">
                  <Image 
                    src={file.preview} 
                    alt="Original image" 
                    width={400} 
                    height={300} 
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div>
                  <p className="font-semibold text-lg">{file.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Removing Background...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Remove Background
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {result && file && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Original</h3>
                  <div className="relative border rounded-lg overflow-hidden shadow-lg bg-white">
                    <Image 
                      src={file.preview} 
                      alt="Original" 
                      width={300} 
                      height={200} 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Background Removed
                  </h3>
                  <div className="relative border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200" style={{backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    <Image 
                      src={result.resultUri} 
                      alt="Background removed" 
                      width={300} 
                      height={200} 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                  <FileDown className="mr-2 h-5 w-5" />
                  Download PNG
                </Button>
                <Button size="lg" variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Process Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModernSection>

      <ToolDescription />
      <FAQ />
      <AllTools />
    </ModernPageLayout>
  );
}