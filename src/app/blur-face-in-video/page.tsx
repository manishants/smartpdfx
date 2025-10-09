
"use client";

import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2, Video as VideoIcon, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { blurFaceInVideo } from '@/ai/flows/blur-face-in-video';
import type { BlurFaceInVideoInput, BlurFaceInVideoOutput } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const ToolDescription = () => (
    <div className="max-w-4xl mx-auto my-12 text-center">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Anonymize Videos by Blurring Faces</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Protect the privacy of individuals in your videos with our intelligent face blurring tool. Ideal for journalists, researchers, or anyone sharing videos publicly, our service automatically detects face locations and applies a consistent blur throughout the video. This ensures identities remain confidential without complex video editing software.
                </p>
                <p>
                    <strong>How It Works:</strong> Upload your video file (MP4, WEBM, etc.). Our AI analyzes the footage to identify faces and then processes the video to apply a blur effect. You'll get a high-quality, ready-to-download video with all faces obscured. For still images, use our <Link href="/blur-face" className="text-primary hover:underline">Face Blur for Images</Link> tool.
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
                <AccordionTrigger>How does the video face blurring work?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses an AI model to analyze the first frame of your video to identify the locations of faces. It then applies a blur filter to those specific regions throughout the entire duration of the video using FFMPEG, a powerful video processing library.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is my video file secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. Your privacy is paramount. Your video is uploaded securely over HTTPS to our server for processing. The file is temporarily stored while the blurring effect is applied and is permanently deleted from our servers one hour after processing is complete. We do not watch or share your content.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>What happens if the faces move around in the video?</AccordionTrigger>
                <AccordionContent>
                    Currently, our AI identifies face locations based on an initial frame analysis. The blur is applied to these fixed regions for the entire video. For best results, it works well with videos where the subjects are relatively stationary, like interviews or presentations. We are working on a more advanced version with frame-by-frame tracking.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function BlurFaceInVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BlurFaceInVideoOutput | null>(null);
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
      const input: BlurFaceInVideoInput = { videoUri };
      
      const processResult = await blurFaceInVideo(input);
      
      if (processResult && processResult.processedVideoUri) {
        setResult(processResult);
      } else {
        throw new Error("The process returned no data. The AI may not have found a face.");
      }
    } catch (error: any) {
      console.error("Processing failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while blurring faces. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-blurred.mp4`;
      
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
        <h1 className="text-4xl font-bold font-headline">Blur Faces in Video</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Automatically detect and blur faces in your videos for privacy.
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
                      Detecting & Blurring...
                    </>
                   ) : <><Wand2 className="mr-2"/>Blur Faces</>}
                </Button>
              </div>
            )}

            {result && (
              <div className="flex flex-col items-center gap-6">
                 <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      {result.faceCount > 0 
                        ? `Detected and blurred ${result.faceCount} face(s) in the video.`
                        : "No faces were detected, so the video remains unchanged."
                      }
                    </AlertDescription>
                </Alert>

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
      <ToolDescription />
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
