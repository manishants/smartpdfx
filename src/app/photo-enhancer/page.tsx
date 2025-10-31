
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2, ArrowRight, Sparkles, Zap, Camera, ImageIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { enhancePhoto } from '@/ai/flows/enhance-photo';
import type { EnhancePhotoInput, EnhancePhotoOutput } from '@/lib/types';
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
  <div className="relative">
    {/* AI Background Elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 rounded-2xl" />
    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl" />
    <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-lg" />
    
    <div className="relative p-8">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border border-purple-200/50 rounded-xl bg-white/50 backdrop-blur-sm px-6">
          <AccordionTrigger className="text-lg font-semibold hover:text-purple-600 transition-colors">
            How does the AI Photo Enhancer work?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed">
            Our advanced AI model analyzes your photo and intelligently enhances quality by improving resolution, clarity, lighting, and color balance. It uses state-of-the-art generative technology to create a superior, high-quality version of your image.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border border-pink-200/50 rounded-xl bg-white/50 backdrop-blur-sm px-6">
          <AccordionTrigger className="text-lg font-semibold hover:text-pink-600 transition-colors">
            Will this work on old or blurry photos?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed">
            Absolutely! Our AI excels at restoring old, blurry, or low-resolution photos. It can sharpen details, reduce noise, and correct colors dramatically. Results vary based on the original image quality, but improvements are typically remarkable.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border border-blue-200/50 rounded-xl bg-white/50 backdrop-blur-sm px-6">
          <AccordionTrigger className="text-lg font-semibold hover:text-blue-600 transition-colors">
            Are my photos kept private?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 leading-relaxed">
            Your privacy is paramount. Photos are uploaded securely, processed by our AI, and permanently deleted from our servers after one hour. We never view, share, or use your photos for any other purpose.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
);


export default function EnhancePhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EnhancePhotoOutput | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
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

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const dataUri = await fileToDataUri(file);
      const input: EnhancePhotoInput = {
        image: dataUri,
        enhancementLevel: 'high'
      };

      const enhancedResult = await enhancePhoto(input);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(enhancedResult);
      
      toast({
        title: "Enhancement Complete!",
        description: "Your photo has been successfully enhanced with AI.",
      });
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDownload = () => {
    if (!result?.enhancedImage) return;

    const link = document.createElement('a');
    link.href = result.enhancedImage;
    link.download = `enhanced_${file?.name || 'photo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your enhanced photo is being downloaded.",
    });
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsProcessing(false);
    setProgress(0);
  };

  return (
    <ModernPageLayout
      title="AI Photo Enhancer"
      description="Transform your photos with cutting-edge AI technology. Enhance quality, sharpen details, and restore old images with professional results."
      icon={<Camera className="w-8 h-8" />}
    >
      <ModernSection>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Upload Your Photo</h3>
            </div>

            <ModernUploadArea
              onFileSelect={handleFileChange}
              acceptedTypes="image/*"
              maxSize="10MB"
              icon={<UploadCloud className="w-12 h-12" />}
              title="Drop your photo here or click to browse"
              subtitle="Supports JPG, PNG, GIF up to 10MB"
            />

            {file && (
              <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
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

                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="Original photo"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="mt-6 space-y-4">
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enhancing... {Math.round(progress)}%
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          <Sparkles className="w-4 h-4 mr-1" />
                          Enhance with AI
                        </>
                      )}
                    </Button>

                    {isProcessing && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Enhanced Result</h3>
            </div>

            {result ? (
              <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={result.enhancedImage}
                        alt="Enhanced photo"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Enhanced
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleDownload}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <FileDown className="w-5 h-5 mr-2" />
                        Download Enhanced
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        New Photo
                      </Button>
                    </div>

                    {file && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Before</p>
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="Original"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">After</p>
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={result.enhancedImage}
                              alt="Enhanced"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">Enhanced photo will appear here</p>
                  <p className="text-sm text-gray-500">Upload and enhance a photo to see results</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ModernSection>

      <ToolSections 
        toolName="Photo Enhancement" 
        sections={getCustomToolSections("Photo Enhancement")} 
      />

      <ModernSection>
        <FAQ />
      </ModernSection>

      <ModernSection>
        <AllTools />
      </ModernSection>
    </ModernPageLayout>
  );
}
