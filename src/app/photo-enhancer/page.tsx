
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2, ArrowRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { enhancePhoto } from '@/ai/flows/enhance-photo';
import type { EnhancePhotoInput, EnhancePhotoOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the AI Photo Enhancer work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses a state-of-the-art generative AI model. When you upload your photo, the AI analyzes it and intelligently enhances its quality by improving resolution, clarity, lighting, and color balance. It essentially creates a new, higher-quality version of your photo.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will this work on old or blurry photos?</AccordionTrigger>
                <AccordionContent>
                    Yes, it can significantly improve the quality of old, blurry, or low-resolution photos. The AI can sharpen details, reduce noise, and correct colors. However, the results will vary depending on the quality of the original image.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my photos kept private?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is our top priority. Your photos are uploaded securely, processed by our AI, and then permanently deleted from our servers one hour later. We do not view, share, or use your photos for any other purpose.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function EnhancePhotoPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EnhancePhotoOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile({
          file: selectedFile,
          preview: URL.createObjectURL(selectedFile),
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

  const handleProcess = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a photo to enhance.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setResult(null);
    try {
      const photoUri = await fileToDataUri(file.file);
      const input: EnhancePhotoInput = { photoUri };

      const processedResult = await enhancePhoto(input);

      if (processedResult) {
        setResult(processedResult);
      } else {
        throw new Error("Enhancement process returned no data.");
      }
    } catch (error: any) {
      console.error("Processing failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-enhanced.png`;

      const a = document.createElement('a');
      a.href = result.enhancedPhotoUri;
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
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Photo Enhancer</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Improve photo quality, resolution, and lighting with a single click.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!file && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Drag & drop a photo here, or click to select a file</p>
                <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WEBP</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {file && !result && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                   <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing Photo...
                    </>
                   ) : <><Wand2 className="mr-2"/>Enhance with AI</>}
                </Button>
              </div>
            )}

            {result && file && (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full grid md:grid-cols-3 gap-6 items-center">
                      <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">Before</h3>
                          <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                              <Image src={file.preview} alt="Original" width={400} height={300} className="w-full h-auto object-contain" />
                          </div>
                      </div>

                      <ArrowRight className="h-8 w-8 text-primary hidden md:block mx-auto" />

                      <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">After</h3>
                          <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                              <Image src={result.enhancedPhotoUri} alt="Enhanced photo preview" width={400} height={300} className="w-full h-auto object-contain" />
                          </div>
                      </div>
                  </div>

                  <div className="mt-6 text-center space-x-4">
                      <Button size="lg" onClick={handleDownload}>
                          <FileDown className="mr-2" />
                          Download
                      </Button>
                      <Button size="lg" variant="outline" onClick={handleReset}>
                          <RefreshCw className="mr-2" />
                          Enhance Another
                      </Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
       <div className="max-w-4xl mx-auto my-12 text-center">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Upscale & Enhance with AI</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                   Breathe new life into your photos. Our AI Photo Enhancer automatically upscales images, clarifies blurry details, and corrects lighting and color to produce a stunning, high-quality result. It's like having a professional photo editor in a single click.
                </p>
                <p>
                    <strong>How to Use:</strong> Upload any photo—old family pictures, blurry social media images, or low-resolution graphics. The AI will generate an enhanced version for you to compare and download.
                </p>
            </CardContent>
        </Card>
    </div>
       <FAQ />
    </main>
    <AllTools />
    </>
  );
}
