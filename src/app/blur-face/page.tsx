"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Download, RefreshCw, Sparkles, Zap, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { blurFace } from "@/lib/actions/blur-face";
import type { BlurFaceInput, BlurFaceOutput } from "@/lib/types";
import { ModernPageLayout } from "@/components/modern-page-layout";
import { ModernSection } from "@/components/modern-section";
import { ModernUploadArea } from "@/components/modern-upload-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface UploadedFile {
  file: File;
  preview: string;
}

const ToolDescription = () => (
  <ModernSection
    title="AI-Powered Face Blur"
    subtitle="Automatically detect and blur faces for privacy protection"
    icon={<EyeOff className="h-6 w-6" />}
    className="mt-12"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Smart Detection</h3>
        </div>
        <p className="text-muted-foreground">
          Our advanced AI automatically detects faces in images and applies intelligent blur effects to protect privacy while maintaining image quality.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Instant Processing</h3>
        </div>
        <p className="text-muted-foreground">
          Process images in seconds with professional-grade face blurring. Perfect for social media, documentation, and privacy compliance.
        </p>
      </div>
    </div>
  </ModernSection>
);

const FAQ = () => (
  <ModernSection 
    title="Frequently Asked Questions" 
    subtitle="Everything you need to know about face blurring"
    icon={<Sparkles className="h-6 w-6" />}
    className="mt-12"
  >
    <Accordion type="single" collapsible className="w-full space-y-4">
      <AccordionItem value="item-1" className="border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 px-6">
        <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-primary py-6">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-primary" />
            How accurate is the face detection?
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
          Our AI uses advanced computer vision algorithms to detect faces with high accuracy. It can identify faces at various angles, lighting conditions, and even partially obscured faces.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-2" className="border-2 border-blue-200/50 rounded-xl bg-gradient-to-br from-blue-50/30 to-cyan-50/20 px-6">
        <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-blue-600 py-6">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-blue-600" />
            What blur intensity is applied?
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
          We apply an optimal blur intensity that ensures faces are completely unrecognizable while maintaining the overall image quality and context.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-3" className="border-2 border-purple-200/50 rounded-xl bg-gradient-to-br from-purple-50/30 to-pink-50/20 px-6">
        <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-purple-600 py-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Is my image data secure?
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
          Yes, all processing is done securely and your images are not stored on our servers. The face blurring happens in real-time and your privacy is fully protected.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);

export default function BlurFacePage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BlurFaceOutput | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const preview = URL.createObjectURL(uploadedFile);
    setFile({ file: uploadedFile, preview });
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUri = e.target?.result as string;
        
        const input: BlurFaceInput = {
          imageUri,
        };

        const output = await blurFace(input);
        setResult(output);
        
        toast({
          title: "Success!",
          description: "Faces have been successfully blurred in your image.",
        });
      };
      reader.readAsDataURL(file.file);
    } catch (error) {
      console.error('Face blur failed:', error);
      toast({
        title: "Processing failed",
        description: "Failed to blur faces in the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.blurredImageUri;
    link.download = `blurred-${file?.file.name || 'image.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <ModernPageLayout
      title="Face Blur Tool"
      description="Automatically detect and blur faces in images for privacy protection"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
          <CardContent className="p-8">
            {!file ? (
              <ModernUploadArea
                onFileUpload={handleFileUpload}
                acceptedTypes="image/*"
                title="Upload Image for Face Blurring"
                description="Select an image to automatically detect and blur faces"
                icon={<EyeOff className="w-12 h-12 text-primary" />}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Processing Image</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Image */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Original Image</h4>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={file.preview}
                        alt="Original image"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Processed Image */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Blurred Image</h4>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {result ? (
                        <Image
                          src={result.blurredImageUri}
                          alt="Blurred image"
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          {isProcessing ? (
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                              <p>Processing...</p>
                            </div>
                          ) : (
                            <p>Click "Blur Faces" to process</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  {!result ? (
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-5 h-5 mr-2" />
                          Blur Faces
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Blurred Image
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ToolDescription />
        <FAQ />
      </div>
    </ModernPageLayout>
  );
}