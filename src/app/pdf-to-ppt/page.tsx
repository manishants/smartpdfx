
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileUp, Loader2, RefreshCw, FileType } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';
import * as pdfjsLib from 'pdfjs-dist';
import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';
import { ModernPageLayout } from "@/components/modern-page-layout";
import { ModernSection } from "@/components/modern-section";
import { ModernUploadArea } from "@/components/modern-upload-area";
import { AIPoweredFeatures } from "@/components/ai-powered-features";
import { ProTip } from "@/components/pro-tip";
 
// Ensure pdf.js runs without a web worker in Next.js/Turbopack
pdfjsLib.GlobalWorkerOptions.disableWorker = true;
// Also provide a stable worker source to prevent chunk misresolution in dev
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does the PDF to PowerPoint conversion work?</AccordionTrigger>
                <AccordionContent>
                    Our tool works entirely in your browser. It analyzes your PDF to extract text, images, and their layouts. It then reconstructs this content as editable text boxes and images on slides in a new PowerPoint (.pptx) file, preserving the original look and feel as closely as possible.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is the text and images editable in the final PPTX file?</AccordionTrigger>
                <AccordionContent>
                    Yes. The tool converts PDF text into native PowerPoint text boxes and embeds PDF images as regular images. This means you can edit the text, move elements around, and resize images directly in PowerPoint. However, complex layouts may sometimes be challenging to replicate perfectly.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my files secure?</AccordionTrigger>
                <AccordionContent>
                   Yes. The entire conversion process happens in your web browser. Your PDF file is never uploaded to our servers, ensuring your data remains completely private.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PdfToPptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  
  const handleFileSelected = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
       if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
      }
    }
  };


  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    
    try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
        const numPages = pdf.numPages;
        
        const pptx = new PptxGenJS();

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 }); // Use scale 1.0 for true dimensions
            const { width: pageWidth, height: pageHeight } = viewport;

            // Set slide dimensions based on PDF page dimensions
            pptx.layout = 'LAYOUT_16x9'; // Default layout
             // PPTXGenJS uses inches, PDF uses points (72 points = 1 inch)
            const slideWidth = pageWidth / 72;
            const slideHeight = pageHeight / 72;
            pptx.defineLayout({ name: `PDF_Page_${i}`, width: slideWidth, height: slideHeight });
            let slide = pptx.addSlide({ masterName: `PDF_Page_${i}` });
            let overflowSlide: any = null;
            let overflowCursorY = 0.5; // inches
            
            // --- Process Text ---
            const textContent = await page.getTextContent();
            for (const item of textContent.items as any[]) {
                if (item.str.trim().length === 0) continue;

                const tx = item.transform;
                const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
                
                let textX = tx[4] / 72; // Convert to inches
                let textY = (pageHeight - tx[5] - fontHeight) / 72; // Convert to inches
                const textWBase = item.width / 72;
                const textHIn = fontHeight / 72;
                const margin = 0.25;
                // Clamp X within page bounds
                if (textX < margin) textX = margin;
                if (textX > slideWidth - margin) textX = Math.max(margin, slideWidth - margin);
                // Compute effective width within page bounds
                const textW = Math.max(margin, Math.min(textWBase, slideWidth - textX - margin));
                
                const style = textContent.styles[item.fontName];
                const isBold = style.fontFamily.toLowerCase().includes('bold');
                const isItalic = style.fontFamily.toLowerCase().includes('italic');
                // If the text would go beyond the bottom, continue on a new slide
                if (textY + textHIn > slideHeight - margin) {
                  if (!overflowSlide) {
                    overflowSlide = pptx.addSlide({ masterName: `PDF_Page_${i}` });
                    overflowCursorY = margin;
                  }
                  overflowSlide.addText(item.str, {
                    x: margin,
                    y: overflowCursorY,
                    w: slideWidth - 2 * margin,
                    h: textHIn,
                    fontFace: style.fontFamily.split(',')[0],
                    fontSize: fontHeight * 0.75,
                    color: '000000',
                    bold: isBold,
                    italic: isItalic,
                    valign: 'top'
                  });
                  overflowCursorY += textHIn * 1.2;
                } else {
                  slide.addText(item.str, {
                    x: textX,
                    y: textY,
                    w: textW,
                    h: textHIn,
                    fontFace: style.fontFamily.split(',')[0],
                    fontSize: fontHeight * 0.75, // Approximate conversion
                    color: '000000',
                    bold: isBold,
                    italic: isItalic,
                    valign: 'top'
                  });
                }
            }

            // --- Process Images ---
            const operatorList = await page.getOperatorList();
            const validImgOperators = ["paintImageXObject", "paintImageXObjectRepeat", "paintInlineImageXObject"];
            
            for(let j=0; j < operatorList.fnArray.length; j++) {
                const op = operatorList.fnArray[j];
                if (validImgOperators.includes((pdfjsLib.OPS as any)[op])) {
                    const opName = (pdfjsLib.OPS as any)[op];
                    const opArgs = operatorList.argsArray[j];
                    const imgKey = opArgs[0];
                    try {
                        const imgData = await page.objs.get(imgKey);
                        
                        if (imgData && imgData.data) {
                            const { width: imgW, height: imgH } = imgData;
                            
                            let imageBase64 = '';
                            if (imgData.kind === 3) { // treat RGB_24BPP as JPEG
                                imageBase64 = 'data:image/jpeg;base64,' + btoa(String.fromCharCode.apply(null, Array.from(imgData.data)));
                            } else if (imgData.kind === pdfjsLib.ImageKind.RGBA_32BPP || imgData.kind === pdfjsLib.ImageKind.RGB_24BPP) {
                                const canvas = document.createElement('canvas');
                                canvas.width = imgW;
                                canvas.height = imgH;
                                const ctx = canvas.getContext('2d');
                                if(ctx) {
                                    const imgBitmap = ctx.createImageData(imgW, imgH);
                                    imgBitmap.data.set(imgData.data);
                                    ctx.putImageData(imgBitmap, 0, 0);
                                    imageBase64 = canvas.toDataURL();
                                }
                            }

                            if(imageBase64) {
                                slide.addImage({ 
                                    data: imageBase64, 
                                    x: 0, 
                                    y: 0, 
                                    w: '100%', 
                                    h: '100%',
                                });
                            }
                        }
                    } catch (e) {
                      console.log('could not get image', e)
                    }
                }
            }
        }

        const blob = await pptx.write({ outputType: 'blob' });
        const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
        saveAs(blob, `${originalFilename}.pptx`);

        toast({
            title: "Conversion Successful!",
            description: "Your PowerPoint file has been downloaded.",
        });

    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Something went wrong while converting your PDF. The file might be too complex for editable conversion.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Removed LibreOffice server export; in-browser conversion is the default No OCR path.
  
  const handleReset = () => {
    setFile(null);
    setIsConverting(false);
  };

  return (
    <>
      <ModernPageLayout
        title="PDF to PowerPoint Converter"
        description="Convert your PDFs into editable PowerPoint slides while preserving text and images."
        icon={<FileType className="h-8 w-8" />}
        badge="Client-Side"
        backgroundVariant="home"
      >
        <div className="space-y-8">
          <ModernSection>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Upload Area */}
              <div className="lg:col-span-2">
                {!file ? (
                  <ModernUploadArea
                    onFileSelect={handleFileSelected}
                    accept="application/pdf"
                    maxSize={50 * 1024 * 1024}
                    isLoading={isConverting}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative bg-gradient-to-r from-primary/10 to-blue-600/10 p-6 rounded-full border border-primary/20">
                          <UploadCloud className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Drop your PDF here or click to browse</h3>
                        <p className="text-muted-foreground">Supports PDF files up to 50MB</p>
                      </div>
                    </div>
                  </ModernUploadArea>
                ) : (
                  <div className="space-y-6">
                    {/* File Info */}
                    <Card className="bg-gradient-to-r from-primary/5 to-blue-600/5 border border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg">
                              <FileType className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{file.name}</h3>
                              <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <FileUp className="mr-2 h-5 w-5" />
                            Convert to PPT & Download
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-medium py-3 px-6 rounded-lg transition-all duration-200"
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Start Over
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: AI Features + Pro Tip below */}
              <div className="lg:col-span-1 space-y-4">
                <AIPoweredFeatures 
                  features={[
                    "Editable text boxes",
                    "Preserves layout",
                    "Maintains image quality",
                    "Slide-ready output"
                  ]}
                />
                <ProTip tip="For best results, use PDFs with selectable text. Scanned PDFs may require OCR before conversion." />
              </div>
            </div>
          </ModernSection>

          <ModernSection>
            <FAQ />
          </ModernSection>
      <ToolHowtoRenderer slug="pdf-to-ppt" />
      <ToolCustomSectionRenderer slug="pdf-to-ppt" />
        </div>
      </ModernPageLayout>
      <AllTools />
    </>
  );
}

    