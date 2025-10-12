
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileDown, Loader2, RefreshCw, Wand2, ArrowRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { redesignRoom } from '@/ai/flows/redesign-room';
import type { RedesignRoomInput, RedesignRoomOutput } from '@/lib/types';

interface UploadedFile {
  file: File;
  preview: string;
}

const designStyles = [
  "Modern",
  "Minimalist",
  "Industrial",
  "Bohemian",
  "Scandinavian",
  "Coastal",
  "Farmhouse",
];

export default function AiInteriorDesignerPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [style, setStyle] = useState<string>("Modern");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RedesignRoomOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile({ file: selectedFile, preview: URL.createObjectURL(selectedFile) });
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
      toast({ title: "No photo selected", description: "Please select a photo of a room.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setResult(null);
    try {
      const photoUri = await fileToDataUri(file.file);
      const input: RedesignRoomInput = { photoUri, style };

      const processedResult = await redesignRoom(input);

      if (processedResult) {
        setResult(processedResult);
      } else {
        throw new Error("Design process returned no data.");
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
      const newFilename = `${originalFilename}-${style.toLowerCase()}.png`;
      const a = document.createElement('a');
      a.href = result.redesignedPhotoUri;
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
        <h1 className="text-4xl font-bold font-headline">AI Interior Designer</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload a photo of your room and let AI redesign it in any style.
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
                <p className="mt-4 font-semibold text-primary">Upload a photo of your room</p>
                <Input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            )}

            {file && !result && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-lg border rounded-lg overflow-hidden shadow-md">
                   <Image src={file.preview} alt="Room preview" width={800} height={600} className="w-full h-auto object-contain" />
                </div>
                <div className="w-full max-w-sm space-y-2">
                    <Label htmlFor="style">Design Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="style"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {designStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button size="lg" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redesigning...</>
                   ) : <><Wand2 className="mr-2"/>Redesign with AI</>}
                </Button>
              </div>
            )}

            {result && file && (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full grid md:grid-cols-3 gap-6 items-center">
                      <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">Before</h3>
                          <div className="relative w-full border rounded-lg overflow-hidden shadow-md">
                              <Image src={file.preview} alt="Original room" width={600} height={450} className="w-full h-auto object-contain" />
                          </div>
                      </div>
                      <ArrowRight className="h-8 w-8 text-primary hidden md:block mx-auto" />
                      <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">After ({style})</h3>
                          <div className="relative w-full border rounded-lg overflow-hidden shadow-md">
                              <Image src={result.redesignedPhotoUri} alt="Redesigned room" width={600} height={450} className="w-full h-auto object-contain" />
                          </div>
                      </div>
                  </div>
                  <div className="mt-6 text-center space-x-4">
                      <Button size="lg" onClick={handleDownload}><FileDown className="mr-2" />Download</Button>
                      <Button size="lg" variant="outline" onClick={handleReset}><RefreshCw className="mr-2" />Try Another</Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
    <AllTools />
    </>
  );
}
