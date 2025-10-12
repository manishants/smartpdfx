
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Wand2, FileDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { textToImage } from '@/ai/flows/text-to-image';
import type { TextToImageInput, TextToImageOutput } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TextToImageOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt is empty", description: "Please enter a description for the image you want to create.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const input: TextToImageInput = { prompt, style };
      const generationResult = await textToImage(input);
      if (generationResult && generationResult.imageUri) {
        setResult(generationResult);
      } else {
        throw new Error("Image generation failed to return an image.");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result.imageUri;
      a.download = `${prompt.substring(0, 30).replace(/\s/g, '_') || 'generated-image'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setResult(null);
    setIsGenerating(false);
  };

  return (
    <>
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Text-to-Image Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Describe an image, and let our AI create it for you.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., A majestic lion wearing a crown, sitting on a throne in a jungle"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-32 text-base"
                  disabled={isGenerating}
                />
                <div className="space-y-2">
                    <Label htmlFor="style">Art Style</Label>
                    <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                        <SelectTrigger id="style">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="photorealistic">Photorealistic</SelectItem>
                            <SelectItem value="digital art">Digital Art</SelectItem>
                            <SelectItem value="anime">Anime</SelectItem>
                            <SelectItem value="pixel art">Pixel Art</SelectItem>
                            <SelectItem value="3d model">3D Model</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button 
                  className="w-full"
                  size="lg" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                   ) : <><Wand2 className="mr-2"/>Generate Image</>}
                </Button>
              </div>

              <div className="flex items-center justify-center bg-muted/50 border rounded-lg p-4 h-64 md:h-auto">
                 {isGenerating && (
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="mt-2 text-muted-foreground">Creating your masterpiece...</p>
                    </div>
                 )}
                 {result && (
                    <div className="relative w-full h-full">
                        <Image src={result.imageUri} alt="Generated image" layout="fill" className="object-contain" />
                    </div>
                 )}
                 {!isGenerating && !result && (
                    <p className="text-muted-foreground">Your generated image will appear here.</p>
                 )}
              </div>
            </div>

            {result && (
                <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={handleDownload}>
                        <FileDown className="mr-2"/> Download
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2" /> Create Another
                    </Button>
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
