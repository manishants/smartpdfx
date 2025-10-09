
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, AppWindow, Trash2, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { organizePdf } from '@/lib/actions/organize-pdf';
import type { OrganizePdfInput, OrganizePdfOutput } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Stage = 'upload' | 'organize' | 'download';

interface PageToRender {
  src: string;
  originalPageNumber: number;
}


const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Visually Organize Your PDF</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Take full control of your PDF's structure with our intuitive page organizer. This tool allows you to visually reorder pages, delete unwanted ones, and create a perfectly structured document. It's ideal for arranging reports, presentations, or any multi-page PDF.
                </p>
                <p>
                    <strong>How to Use:</strong> Upload your PDF to see a thumbnail view of all its pages. Drag and drop the pages to change their order. Click the trash icon to remove any page. Once you're happy with the new arrangement, click "Apply Changes" to generate your newly organized PDF.
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
                <AccordionTrigger>How do I reorder pages?</AccordionTrigger>
                <AccordionContent>
                    Simply click and hold a page thumbnail, then drag it to your desired position in the sequence. The other pages will automatically adjust to make room.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I rotate pages with this tool?</AccordionTrigger>
                <AccordionContent>
                    This tool is specifically for reordering and deleting pages. For rotation, please use our dedicated <a href="/rotate-pdf" className="text-primary underline">Rotate PDF tool</a>.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>What happens to my original file?</AccordionTrigger>
                <AccordionContent>
                    Your original file is never modified. Our tool uses your file to create a brand new PDF based on the changes you make. Your original document remains safe on your device.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Are my files secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. All files are uploaded over a secure connection and are permanently deleted from our servers one hour after processing. We respect your privacy.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I add pages from another PDF?</AccordionTrigger>
                <AccordionContent>
                    This tool organizes a single PDF. To combine pages from multiple documents, first use our <a href="/merge-pdf" className="text-primary underline">Merge PDF tool</a>, and then use this organizer to arrange the pages of the merged file.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function OrganizePdfPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [organizedPdfUri, setOrganizedPdfUri] = useState<string | null>(null);

    const { toast } = useToast();
    
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${'${pdfjsLib.version}'}/pdf.worker.min.mjs`;
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
        const pagesToRender: PageToRender[] = [];
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
                pagesToRender.push({ src: canvas.toDataURL('image/png'), originalPageNumber: i });
            }
        }
        return pagesToRender;
    };

    const handlePdfUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        try {
            const renderedPages = await renderPdfToImages(file);
            if (renderedPages.length > 0) {
                setPages(renderedPages);
                setStage('organize');
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
    
    const handleDeletePage = (indexToDelete: number) => {
        setPages(prevPages => prevPages.filter((_, index) => index !== indexToDelete));
    };

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleApplyChanges = async () => {
        if (!file) {
            toast({ title: "No file available", description: "Please upload a PDF first.", variant: "destructive" });
            return;
        }
        
        const pageOrder = pages.map(p => p.originalPageNumber - 1); // convert to 0-based index
            
        if (pageOrder.length === 0) {
            toast({ title: "No pages left", description: "You have deleted all the pages." });
            return;
        }

        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);
            const input: OrganizePdfInput = { pdfUri, pageOrder };
            const result = await organizePdf(input);
            if (result && result.organizedPdfUri) {
                setOrganizedPdfUri(result.organizedPdfUri);
                setStage('download');
            } else {
                throw new Error("Failed to organize the PDF.");
            }
        } catch (error: any) {
             toast({ title: "Organizing Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
    
     const handleDownload = () => {
        if (organizedPdfUri && file) {
            const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
            const newFilename = `${'${originalFilename}'}-organized.pdf`;
            
            const a = document.createElement('a');
            a.href = organizedPdfUri;
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
        setOrganizedPdfUri(null);
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
                                {isLoading ? <><Loader2 className="mr-2 animate-spin" />Processing...</> : "Organize Pages"}
                            </Button>
                        </div>
                    )}
                </div>
            )
            case 'organize': return (
                <div>
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Organize Pages</h2>
                        <p className="text-muted-foreground">Drag and drop pages to reorder. Click the trash icon to delete.</p>
                    </div>
                    <ScrollArea className="h-[60vh] w-full border rounded-md p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {pages.map((page, index) => (
                            <div key={page.originalPageNumber} className="relative group">
                                <Card className="overflow-hidden">
                                    <Image src={page.src} alt={`Page ${'${page.originalPageNumber}'}`} width={200} height={280} className="w-full h-auto" />
                                </Card>
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeletePage(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded-full text-xs font-bold">{index + 1}</div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                     <div className="mt-6 flex justify-end">
                       <Button size="lg" onClick={handleApplyChanges} disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 animate-spin" />Applying...</> : <>Apply Changes & Download</>}
                        </Button>
                    </div>
                </div>
            )
            case 'download': return (
                <div className="text-center flex flex-col items-center gap-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold">PDF Organized Successfully!</h2>
                    <p className="text-muted-foreground">Your new document is ready for download.</p>
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
                <h1 className="text-4xl font-bold font-headline">Organize PDF</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Easily reorder and delete pages in your PDF file.
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
            <AllTools/>
        </div>
    )
}

    