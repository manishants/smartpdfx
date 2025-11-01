
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileDown, Loader2, RefreshCw, Repeat, CheckCircle, Sparkles, Zap, ImageIcon, Shuffle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { convertImage } from '@/lib/actions/convert-image';
import type { ConvertImageInput, ConvertImageOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { ToolSections } from '@/components/tool-sections';
import { useToolSections } from '@/hooks/use-tool-sections';
import { AIPoweredFeatures } from '@/components/ai-powered-features';
import { ProTip } from '@/components/pro-tip';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

type Format = 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff';

const FAQ = () => (
  <ModernSection 
    title="Frequently Asked Questions" 
    subtitle="Everything you need to know about image conversion"
    icon={<Sparkles className="h-6 w-6" />}
    className="mt-12"
    contentClassName="max-w-4xl mx-auto"
  >
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the difference between JPG, PNG, and WEBP?</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p><span className="font-semibold">JPG (or JPEG)</span> is best for photos and images with many colors. It uses lossy compression, meaning it reduces file size by discarding some image information, but is great for general use.</p>
            <p><span className="font-semibold">PNG</span> is best for graphics with flat colors, text, or transparency, as it uses lossless compression (no quality loss).</p>
            <p><span className="font-semibold">WEBP</span> is a modern format developed by Google that provides excellent lossless and lossy compression, often resulting in smaller file sizes than both JPG and PNG at similar quality.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Will converting my image reduce its quality?</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p>It depends on the conversion. Converting from a high-quality format like PNG to a lossy format like JPG will cause some quality loss to achieve a smaller file size.</p>
            <p>Converting between lossless formats (like PNG to WEBP lossless) will not degrade quality. Our AI-powered tool aims to maintain the highest possible quality for the selected format.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Which format should I choose for my image?</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p><span className="font-semibold">For photos:</span> Use JPG for smaller file sizes or PNG for highest quality.</p>
            <p><span className="font-semibold">For graphics/logos:</span> Use PNG to preserve transparency and sharp edges.</p>
            <p><span className="font-semibold">For web optimization:</span> Use WEBP for the best balance of quality and file size.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function ImageConverterPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [format, setFormat] = useState<Format>('png');
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConvertImageOutput | null>(null);
  const { toast } = useToast();
  const { sections } = useToolSections('Image Conversion');

  const handleFileChange = (file: File) => {
    if (file.type.startsWith('image/')) {
      setFile({ file, preview: URL.createObjectURL(file) });
      setResult(null);
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a valid image file (JPG, PNG, GIF, WEBP, TIFF).", 
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

  const handleConvert = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image.", variant: "destructive" });
      return;
    }
    
    setIsConverting(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      const input: ConvertImageInput = { imageUri, format };
      
      const convertResult = await convertImage(input);
      
      if (convertResult && convertResult.convertedImageUri) {
        setResult(convertResult);
      } else {
        throw new Error("Conversion returned no data.");
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}.${format}`;
      
      const a = document.createElement('a');
      a.href = result.convertedImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsConverting(false);
  };

  return (
    <ModernPageLayout
      title="AI Image Converter"
      description="Convert images between formats with intelligent optimization and quality preservation"
      icon={<Shuffle className="h-8 w-8" />}
      backgroundVariant="home"
    >
      <div className="space-y-8">
        <ModernSection 
          title="Upload & Convert" 
          subtitle="Upload your image and choose your desired output format"
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
                  subtitle="Supports JPG, PNG, GIF, WEBP, TIFF up to 50MB"
                  icon={<ImageIcon className="h-12 w-12" />}
                />
              )}

              {file && !result && (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                    <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
                  </div>
                  
                  <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="format" className="text-sm font-medium flex items-center gap-2">
                        <Shuffle className="h-4 w-4" />
                        Convert to Format
                      </Label>
                      <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                        <SelectTrigger id="format" className="border-primary/20 focus:border-primary">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-blue-500"></div>
                              PNG - Lossless, supports transparency
                            </div>
                          </SelectItem>
                          <SelectItem value="jpeg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-orange-500"></div>
                              JPG - Smaller size, good for photos
                            </div>
                          </SelectItem>
                          <SelectItem value="webp">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-green-500"></div>
                              WEBP - Modern, best compression
                            </div>
                          </SelectItem>
                          <SelectItem value="gif">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-purple-500"></div>
                              GIF - Supports animation
                            </div>
                          </SelectItem>
                          <SelectItem value="tiff">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-red-500"></div>
                              TIFF - High quality, professional
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Converting...
                      </>
                    ) : (
                      <>
                        <Shuffle className="mr-2 h-4 w-4" />
                        Convert Image
                      </>
                    )}
                  </Button>
                </div>
              )}

              {result && file && (
                <div className="text-center flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-green-700">Conversion Successful!</h2>
                  </div>
                  <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                    <Image src={result.convertedImageUri} alt="Converted preview" width={600} height={400} className="w-full h-auto object-contain" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      size="lg" 
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FileDown className="mr-2 h-5 w-5" />
                      Download .{format.toUpperCase()}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={handleReset}
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Convert Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <AIPoweredFeatures 
                features={[
                  "Smart format optimization",
                  "Preserves image quality",
                  "Supports JPG/PNG/WEBP/GIF/TIFF",
                  "Ideal for web and print"
                ]}
              />
            </div>
          </div>
        </ModernSection>

        <div className="mt-8">
          <ProTip tip="For web use, WEBP offers excellent compression; PNG/TIFF for highest quality." />
        </div>

        <ToolSections 
          toolName="Image Conversion" 
          sections={sections} 
        />

        <FAQ />
        <AllTools />
      </div>
    </ModernPageLayout>
  );
}
