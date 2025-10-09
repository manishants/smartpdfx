
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Eraser, Video as VideoIcon, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { removeWatermarkInVideo } from '@/ai/flows/remove-watermark-in-video';
import type { RemoveWatermarkInput, RemoveWatermarkOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the watermark removal work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses an AI model to analyze a frame from your video and detect the location of the most prominent watermark or logo. It then uses a video filter called 'delogo' to remove that object from the specified area throughout the entire video.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will this work on any watermark?</AccordionTrigger>
                <AccordionContent>
                    It works best on static, opaque, or semi-transparent watermarks located in a consistent position. It may struggle with watermarks that move, change opacity, or cover the entire video. The result is a "best-effort" removal and may sometimes leave slight artifacts.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is it legal to remove watermarks?</AccordionTrigger>
                <AccordionContent>
                    This tool should only be used on videos that you own the copyright to or have permission to modify. Removing a watermark from copyrighted material that you do not own may infringe on the creator's rights. Please use this tool responsibly.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Are my videos secure?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is important to us. Your video is uploaded securely, processed on our servers, and permanently deleted one hour after the watermark removal is complete. We do not store or share your videos.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function RemoveWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RemoveWatermarkOutput | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setVideoPreview(url);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a video file.", variant: "destructive" });
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
        toast({ title: "No file selected", description: "Please select a video to process.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    setResult(null);
    try {
      const videoUri = await fileToDataUri(file);
      const input: RemoveWatermarkInput = { videoUri };
      
      const processResult = await removeWatermarkInVideo(input);
      
      if (processResult && processResult.processedVideoUri) {
        setResult(processResult);
      } else {
        throw new Error("The process returned no data. The AI may not have found a watermark.");
      }
    } catch (error: any) {
      console.error("Processing failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while removing the watermark. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-processed.mp4`;
      
      const a = document.createElement('a');
      a.href = result.processedVideoUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setVideoPreview(null);
    setResult(null);
    setIsProcessing(false);
  };
  
  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Remove Watermark from Video</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Automatically detect and remove watermarks from your videos.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!videoPreview && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Click to upload a video</p>
                <p className="text-sm text-muted-foreground mt-1">Supports MP4, MOV, WEBM, etc.</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {videoPreview && !result && (
              <div className="flex flex-col items-center gap-6">
                 <video src={videoPreview} controls className="w-full rounded-lg border shadow-md" />
                <Button 
                  size="lg" 
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting & Removing...
                    </>
                   ) : <><Eraser className="mr-2"/>Remove Watermark</>}
                </Button>
              </div>
            )}

            {result && (
              <div className="flex flex-col items-center gap-6">
                 <div className="text-center flex flex-col items-center gap-4">
                     <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                     <h2 className="text-2xl font-semibold mt-4">Watermark Removed!</h2>
                 </div>

                <video src={result.processedVideoUri} controls className="w-full rounded-lg border shadow-md" />

                 <div className="flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                        <FileDown className="mr-2" />
                        Download Processed Video
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
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
