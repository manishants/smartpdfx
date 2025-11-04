
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Copy, Trash2, Check, Palette, ZoomIn, MousePointer, Globe, Loader2, Sparkles, Zap, Eye, Pipette } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getWebsiteScreenshot } from '@/lib/actions/get-website-screenshot';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';

interface Screenshot {
  preview: string;
}

interface ColorInfo {
  hex: string;
  rgb: string;
}

const FAQ = () => (
  <ModernSection className="mt-16">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-gray-600 text-lg">Everything you need to know about our AI-powered website color picker</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border-2 border-purple-100/50 rounded-xl bg-gradient-to-br from-purple-50/30 to-pink-50/20 px-6">
          <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-purple-600 py-6">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-600" />
              How does this tool get colors from a website?
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
            When you enter a URL, our AI-powered server uses a headless browser to visit the website and take a full-page screenshot. 
            That screenshot is then sent back to your browser and loaded into our intelligent color picker, where you can select colors 
            with precision just like with our Image Color Picker tool.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border-2 border-blue-100/50 rounded-xl bg-gradient-to-br from-blue-50/30 to-purple-50/20 px-6">
          <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-blue-600 py-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-600" />
              Why does it take a moment to load the website?
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
            Because we are loading a real browser on our server, navigating to the URL, and waiting for the page to fully load 
            before taking a screenshot, the process can take several seconds. This ensures we get the most accurate representation 
            of the live website with all its dynamic content and styling.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border-2 border-green-100/50 rounded-xl bg-gradient-to-br from-green-50/30 to-blue-50/20 px-6">
          <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-green-600 py-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-600" />
              Can this tool access websites that require a login?
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
            No, our tool can only access publicly available websites. It cannot log in to private areas, so it's not suitable 
            for picking colors from behind a login wall. However, it works perfectly with all public websites and landing pages.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </ModernSection>
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
    <ModernPageLayout
      title="Website Color Picker"
      description="Extract beautiful color palettes from any website with AI-powered precision and real-time preview."
      icon={<Pipette className="w-8 h-8" />}
    >
      <ModernSection>
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-purple-50/20">
            <CardContent className="p-8">
              {!screenshot ? (
                <div className="max-w-lg mx-auto space-y-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Globe className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Enter Website URL</h3>
                    </div>
                    <p className="text-gray-600 text-lg">Get a live screenshot and extract colors from any website</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Website URL</label>
                      <Input 
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchScreenshot()}
                        disabled={isLoading}
                        className="h-12 text-lg bg-white/80 border-blue-200 focus:border-purple-400 focus:ring-purple-400/20"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleFetchScreenshot} 
                      disabled={isLoading || !url.trim()} 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Capturing Website...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          <Zap className="w-4 h-4 mr-1" />
                          Get Colors with AI
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl p-6 border border-purple-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Eye className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-800">How it works</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Our AI takes a live screenshot of the website, then you can hover and click anywhere on the image 
                      to extract precise color codes. Perfect for designers and developers!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                          <Pipette className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Interactive Color Picker</h3>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => { setScreenshot(null); setPickedColors([]); setUrl(''); }}
                        className="border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl"
                      >
                        <Globe className="w-4 h-4 mr-2" /> 
                        New Website
                      </Button>
                    </div>
                    
                    <div className="relative cursor-crosshair border-2 border-blue-200/50 rounded-xl overflow-hidden bg-white shadow-lg">
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
                          className="pointer-events-none absolute flex items-center gap-2 p-3 rounded-lg bg-white/95 backdrop-blur-sm border-2 border-blue-200/50 shadow-lg z-10"
                          style={{ 
                            left: Math.min(mousePos.x + 15, window.innerWidth - 200), 
                            top: Math.max(mousePos.y - 50, 10) 
                          }}
                        >
                          <div className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm" style={{ backgroundColor: hoveredColor.hex }}></div>
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-sm text-gray-800">{hoveredColor.hex}</span>
                            <span className="font-mono text-xs text-gray-500">{hoveredColor.rgb}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-4 border border-blue-200/50">
                      <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
                        <MousePointer className="w-4 h-4 text-blue-600" /> 
                        Hover to preview colors, click to add them to your palette
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                        <Palette className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Color Palette</h3>
                    </div>
                    
                    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-pink-50/20">
                      <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
                        {pickedColors.length === 0 ? (
                          <div className="text-center py-12">
                            <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 font-medium">Your color palette is empty</p>
                            <p className="text-sm text-gray-400 mt-1">Click on the website image to start collecting colors</p>
                          </div>
                        ) : (
                          pickedColors.map(color => (
                            <div key={color.hex} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/60 transition-all duration-200 border border-gray-200/50 bg-white/40">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl border-2 border-gray-300 shadow-sm" style={{backgroundColor: color.hex}} />
                                <div className="flex flex-col">
                                  <span className="font-mono font-bold text-sm text-gray-800">{color.hex}</span>
                                  <span className="font-mono text-xs text-gray-500">{color.rgb}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleCopy(color.hex)}
                                className="hover:bg-blue-100 hover:text-blue-600 rounded-lg"
                              >
                                <Copy className="w-4 h-4"/>
                              </Button>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ModernSection>
      
      <FAQ />
      <ToolCustomSectionRenderer slug="website-color-picker" />
    </ModernPageLayout>
  );
}
