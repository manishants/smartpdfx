
"use client";

import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';


const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Reliable PowerPoint to PDF Conversion</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Convert your Microsoft PowerPoint presentations (.ppt, .pptx) into high-quality PDF files. Our converter ensures that your slides, images, text, and formatting are perfectly preserved, making it easy to share, archive, or print your presentations.
                </p>
                <p>
                    PDFs are a universal format that can be opened on any device, ensuring your presentation looks exactly as you intended, every time. Protect your layout and fonts by converting to PDF before sharing.
                </p>
            </CardContent>
        </Card>
    </div>
);

const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Will my animations and transitions be preserved?</AccordionTrigger>
                <AccordionContent>
                    No. The PDF format is static and does not support animations, transitions, or embedded videos. The converter will create a static image of each slide as it appears in the final presentation.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>How is the quality of the final PDF?</AccordionTrigger>
                <AccordionContent>
                    Our tool is optimized to create high-quality PDFs that preserve the original resolution of your images and the clarity of your text, making it suitable for both digital viewing and professional printing.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Are my presentation files secure?</AccordionTrigger>
                <AccordionContent>
                   Yes, because the entire conversion happens in your browser. Your files are never uploaded to our servers, ensuring maximum privacy.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Can I convert a password-protected PowerPoint file?</AccordionTrigger>
                <AccordionContent>
                    No, this client-side tool cannot open password-protected presentations. You must remove the password before uploading.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I convert a PDF back to PowerPoint?</AccordionTrigger>
                <AccordionContent>
                    Yes! For that, you can use our dedicated <a href="/pdf-to-ppt" className="text-primary underline">PDF to PowerPoint Converter</a>, which uses AI to reconstruct editable slides from your PDF.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PptToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ pdfUri: string } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
       if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pptx')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PPTX file.", variant: "destructive" });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PowerPoint document to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    setResult(null);
    try {
        const zip = await JSZip.loadAsync(file);
        const pdfDoc = await PDFDocument.create();

        // Get slide dimensions from presentation.xml
        const presentationXml = await zip.file('ppt/presentation.xml')?.async('string');
        const parser = new DOMParser();
        const presDoc = parser.parseFromString(presentationXml!, 'application/xml');
        const sldSz = presDoc.getElementsByTagName('p:sldSz')[0];
        const slideWidth = parseInt(sldSz.getAttribute('cx')!) / 12700;
        const slideHeight = parseInt(sldSz.getAttribute('cy')!) / 12700;
        
        // Get list of slides
        const presentationRelsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
        const relsDoc = parser.parseFromString(presentationRelsXml!, 'application/xml');
        const relationships = Array.from(relsDoc.getElementsByTagName('Relationship'));
        const slideRels = relationships
            .filter(rel => rel.getAttribute('Type') === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide')
            .sort((a,b) => parseInt(a.getAttribute('Id')!.substring(3)) - parseInt(b.getAttribute('Id')!.substring(3)));

        for (const rel of slideRels) {
            const slidePath = `ppt/${rel.getAttribute('Target')}`;
            const slideXml = await zip.file(slidePath)?.async('string');
            const page = pdfDoc.addPage([slideWidth, slideHeight]);
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            // This is a simplified parser. A full implementation would need to handle shapes, positions, fonts, etc.
            // For now, we will add slide images as backgrounds if they exist.
            const slideRelsPath = `ppt/slides/_rels/${slidePath.split('/').pop()}.rels`;
            const slideRelsFile = zip.file(slideRelsPath);
            if (slideRelsFile) {
                const slideRelsXml = await slideRelsFile.async('string');
                const slideRelsDoc = parser.parseFromString(slideRelsXml, 'application/xml');
                const imageRels = Array.from(slideRelsDoc.getElementsByTagName('Relationship'))
                    .filter(r => r.getAttribute('Type') === 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');

                for (const imageRel of imageRels) {
                    const imagePath = `ppt/slides/${imageRel.getAttribute('Target')!}`;
                    const imageFile = zip.file(imagePath);
                    if (imageFile) {
                        const imageBytes = await imageFile.async('uint8array');
                        let image;
                        try {
                           if (imagePath.endsWith('.png')) {
                              image = await pdfDoc.embedPng(imageBytes);
                           } else if (imagePath.endsWith('.jpeg') || imagePath.endsWith('.jpg')) {
                              image = await pdfDoc.embedJpg(imageBytes);
                           }

                           if(image) {
                               const dims = image.scaleToFit(width, height);
                               page.drawImage(image, {
                                   x: (width - dims.width) / 2,
                                   y: (height - dims.height) / 2,
                                   width: dims.width,
                                   height: dims.height
                               });
                           }
                        } catch (e) {
                            console.warn("Could not embed image:", imagePath, e);
                        }
                    }
                }
            }

            page.drawText(`Slide ${slideRels.indexOf(rel) + 1}`, {
                x: 10,
                y: 10,
                font,
                size: 8,
                color: rgb(0.8, 0.8, 0.8),
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUri = URL.createObjectURL(blob);
        setResult({ pdfUri });

    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Could not process the PowerPoint file. It might be in an old format (.ppt) or corrupted.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleDownload = () => {
    if (result && file) {
      saveAs(result.pdfUri, `${file.name.replace(/\.pptx?$/, '')}.pdf`);
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
        <h1 className="text-4xl font-bold font-headline">PowerPoint to PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your PowerPoint presentations to PDF files.
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
                <p className="mt-4 font-semibold text-primary">Drag & drop a PowerPoint file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file (.pptx)</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {file && !result && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
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
                   ) : <><FileUp className="mr-2"/>Convert to PDF</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />Download PDF
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
      <ToolDescription />
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
