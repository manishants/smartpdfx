
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { BlurFaceInImageInput, BlurFaceInImageOutput } from '@/lib/types';
import { blurFaceInImage } from '@/ai/flows/blur-face-in-image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
            <CardTitle className="text-2xl font-bold mb-4">Protect Privacy with AI-Powered Face Blurring</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Our free online tool uses advanced artificial intelligence to automatically detect and blur faces in any image. Whether you're sharing photos on social media, protecting the identities of individuals in a group photo, or complying with privacy regulations, our tool makes it simple to obscure faces with a single click. The elliptical blur effect provides a professional and effective way to maintain anonymity.
                </p>
                <p>
                    <strong>How to Use:</strong> Simply upload your image, click the "Blur Faces" button, and our AI will handle the rest. You'll see a before-and-after preview, and you can download the high-quality, blurred image instantly. For video files, try our <Link href="/blur-face-in-video" className="text-primary hover:underline">Blur Face in Video tool</Link>.
                </p>
                <p className="text-sm">
                    Support our efforts to provide these free tools. Your <Link href="#" className="text-primary font-bold hover:underline">Donation of just ₹1</Link> helps us keep the service running.
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
                <AccordionTrigger>How does the face blurring tool work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses an advanced AI model to automatically detect human faces in your uploaded image. Once detected, it applies an elliptical blur effect over each face to ensure privacy. The process is completely automated.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is my image data secure?</AccordionTrigger>
                <AccordionContent>
                    Absolutely. We prioritize your privacy. Your images are uploaded securely via HTTPS, processed on our servers, and then permanently deleted within one hour. We do not view, share, or store your images longer than necessary to perform the blurring.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Does this tool work with multiple faces in one photo?</AccordionTrigger>
                <AccordionContent>
                    Yes, our AI is designed to detect and blur all faces it finds in a single image, whether it's a group photo or a solo portrait. The `faceCount` result will tell you how many faces were found and blurred.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function BlurFacePage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isBlurring, setIsBlurring] = useState(false);
  const [result, setResult] = useState<BlurFaceInImageOutput | null>(null);
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

  const handleBlur = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select an image to process.", variant: "destructive" });
        return;
    }
    setIsBlurring(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      const input: BlurFaceInImageInput = { imageUri };
      
      const blurResult = await blurFaceInImage(input);
      
      if (blurResult) {
        setResult(blurResult);
        if (blurResult.faceCount === 0) {
            toast({
                title: "No Faces Detected",
                description: "The AI could not find any faces in your image. No changes were made.",
                variant: "default",
            });
        }
      } else {
        throw new Error("Blurring process returned no data.");
      }
    } catch (error: any) {
      console.error("Blurring failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while blurring the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBlurring(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-blurred.png`;
      
      const a = document.createElement('a');
      a.href = result.blurredImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsBlurring(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Blur Faces in Image</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Automatically detect and blur all faces in an image for privacy.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!file && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Drag & drop an image here, or click to select a file</p>
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
                  onClick={handleBlur}
                  disabled={isBlurring}
                >
                  {isBlurring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting & Blurring...
                    </>
                   ) : <><Wand2 className="mr-2"/>Blur Faces</>}
                </Button>
              </div>
            )}

            {result && file && (
                <>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Original Image */}
                    <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-semibold">Original</h3>
                    <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                        <Image src={file.preview} alt="Original preview" width={400} height={300} className="w-full h-auto object-contain" />
                    </div>
                    </div>

                    <Wand2 className="h-8 w-8 text-primary hidden md:block" />

                    {/* Blurred Image */}
                    <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-semibold">Blurred</h3>
                    <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                        <Image src={result.blurredImageUri} alt="Blurred preview" width={400} height={300} className="w-full h-auto object-contain" />
                    </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-4">
                    {result.faceCount > 0 && (
                        <Alert className="max-w-md mx-auto">
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>
                                Detected and blurred {result.faceCount} face(s) in the image.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-x-4">
                        <Button size="lg" onClick={handleDownload}>
                            <FileDown className="mr-2" />
                            Download
                        </Button>
                        <Button size="lg" variant="outline" onClick={handleReset}>
                            <RefreshCw className="mr-2" />
                            Blur Another
                        </Button>
                    </div>
                </div>
                </>
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
