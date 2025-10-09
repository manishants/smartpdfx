
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Copy, Trash2, Check, Palette, ZoomIn, MousePointer, Globe, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getWebsiteScreenshot } from '@/lib/actions/get-website-screenshot';

interface Screenshot {
  preview: string;
}

interface ColorInfo {
  hex: string;
  rgb: string;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does this tool get colors from a website?</AccordionTrigger>
                <AccordionContent>
                    When you enter a URL, our server uses a headless browser to visit the website and take a full-page screenshot. That screenshot is then sent back to your browser and loaded into the color picker, where you can select colors just like with our Image Color Picker tool.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Why does it take a moment to load the website?</AccordionTrigger>
                <AccordionContent>
                    Because we are loading a real browser on our server, navigating to the URL, and waiting for the page to fully load before taking a screenshot, the process can take several seconds. This ensures we get the most accurate representation of the live website.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Can this tool access websites that require a login?</AccordionTrigger>
                <AccordionContent>
                    No, our tool can only access publicly available websites. It cannot log in to private areas, so it's not suitable for picking colors from behind a login wall.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function WebsiteColorPickerPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [pickedColors, setPickedColors] = useState<ColorInfo[]>([]);
  const [hoveredColor, setHoveredColor] = useState<ColorInfo | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { toast } = useToast();

  const handleFetchScreenshot = async () => {
    if (!url) {
        toast({ title: "No URL", description: "Please enter a valid website URL.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setScreenshot(null);
    try {
        const result = await getWebsiteScreenshot({ url });
        const img = document.createElement('img');
        img.onload = () => {
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    canvasRef.current.width = img.width;
                    canvasRef.current.height = img.height;
                    ctx.drawImage(img, 0, 0);
                }
            }
        }
        img.src = result.screenshotUri;
        setScreenshot({ preview: result.screenshotUri });

    } catch (error: any) {
        toast({ title: "Failed to get screenshot", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };
  
  const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!canvasRef.current || !imageRef.current) return;
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    setHoveredColor({ hex, rgb });
    setMousePos({ x: e.clientX, y: e.clientY });
  };
  
  const handleClick = () => {
    if (hoveredColor) {
      if (!pickedColors.some(c => c.hex === hoveredColor.hex)) {
        setPickedColors(prev => [...prev, hoveredColor]);
      }
      toast({
        title: `Color ${hoveredColor.hex} added!`,
      });
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!", description: text });
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Website Color Picker</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Enter a URL to extract color codes from a website.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            {!screenshot && (
              <div className="max-w-lg mx-auto flex flex-col items-center text-center gap-4">
                <Globe className="h-16 w-16 text-primary" />
                <div className="w-full space-y-2">
                    <Input 
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchScreenshot()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleFetchScreenshot} disabled={isLoading} className="w-full">
                        {isLoading ? <><Loader2 className="mr-2 animate-spin"/>Fetching Website...</> : "Get Colors"}
                    </Button>
                </div>
              </div>
            )}
            {screenshot && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold">Hover over the image to pick a color</h3>
                  <div className="relative cursor-crosshair border rounded-lg overflow-hidden">
                     <Image
                        ref={imageRef}
                        src={screenshot.preview}
                        alt="Website screenshot"
                        width={1280}
                        height={800}
                        className="w-full h-auto object-contain"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredColor(null)}
                        onClick={handleClick}
                      />
                     <canvas ref={canvasRef} className="hidden" />

                     {hoveredColor && mousePos && (
                       <div 
                         className="pointer-events-none absolute flex items-center gap-2 p-2 rounded-lg bg-background/80 border shadow-lg"
                         style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
                       >
                         <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: hoveredColor.hex }}></div>
                         <span className="font-mono text-sm">{hoveredColor.hex}</span>
                       </div>
                     )}
                  </div>
                   <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2"><MousePointer className="h-4 w-4" /> Click on the image to add a color to your palette.</p>
                </div>

                <div className="space-y-4">
                   <h3 className="text-lg font-semibold">Color Palette</h3>
                   <Card>
                      <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {pickedColors.length === 0 ? (
                           <p className="text-sm text-muted-foreground text-center py-8">Your picked colors will appear here.</p>
                        ) : (
                          pickedColors.map(color => (
                            <div key={color.hex} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-md border" style={{backgroundColor: color.hex}} />
                                <div className="flex flex-col">
                                   <span className="font-mono font-semibold text-sm">{color.hex}</span>
                                   <span className="font-mono text-xs text-muted-foreground">{color.rgb}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(color.hex)}>
                                <Copy className="h-4 w-4"/>
                              </Button>
                            </div>
                          ))
                        )}
                      </CardContent>
                   </Card>
                   <Button variant="outline" className="w-full" onClick={() => { setScreenshot(null); setPickedColors([]); setUrl(''); }}>
                       <Globe className="mr-2 h-4 w-4" /> Check Another Site
                   </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <FAQ />
    </div>
    <AllTools />
    </>
  );
}
