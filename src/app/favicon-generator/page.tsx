
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Star, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateFavicon } from '@/lib/actions/generate-favicon';
import type { GenerateFaviconInput, GenerateFaviconOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';

interface UploadedFile {
  file: File;
  preview: string;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What is a favicon?</AccordionTrigger>
                <AccordionContent>
                    A favicon (short for "favorite icon") is a small icon that represents your website. It appears in browser tabs, bookmarks, and other places across the web, helping to identify your site at a glance.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What image should I use to generate a favicon?</AccordionTrigger>
                <AccordionContent>
                    The best images to use are simple, square-shaped logos or graphics. Complex images will be difficult to see at the small sizes of a favicon. Our tool will automatically resize your image to standard favicon dimensions (16x16, 32x32, and 48x48 pixels) and bundle them into a single .ico file.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>How do I add the favicon to my website?</AccordionTrigger>
                <AccordionContent>
                    After downloading your `favicon.ico` file, upload it to the root directory of your website. Then, add the following line of code to the `&lt;head&gt;` section of your HTML: `&lt;link rel="icon" href="/favicon.ico" sizes="any" /&gt;`.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function FaviconGeneratorPage() {
  // Tool-specific sections removed; page now uses home-only CMS content
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateFaviconOutput | null>(null);
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

  const handleGenerate = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select an image.", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      const input: GenerateFaviconInput = { imageUri };
      
      const genResult = await generateFavicon(input);
      
      if (genResult && genResult.faviconUri) {
        setResult(genResult);
      } else {
        throw new Error("Generation returned no data.");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result.faviconUri;
      a.download = "favicon.ico";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsGenerating(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Favicon Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Create a favicon.ico file from any image.
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
                <p className="mt-4 font-semibold text-primary">Upload your logo or image</p>
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
                <div className="relative w-full max-w-sm border rounded-lg overflow-hidden shadow-md">
                   <Image src={file.preview} alt="Original preview" width={400} height={400} className="w-full h-auto object-contain" />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                   ) : <><Star className="mr-2"/> Generate Favicon</>}
                </Button>
              </div>
            )}

            {result && (
               <div className="text-center flex flex-col items-center gap-6">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Favicon Generated!</h2>
                 <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted">
                    <p className="font-semibold">Preview:</p>
                    <Image src={result.faviconUri} alt="Favicon preview 16x16" width={16} height={16} />
                    <Image src={result.faviconUri} alt="Favicon preview 32x32" width={32} height={32} />
                     <Image src={result.faviconUri} alt="Favicon preview 48x48" width={48} height={48} />
                 </div>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download favicon.ico
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Create Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tool-specific sections removed as part of home-only sections refactor */}
      
      <FAQ />
      <ToolCustomSectionRenderer slug="favicon-generator" />
    </main>
    <AllTools />
    </>
  );
}
