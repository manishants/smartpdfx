
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, FileDown, Loader2, RefreshCw, Aperture, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { watermarkImage } from '@/lib/actions/watermark-image';
import type { WatermarkImageInput, WatermarkImageOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What is a watermark?</AccordionTrigger>
                <AccordionContent>
                    A watermark is a text or logo overlaid onto an image to identify the owner or creator. It's commonly used by photographers and artists to protect their work from being used without permission.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I upload my own logo as a watermark?</AccordionTrigger>
                <AccordionContent>
                    Yes. In the "Image" tab of the watermark options, you can upload your own logo (preferably a PNG with a transparent background) to use as a watermark instead of text.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function WatermarkImagePage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<WatermarkImageOutput | null>(null);
  
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('© Your Name');
  const [imageContent, setImageContent] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [scale, setScale] = useState(0.2);
  const [opacity, setOpacity] = useState(0.7);

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

  const handleWatermarkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const wmFile = event.target.files[0];
        if(wmFile.type.startsWith('image/')) {
            const uri = await fileToDataUri(wmFile);
            setImageContent(uri);
        } else {
            toast({ title: "Invalid watermark file", description: "Please upload an image to use as a watermark.", variant: "destructive"});
        }
    }
  }

  const handleProcess = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image.", variant: "destructive" });
      return;
    }
     if (watermarkType === 'image' && !imageContent) {
      toast({ title: "No watermark image", description: "Please upload an image to use as a watermark.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      const input: WatermarkImageInput = {
          imageUri,
          watermark: {
              type: watermarkType,
              content: watermarkType === 'text' ? textContent : imageContent!,
              position,
              scale,
              opacity,
          }
      };
      
      const processResult = await watermarkImage(input);
      
      if (processResult && processResult.watermarkedImageUri) {
        setResult(processResult);
      } else {
        throw new Error("Processing returned no data.");
      }
    } catch (error: any) {
      console.error("Processing failed:", error);
      toast({
        title: "Processing Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name;
      const newFilename = `${originalFilename.substring(0, originalFilename.lastIndexOf('.'))}-watermarked.${originalFilename.split('.').pop()}`;
      
      const a = document.createElement('a');
      a.href = result.watermarkedImageUri;
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
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Watermark Image</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Add a text or image watermark to protect your images.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            {!file && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Drag & drop an image here</p>
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
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                     <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
                  </div>
                </div>

                <div className="space-y-6">
                    <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as any)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="image">Image</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="pt-4">
                             <div className="space-y-2">
                                <Label htmlFor="text">Watermark Text</Label>
                                <Input id="text" value={textContent} onChange={(e) => setTextContent(e.target.value)} />
                             </div>
                        </TabsContent>
                        <TabsContent value="image" className="pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="wm-upload">Watermark Image</Label>
                                <Input id="wm-upload" type="file" accept="image/*" onChange={handleWatermarkImageUpload} />
                            </div>
                            {imageContent && <Image src={imageContent} alt="watermark preview" width={100} height={50} className="mt-2 border rounded-md p-1" />}
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2">
                        <Label>Position</Label>
                        <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                <SelectItem value="top-right">Top Right</SelectItem>
                                <SelectItem value="top-left">Top Left</SelectItem>
                                <SelectItem value="top-center">Top Center</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label>Scale: {Math.round(scale*100)}%</Label>
                        <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={0.1} max={1} step={0.05} />
                    </div>
                     <div className="space-y-4">
                        <Label>Opacity: {Math.round(opacity*100)}%</Label>
                        <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={0} max={1} step={0.1} />
                    </div>

                    <Button 
                      size="lg" 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Applying...
                        </>
                       ) : <><Aperture className="mr-2"/> Apply Watermark</>}
                    </Button>
                </div>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-6">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Watermark Applied!</h2>
                 <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                   <Image src={result.watermarkedImageUri} alt="Watermarked preview" width={600} height={400} className="w-full h-auto object-contain" />
                 </div>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Image
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Watermark Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
        <FAQ />
      </div>
    </main>
    <AllTools />
    </>
  );
}
