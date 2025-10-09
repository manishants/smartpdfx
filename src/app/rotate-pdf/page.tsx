
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, RotateCcw, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { rotatePdf } from '@/lib/actions/rotate-pdf';
import type { RotatePdfInput, RotatePdfOutput, Rotation } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Stage = 'upload' | 'rotate' | 'download';

interface PageToRender {
  src: string;
  pageNumber: number;
  rotation: number;
}


const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Rotate PDF Pages with Ease</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Correct the orientation of your PDF pages with our simple and effective rotation tool. Whether a page was scanned upside-down or is simply in the wrong orientation, you can fix it in seconds. Our tool provides a visual interface to rotate pages individually.
                </p>
                <p>
                    <strong>How to Use:</strong> Upload your PDF to see a preview of all pages. Click the rotate icon on any page thumbnail to turn it 90 degrees clockwise. You can click multiple times to rotate it further. Once all pages are correctly oriented, click "Apply Changes" to generate your new PDF.
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
                <AccordionTrigger>Can I rotate all pages at once?</AccordionTrigger>
                <AccordionContent>
                    Currently, our tool is designed for rotating pages individually, giving you precise control over your document. A "rotate all" feature is planned for a future update.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>In which direction do the pages rotate?</AccordionTrigger>
                <AccordionContent>
                    Each click on the rotate button will turn the page 90 degrees clockwise. Four clicks will bring the page back to its original orientation.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Does rotating a page affect its quality?</AccordionTrigger>
                <AccordionContent>
                    No. The rotation is a lossless operation. The quality of the text and images on the page will not be affected.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Are my files safe?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is a top priority. Files are uploaded securely and are permanently deleted from our servers one hour after processing is complete.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I edit the content of the PDF with this tool?</AccordionTrigger>
                <AccordionContent>
                    This tool is only for rotating pages. To edit content, please use our comprehensive <a href="/edit-pdf" className="text-primary underline">PDF Editor</a>.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function RotatePdfPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [rotatedPdfUri, setRotatedPdfUri] = useState<string | null>(null);

    const { toast } = useToast();
    
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }, []);

    const arrayBufferFromFile = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

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
    
    const renderPdfToImages = async (pdfFile: File) => {
        const images: PageToRender[] = [];
        const pdfData = await arrayBufferFromFile(pdfFile);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                images.push({ src: canvas.toDataURL('image/png'), pageNumber: i, rotation: 0 });
            }
        }
        return images;
    };

    const handlePdfUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        try {
            const renderedPages = await renderPdfToImages(file);
            if (renderedPages.length > 0) {
                setPages(renderedPages);
                setStage('rotate');
            } else {
                throw new Error("Failed to render PDF pages.");
            }
        } catch (error: any) {
            console.error("PDF Rendering failed", error);
            toast({ title: "Error processing PDF", description: error.message || "Could not convert PDF to images.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRotatePage = (pageNumber: number) => {
        setPages(prevPages =>
            prevPages.map(p => 
                p.pageNumber === pageNumber 
                ? { ...p, rotation: (p.rotation + 90) % 360 } 
                : p
            )
        );
    };

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleApplyRotation = async () => {
        if (!file) {
            toast({ title: "No file available", description: "Please upload a PDF first.", variant: "destructive" });
            return;
        }
        
        const rotations: Rotation[] = pages
            .filter(p => p.rotation !== 0)
            .map(p => ({
                pageIndex: p.pageNumber - 1, // 0-indexed for the flow
                angle: p.rotation
            }));
            
        // If no pages were rotated, just use the original file
        if (rotations.length === 0) {
            toast({ title: "No pages rotated", description: "You haven't rotated any pages." });
            const uri = await fileToDataUri(file);
            setRotatedPdfUri(uri);
            setStage('download');
            return;
        }

        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);
            const input: RotatePdfInput = { pdfUri, rotations };
            const result = await rotatePdf(input);
            if (result && result.rotatedPdfUri) {
                setRotatedPdfUri(result.rotatedPdfUri);
                setStage('download');
            } else {
                throw new Error("Failed to rotate the PDF.");
            }
        } catch (error: any) {
             toast({ title: "Rotation Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
    
     const handleDownload = () => {
        if (rotatedPdfUri && file) {
            const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
            const newFilename = `${originalFilename}-rotated.pdf`;
            
            const a = document.createElement('a');
            a.href = rotatedPdfUri;
            a.download = newFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };


    const handleReset = () => {
        setStage('upload');
        setFile(null);
        setPages([]);
        setRotatedPdfUri(null);
        setIsLoading(false);
    }
    
    const renderContent = () => {
        switch(stage) {
            case 'upload': return (
                <div className="text-center">
                    <Card 
                        className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                        <p className="mt-4 font-semibold text-primary">Drag & drop a PDF here, or click to select</p>
                        <Input id="file-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </Card>
                    {file && (
                        <div className="mt-6 flex flex-col items-center gap-4">
                            <p className="font-semibold">Selected: {file.name}</p>
                            <Button size="lg" onClick={handlePdfUpload} disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 animate-spin" />Processing...</> : "Preview Pages"}
                            </Button>
                        </div>
                    )}
                </div>
            )
            case 'rotate': return (
                <div>
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Rotate Pages</h2>
                        <p className="text-muted-foreground">Click the rotate button on any page to rotate it clockwise.</p>
                    </div>
                    <ScrollArea className="h-[60vh] w-full border rounded-md p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {pages.map(page => (
                            <div key={page.pageNumber} className="relative group">
                                <Card className="overflow-hidden">
                                    <div style={{ transform: `rotate(${page.rotation}deg)` }}>
                                      <Image src={page.src} alt={`Page ${page.pageNumber}`} width={200} height={280} className="w-full h-auto" />
                                    </div>
                                </Card>
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80" onClick={() => handleRotatePage(page.pageNumber)}>
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded-full text-xs font-bold">{page.pageNumber}</div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                     <div className="mt-6 flex justify-end">
                       <Button size="lg" onClick={handleApplyRotation} disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 animate-spin" />Applying...</> : <>Apply Changes & Download</>}
                        </Button>
                    </div>
                </div>
            )
            case 'download': return (
                <div className="text-center flex flex-col items-center gap-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold">PDF Rotated Successfully!</h2>
                    <p className="text-muted-foreground">Your rotated document is ready for download.</p>
                    <div className="flex gap-4 mt-4">
                        <Button size="lg" onClick={handleDownload}>
                            <FileDown className="mr-2" /> Download
                        </Button>
                        <Button size="lg" variant="outline" onClick={handleReset}>
                            <RefreshCw className="mr-2" /> Start Over
                        </Button>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
             <header className="text-center">
                <h1 className="text-4xl font-bold font-headline">Rotate PDF</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Rotate one or all pages in your PDF file.
                </p>
            </header>
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>
            <ToolDescription />
            <FAQ />
            <AllTools />
        </div>
    )
}

    