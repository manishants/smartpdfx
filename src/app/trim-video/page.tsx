
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileDown, Loader2, RefreshCw, Scissors, Video as VideoIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { trimVideo } from '@/lib/actions/trim-video';
import type { TrimVideoInput, TrimVideoOutput } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToolSections } from '@/components/tool-sections';
import { getCustomToolSections } from '@/lib/tool-sections-config';

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What format should I use for the start and end times?</AccordionTrigger>
                <AccordionContent>
                    You must use the HH:MM:SS format (Hours:Minutes:Seconds). For example, to start a video at 25 seconds, you would enter `00:00:25`. To trim a section from 1 minute 30 seconds to 2 minutes, you would use `00:01:30` as the start time and `00:02:00` as the end time.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Does trimming the video reduce its quality?</AccordionTrigger>
                <AccordionContent>
                    No. Our trimming tool cuts the video stream without re-encoding it, so there is no loss of quality. The output video will have the exact same quality as the original file, just shorter.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is there a limit on the length or size of the video I can trim?</AccordionTrigger>
                <AccordionContent>
                    While the tool is very efficient, uploading very large video files can take time depending on your internet connection. For best results, we recommend using files under 1GB. All processing is secure, and your files are deleted from our servers one hour after processing.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function TrimVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [result, setResult] = useState<TrimVideoOutput | null>(null);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:00:05');
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setVideoPreview(URL.createObjectURL(selectedFile));
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

  const handleTrim = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a video to trim.", variant: "destructive" });
        return;
    }
    if (!/^\d{2}:\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}:\d{2}$/.test(endTime)) {
        toast({ title: "Invalid time format", description: "Please use HH:MM:SS format for start and end times.", variant: "destructive" });
        return;
    }

    setIsTrimming(true);
    setResult(null);
    try {
      const videoUri = await fileToDataUri(file);
      const input: TrimVideoInput = { videoUri, startTime, endTime };
      
      const trimResult = await trimVideo(input);
      
      if (trimResult) {
        setResult(trimResult);
      } else {
        throw new Error("Trimming process returned no data.");
      }
    } catch (error: any) {
      console.error("Trimming failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while trimming the video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTrimming(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-trimmed.mp4`;
      
      const a = document.createElement('a');
      a.href = result.trimmedVideoUri;
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
    setStartTime('00:00:00');
    setEndTime('00:00:05');
    setIsTrimming(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Trim Video</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Cut your video files to the perfect length.
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
                 <video ref={videoRef} src={videoPreview} controls className="w-full rounded-lg border shadow-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time (HH:MM:SS)</Label>
                        <Input id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="end-time">End Time (HH:MM:SS)</Label>
                        <Input id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleTrim}
                  disabled={isTrimming}
                >
                  {isTrimming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Trimming...
                    </>
                   ) : <><Scissors className="mr-2"/>Trim Video</>}
                </Button>
              </div>
            )}

            {result && (
              <div className="flex flex-col items-center gap-6">
                <Alert>
                    <VideoIcon className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                        Your video has been trimmed successfully.
                    </AlertDescription>
                </Alert>
                <video src={result.trimmedVideoUri} controls className="w-full rounded-lg border shadow-md" />
                 <div className="flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                        <FileDown className="mr-2" />
                        Download Trimmed Video
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2" />
                        Trim Another
                    </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <ToolSections 
        toolName="Video Trimming" 
        sections={getCustomToolSections("Video Trimming")} 
      />
      
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
