
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { UploadCloud, FileDown, Loader2, RefreshCw, Crop, Video as VideoIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cropVideo } from '@/lib/actions/crop-video';
import type { CropVideoInput, CropVideoOutput } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How do the crop coordinates work?</AccordionTrigger>
                <AccordionContent>
                    The crop coordinates (X and Y) and dimensions (Width and Height) are measured in pixels. The X and Y offsets define the top-left corner of your desired crop area, starting from the top-left of the original video. The width and height define the size of the final video.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is my video file secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. Your privacy is paramount. Your video is uploaded securely over HTTPS to our server for processing. The file is temporarily stored while the cropping effect is applied and is permanently deleted from our servers one hour after processing is complete. We do not watch or share your content.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Will cropping the video reduce its quality?</AccordionTrigger>
                <AccordionContent>
                    No, the cropping process itself does not reduce the quality of the video pixels. It simply cuts out a section of the video frame. The resolution of the output video will be the width and height you specify.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function CropVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [result, setResult] = useState<CropVideoOutput | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [cropWidth, setCropWidth] = useState(640);
  const [cropHeight, setCropHeight] = useState(360);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  
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

  const handleCrop = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a video to crop.", variant: "destructive" });
        return;
    }

    setIsCropping(true);
    setResult(null);
    try {
      const videoUri = await fileToDataUri(file);
      const input: CropVideoInput = { 
        videoUri, 
        width: cropWidth, 
        height: cropHeight, 
        x: cropX, 
        y: cropY 
      };
      
      const cropResult = await cropVideo(input);
      
      if (cropResult) {
        setResult(cropResult);
      } else {
        throw new Error("Cropping process returned no data.");
      }
    } catch (error: any) {
      console.error("Cropping failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while cropping the video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCropping(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-cropped.mp4`;
      
      const a = document.createElement('a');
      a.href = result.croppedVideoUri;
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
    setIsCropping(false);
    setCropWidth(640);
    setCropHeight(360);
    setCropX(0);
    setCropY(0);
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
        setCropWidth(videoRef.current.videoWidth);
        setCropHeight(videoRef.current.videoHeight);
    }
  }

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Crop Video</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Crop your videos to the perfect dimensions.
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
                 <video ref={videoRef} src={videoPreview} controls className="w-full rounded-lg border shadow-md" onLoadedMetadata={handleLoadedMetadata}/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                    <div className="space-y-2">
                        <Label htmlFor="width">Width</Label>
                        <Input id="width" type="number" value={cropWidth} onChange={(e) => setCropWidth(parseInt(e.target.value, 10))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input id="height" type="number" value={cropHeight} onChange={(e) => setCropHeight(parseInt(e.target.value, 10))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="x">X offset</Label>
                        <Input id="x" type="number" value={cropX} onChange={(e) => setCropX(parseInt(e.target.value, 10))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="y">Y offset</Label>
                        <Input id="y" type="number" value={cropY} onChange={(e) => setCropY(parseInt(e.target.value, 10))} />
                    </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleCrop}
                  disabled={isCropping}
                >
                  {isCropping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cropping...
                    </>
                   ) : <><Crop className="mr-2"/>Crop Video</>}
                </Button>
              </div>
            )}

            {result && (
              <div className="flex flex-col items-center gap-6">
                <Alert>
                    <VideoIcon className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                        Your video has been cropped successfully.
                    </AlertDescription>
                </Alert>
                <video src={result.croppedVideoUri} controls className="w-full rounded-lg border shadow-md" />
                 <div className="flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                        <FileDown className="mr-2" />
                        Download Cropped Video
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2" />
                        Crop Another
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
