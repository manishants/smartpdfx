
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2, ArrowRight, Eraser } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { RemoveBackgroundInput, RemoveBackgroundOutput } from '@/lib/types';
import { removeBackground } from '@/ai/flows/remove-background';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}


const ToolDescription = () => (
    <div className="max-w-4xl mx-auto my-12 text-center">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">AI Background Remover</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                   Instantly remove the background from any image with our smart AI tool. Get a clean, transparent background in seconds, perfect for creating professional product photos, logos, profile pictures, and more. Our AI intelligently detects the main subject and cuts it out with precision, saving you hours of manual editing work in complex software.
                </p>
                <p>
                    <strong>How to Use:</strong> Simply upload your photo, and our AI will automatically process it to remove the background. You'll see a clear before-and-after comparison. Download your new image with a transparent background, ready to be used anywhere.
                </p>
                <p className="text-sm">
                    This free service is made possible by user support. A <Link href="#" className="text-primary font-bold hover:underline">Donation of just ₹1</Link> helps us maintain and improve these tools for everyone.
                </p>
            </CardContent>
        </Card>
    </div>
);


const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What kind of images work best?</AccordionTrigger>
                <AccordionContent>
                    For the best results, use images with a clear, well-defined subject. The AI works well on photos of people, products, animals, and cars. Images with very fine details, like hair or fur, may sometimes have small imperfections, but the results are generally excellent.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What format will the downloaded image be in?</AccordionTrigger>
                <AccordionContent>
                   The output image will be a PNG file. The PNG format supports transparency, which is what allows the background to be invisible. You can then place your subject on any new background you choose.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my photos safe and private?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is our top priority. Your images are uploaded securely, processed by our AI, and then permanently deleted from our servers one hour after processing is complete. We do not view, share, or use your photos for any other purpose.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RemoveBackgroundOutput | null>(null);
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
      toast({ title: "No file selected", description: "Please select an image to process.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      const input: RemoveBackgroundInput = { imageUri };

      const processedResult = await removeBackground(input);

      if (processedResult) {
        setResult(processedResult);
      } else {
        throw new Error("Background removal process returned no data.");
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
      const newFilename = `${originalFilename}-no-bg.png`;

      const a = document.createElement('a');
      a.href = result.imageUri;
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
        <h1 className="text-4xl font-bold font-headline">AI Background Remover</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Automatically remove the background from any image with one click.
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
                      Removing Background...
                    </>
                   ) : <><Eraser className="mr-2"/>Remove Background</>}
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
                          <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md bg-cover" style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\'%3e%3cpath d=\'M0 0h16v16H0z\' fill=\'%23f0f0f0\'/%3e%3cpath d=\'M16 16h16v16H16z\' fill=\'%23f0f0f0\'/%3e%3c/svg%3e")'}}>
                              <Image src={result.imageUri} alt="Removed background preview" width={400} height={300} className="w-full h-auto object-contain" />
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
                          Process Another
                      </Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
       <ToolDescription />
       <FAQ />
    </main>
    <AllTools />
    </>
  );
}
