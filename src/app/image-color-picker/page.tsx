
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Copy, Trash2, Check, Palette, ZoomIn, MousePointer } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface UploadedFile {
  file: File;
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
                <AccordionTrigger>How does the color picker work?</AccordionTrigger>
                <AccordionContent>
                    When you upload an image, it's drawn onto a hidden canvas element in your browser. As you move your mouse over the displayed image, we use JavaScript to read the pixel data from the canvas at your cursor's position. This gives us the color information, which we then display for you.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Are my images uploaded to a server?</AccordionTrigger>
                <AccordionContent>
                    No. This tool works entirely within your web browser. Your images are not uploaded to our servers, ensuring your privacy and making the tool work instantly.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Can I use this on images from other websites?</AccordionTrigger>
                <AccordionContent>
                    You can't directly use an image from another website. You would need to first save the image to your computer and then upload it to this tool. Alternatively, you can use our <a href="/website-color-picker" className="text-primary underline">Website Color Picker</a> tool to extract colors from any URL.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function ImageColorPickerPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pickedColors, setPickedColors] = useState<ColorInfo[]>([]);
  const [hoveredColor, setHoveredColor] = useState<ColorInfo | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        const preview = URL.createObjectURL(selectedFile);
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
        img.src = preview;
        setFile({ file: selectedFile, preview });
        setPickedColors([]);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      }
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
        description: `You have ${pickedColors.length + 1} colors in your palette.`,
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
        <h1 className="text-4xl font-bold font-headline">Image Color Picker</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Upload an image to extract color codes.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            {!file && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Click to upload an image</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
            {file && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold">Hover over the image to pick a color</h3>
                  <div className="relative cursor-crosshair">
                     <Image
                        ref={imageRef}
                        src={file.preview}
                        alt="Uploaded preview"
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain border rounded-lg"
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
                   {pickedColors.length > 0 && (
                     <Button variant="outline" className="w-full" onClick={() => setPickedColors([])}>
                       <Trash2 className="mr-2 h-4 w-4" /> Clear Palette
                     </Button>
                   )}
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
