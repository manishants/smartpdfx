
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileUp, Loader2, RefreshCw, FileType } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import * as pdfjsLib from 'pdfjs-dist';
import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';
import { pdfToPptx } from '@/lib/actions/pdf-to-pptx';

// pdfjsLib.GlobalWorkerOptions.disableWorker = true;

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
            const slide = pptx.addSlide({ masterName: `PDF_Page_${i}` });
            
            // --- Process Text ---
            const textContent = await page.getTextContent();
            for (const item of textContent.items as any[]) {
                if (item.str.trim().length === 0) continue;

                const tx = item.transform;
                const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
                
                const textX = tx[4] / 72; // Convert to inches
                const textY = (pageHeight - tx[5] - fontHeight) / 72; // Convert to inches
                const textW = item.width / 72;
                
                const style = textContent.styles[item.fontName];
                const isBold = style.fontFamily.toLowerCase().includes('bold');
                const isItalic = style.fontFamily.toLowerCase().includes('italic');
                
                slide.addText(item.str, {
                    x: textX,
                    y: textY,
                    w: textW,
                    h: fontHeight / 72,
                    fontFace: style.fontFamily.split(',')[0],
                    fontSize: fontHeight * 0.75, // Approximate conversion from points to PowerPoint points
                    color: '000000',
                    bold: isBold,
                    italic: isItalic,
                    valign: 'top'
                });
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

  const handleConvertWithLibreOffice = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a PDF to convert.", variant: "destructive" });
      return;
    }
    setIsConverting(true);
    try {
      // Use FileReader to avoid Node Buffer in the browser
      const pdfUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await pdfToPptx({ pdfUri });
      if (res.error) throw new Error(res.error);
      if (!res.pptxUri) throw new Error('No PPTX produced');
      const link = document.createElement('a');
      link.href = res.pptxUri;
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted';
      link.download = `${originalFilename}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Conversion Successful!', description: 'LibreOffice export completed and downloaded.' });
    } catch (error: any) {
      console.error('LibreOffice export failed:', error);
      toast({
        title: 'LibreOffice Export Failed',
        description: error.message || 'Unable to export via LibreOffice.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setIsConverting(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">PDF to PowerPoint</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your PDF to an editable PPTX file.
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
                <p className="mt-4 font-semibold text-primary">Drag & drop a PDF here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {file && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                </div>
                <div className="flex gap-4 flex-wrap">
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
                    ) : <><FileUp className="mr-2"/>Convert to PPT & Download</>}
                    </Button>
                    <Button size="lg" variant="secondary" onClick={handleConvertWithLibreOffice} disabled={isConverting}>
                      {isConverting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2" />
                          Convert with LibreOffice (Fast)
                        </>
                      )}
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2" /> Start Over
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

    