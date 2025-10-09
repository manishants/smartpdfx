
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, FileDown, Loader2, RefreshCw, Ruler, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { resizeImage } from '@/lib/actions/resize-image';
import type { ResizeImageInput, ResizeImageOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
  width: number;
  height: number;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Will resizing my image distort it?</AccordionTrigger>
                <AccordionContent>
                    Our tool maintains the original aspect ratio by default. When you enter a new width, the height will be adjusted automatically to prevent stretching or squashing the image. If you enter both width and height, the image will be resized to fit within those dimensions without being enlarged.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Does resizing the image also compress it?</AccordionTrigger>
                <AccordionContent>
                    Yes, making an image smaller in dimensions (e.g., from 4000x3000 pixels to 800x600 pixels) will naturally reduce its file size because there is less pixel data to store. However, this tool does not apply additional compression like our dedicated Image Compressor tool.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function ImageResizerPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [result, setResult] = useState<ResizeImageOutput | null>(null);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [percentage, setPercentage] = useState<number | ''>(50);

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        const preview = URL.createObjectURL(selectedFile);
        const img = document.createElement('img');
        img.onload = () => {
            setFile({ file: selectedFile, preview, width: img.width, height: img.height });
            setWidth(Math.round(img.width / 2));
            setHeight(Math.round(img.height / 2));
        }
        img.src = preview;
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

  const handleResize = async (mode: 'pixel' | 'percentage') => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image.", variant: "destructive" });
      return;
    }
    
    let input: ResizeImageInput;
    const imageUri = await fileToDataUri(file.file);

    if (mode === 'pixel') {
        if (!width && !height) {
            toast({ title: "No dimensions set", description: "Please enter a width or height.", variant: "destructive" });
            return;
        }
        input = { imageUri, width: width || undefined, height: height || undefined };
    } else {
        if (!percentage) {
            toast({ title: "No percentage set", description: "Please enter a percentage.", variant: "destructive" });
            return;
        }
        input = { imageUri, percentage: percentage || undefined };
    }
    
    setIsResizing(true);
    setResult(null);
    try {
      const resizeResult = await resizeImage(input);
      if (resizeResult && resizeResult.resizedImageUri) {
        setResult(resizeResult);
      } else {
        throw new Error("Resizing returned no data.");
      }
    } catch (error: any) {
      console.error("Resizing failed:", error);
      toast({
        title: "Resizing Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsResizing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name;
      const newFilename = `${originalFilename.substring(0, originalFilename.lastIndexOf('.'))}-resized.${originalFilename.split('.').pop()}`;
      
      const a = document.createElement('a');
      a.href = result.resizedImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setWidth('');
    setHeight('');
    setPercentage(50);
    setIsResizing(false);
  };
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newWidth = e.target.value === '' ? '' : parseInt(e.target.value, 10);
      setWidth(newWidth);
      if (newWidth && file) {
          const aspectRatio = file.height / file.width;
          setHeight(Math.round(newWidth * aspectRatio));
      }
  }

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Image Resizer</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Resize images by specific dimensions or percentage.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto">
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
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                   <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
                </div>
                 <p className="text-sm text-muted-foreground">Original dimensions: {file.width} x {file.height} pixels</p>

                <Tabs defaultValue="pixel" className="w-full max-w-md">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pixel">By Pixel</TabsTrigger>
                    <TabsTrigger value="percentage">By Percentage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pixel">
                    <Card>
                      <CardContent className="space-y-4 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label htmlFor="width">Width</Label>
                              <Input id="width" type="number" value={width} onChange={handleWidthChange} placeholder="e.g. 800"/>
                           </div>
                           <div className="space-y-2">
                              <Label htmlFor="height">Height</Label>
                              <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="e.g. 600"/>
                           </div>
                        </div>
                        <Button className="w-full" onClick={() => handleResize('pixel')} disabled={isResizing}>
                            {isResizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ruler className="mr-2"/>}
                            Resize Image
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="percentage">
                     <Card>
                      <CardContent className="space-y-4 pt-6">
                           <div className="space-y-2">
                              <Label htmlFor="percentage">Percentage</Label>
                              <Input id="percentage" type="number" value={percentage} onChange={(e) => setPercentage(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="e.g. 50"/>
                           </div>
                        <Button className="w-full" onClick={() => handleResize('percentage')} disabled={isResizing}>
                           {isResizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ruler className="mr-2"/>}
                           Resize Image
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-6">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Resize Successful!</h2>
                 <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                   <Image src={result.resizedImageUri} alt="Resized preview" width={600} height={400} className="w-full h-auto object-contain" />
                 </div>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Image
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Resize Another
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
