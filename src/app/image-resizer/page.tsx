
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, FileDown, Loader2, RefreshCw, Ruler, CheckCircle, Sparkles, Zap, Maximize2, ImageIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { resizeImage } from '@/lib/actions/resize-image';
import type { ResizeImageInput, ResizeImageOutput } from '@/lib/types';
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
  width: number;
  height: number;
}

const FAQ = () => (
    <ModernSection 
        title="Frequently Asked Questions" 
        subtitle="Everything you need to know about image resizing"
        icon={<Sparkles className="h-6 w-6" />}
        className="mt-12"
    >
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border border-primary/10 rounded-lg mb-4 px-4">
                <AccordionTrigger className="hover:text-primary">
                    <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-primary" />
                        Will resizing my image distort it?
                    </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                    Our AI-powered tool maintains the original aspect ratio by default. When you enter a new width, the height will be adjusted automatically to prevent stretching or squashing the image. If you enter both width and height, the image will be resized to fit within those dimensions without being enlarged.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-primary/10 rounded-lg mb-4 px-4">
                <AccordionTrigger className="hover:text-primary">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Does resizing the image also compress it?
                    </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                    Yes, making an image smaller in dimensions (e.g., from 4000x3000 pixels to 800x600 pixels) will naturally reduce its file size because there is less pixel data to store. However, this tool does not apply additional compression like our dedicated Image Compressor tool.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </ModernSection>
);

export default function ImageResizerPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [result, setResult] = useState<ResizeImageOutput | null>(null);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [percentage, setPercentage] = useState<number | ''>(50);

  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.onload = () => {
            setFile({ file: file, preview, width: img.width, height: img.height });
            setWidth(Math.round(img.width / 2));
            setHeight(Math.round(img.height / 2));
        }
        img.src = preview;
        setResult(null);
      } else {
        toast({ 
          title: "Invalid file type", 
          description: "Please select an image file (JPG, PNG, GIF, WEBP).", 
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

  const handleResize = async (mode: 'pixel' | 'percentage') => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image.", variant: "destructive" });
      return;
    }
    
    let input: ResizeImageInput;
    const imageUri = await fileToDataUri(file.file);

    if (mode === 'pixel') {
        if (!width && !height) {
            toast({ title: "No dimensions set", description: "Please enter a width or height.", variant: "destructive" });
            return;
        }
        input = { imageUri, width: width || undefined, height: height || undefined };
    } else {
        if (!percentage) {
            toast({ title: "No percentage set", description: "Please enter a percentage.", variant: "destructive" });
            return;
        }
        input = { imageUri, percentage: percentage || undefined };
    }
    
    setIsResizing(true);
    setResult(null);
    try {
      const resizeResult = await resizeImage(input);
      if (resizeResult && resizeResult.resizedImageUri) {
        setResult(resizeResult);
      } else {
        throw new Error("Resizing returned no data.");
      }
    } catch (error: any) {
      console.error("Resizing failed:", error);
      toast({
        title: "Resizing Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsResizing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name;
      const newFilename = `${originalFilename.substring(0, originalFilename.lastIndexOf('.'))}-resized.${originalFilename.split('.').pop()}`;
      
      const a = document.createElement('a');
      a.href = result.resizedImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setWidth('');
    setHeight('');
    setPercentage(50);
    setIsResizing(false);
  };
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newWidth = e.target.value === '' ? '' : parseInt(e.target.value, 10);
      setWidth(newWidth);
      if (newWidth && file) {
          const aspectRatio = file.height / file.width;
          setHeight(Math.round(newWidth * aspectRatio));
      }
  }

  return (
    <ModernPageLayout
      title="AI Image Resizer"
      subtitle="Resize images by dimensions or percentage with intelligent aspect ratio preservation"
      icon={<Maximize2 className="h-8 w-8" />}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <ModernSection 
          title="Upload & Resize" 
          subtitle="Upload your image and choose your preferred resizing method"
          icon={<Zap className="h-6 w-6" />}
        >
          {!file && (
            <ModernUploadArea
              onFileSelect={handleFileChange}
              acceptedTypes={["image/*"]}
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
                <p className="text-sm text-muted-foreground">
                  Original dimensions: <span className="font-semibold text-foreground">{file.width} x {file.height}</span> pixels
                </p>
              </div>

              <Tabs defaultValue="pixel" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="pixel" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Ruler className="mr-2 h-4 w-4" />
                    By Pixel
                  </TabsTrigger>
                  <TabsTrigger value="percentage" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Sparkles className="mr-2 h-4 w-4" />
                    By Percentage
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pixel">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width" className="text-sm font-medium">Width (px)</Label>
                          <Input 
                            id="width" 
                            type="number" 
                            value={width} 
                            onChange={handleWidthChange} 
                            placeholder="e.g. 800"
                            className="border-primary/20 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height" className="text-sm font-medium">Height (px)</Label>
                          <Input 
                            id="height" 
                            type="number" 
                            value={height} 
                            onChange={(e) => setHeight(e.target.value === '' ? '' : parseInt(e.target.value))} 
                            placeholder="e.g. 600"
                            className="border-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                        onClick={() => handleResize('pixel')} 
                        disabled={isResizing}
                      >
                        {isResizing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI Resizing...
                          </>
                        ) : (
                          <>
                            <Ruler className="mr-2 h-4 w-4" />
                            Resize Image
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="percentage">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <CardContent className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="percentage" className="text-sm font-medium">Percentage (%)</Label>
                        <Input 
                          id="percentage" 
                          type="number" 
                          value={percentage} 
                          onChange={(e) => setPercentage(e.target.value === '' ? '' : parseInt(e.target.value))} 
                          placeholder="e.g. 50"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                        onClick={() => handleResize('percentage')} 
                        disabled={isResizing}
                      >
                        {isResizing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI Resizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Resize Image
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {result && file && (
            <div className="text-center flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-700">Resize Successful!</h2>
              </div>
              <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                <Image src={result.resizedImageUri} alt="Resized preview" width={600} height={400} className="w-full h-auto object-contain" />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FileDown className="mr-2 h-5 w-5" />
                  Download Resized
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleReset}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Resize Another
                </Button>
              </div>
            </div>
          )}
        </ModernSection>

        <ToolSections 
          toolName="Image Resizing" 
          sections={getCustomToolSections("Image Resizing")} 
        />

        <FAQ />
        <AllTools />
      </div>
    </ModernPageLayout>
  );
}
