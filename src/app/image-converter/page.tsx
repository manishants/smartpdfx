
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileDown, Loader2, RefreshCw, Repeat, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { convertImage } from '@/lib/actions/convert-image';
import type { ConvertImageInput, ConvertImageOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

type Format = 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff';

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What is the difference between JPG, PNG, and WEBP?</AccordionTrigger>
                <AccordionContent>
                    <b>JPG (or JPEG)</b> is best for photos and images with many colors. It uses lossy compression, meaning it reduces file size by discarding some image information, but is great for general use. <b>PNG</b> is best for graphics with flat colors, text, or transparency, as it uses lossless compression (no quality loss). <b>WEBP</b> is a modern format developed by Google that provides excellent lossless and lossy compression, often resulting in smaller file sizes than both JPG and PNG at similar quality.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Will converting my image reduce its quality?</AccordionTrigger>
                <AccordionContent>
                    It depends on the conversion. Converting from a high-quality format like PNG to a lossy format like JPG will cause some quality loss to achieve a smaller file size. Converting between lossless formats (like PNG to WEBP lossless) will not degrade quality. Our tool aims to maintain the highest possible quality for the selected format.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function ImageConverterPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [format, setFormat] = useState<Format>('png');
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConvertImageOutput | null>(null);
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

  const handleConvert = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image.", variant: "destructive" });
      return;
    }
    
    setIsConverting(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      const input: ConvertImageInput = { imageUri, format };
      
      const convertResult = await convertImage(input);
      
      if (convertResult && convertResult.convertedImageUri) {
        setResult(convertResult);
      } else {
        throw new Error("Conversion returned no data.");
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}.${format}`;
      
      const a = document.createElement('a');
      a.href = result.convertedImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsConverting(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Image Converter</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert images to JPG, PNG, WEBP, and more.
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
                <div className="w-full max-w-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Convert to</Label>
                    <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPG</SelectItem>
                        <SelectItem value="webp">WEBP</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                        <SelectItem value="tiff">TIFF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                   ) : <><Repeat className="mr-2"/> Convert</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-6">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                   <Image src={result.convertedImageUri} alt="Converted preview" width={600} height={400} className="w-full h-auto object-contain" />
                 </div>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download .{format}
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Convert Another
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
