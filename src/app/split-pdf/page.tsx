
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, FileDown, Loader2, RefreshCw, Scissors, FileArchive } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { splitPdf } from '@/lib/actions/split-pdf';
import type { SplitPdfInput, SplitPdfOutput, PageRange } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AllTools } from '@/components/all-tools';

type Stage = 'upload' | 'select' | 'download';

interface PageToRender {
  src: string;
  pageNumber: number;
}

const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Why would I need to split a PDF?</AccordionTrigger>
                <AccordionContent>
                    Splitting a PDF is useful for several reasons. You might want to extract specific pages to send to someone, separate chapters of a large book or report into individual files, or reduce the file size of a document by breaking it into smaller parts.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>How are the selected pages split?</AccordionTrigger>
                <AccordionContent>
                    When you select pages, our tool groups consecutive pages into a single new PDF. For example, if you select pages 1, 2, 4, 5, and 7, the tool will create three separate PDF files: one with pages 1-2, one with pages 4-5, and one with just page 7.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is it safe to upload my confidential documents?</AccordionTrigger>
                <AccordionContent>
                    Yes, your privacy is our priority. Your files are uploaded over a secure connection, processed automatically, and then permanently deleted from our servers one hour later. We never view, share, or store your documents.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function SplitPdfPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [splitResult, setSplitResult] = useState<SplitPdfOutput | null>(null);

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
                images.push({ src: canvas.toDataURL('image/png'), pageNumber: i });
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
                setStage('select');
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
    
    const handlePageSelect = (pageNumber: number) => {
        setSelectedPages(prev => 
            prev.includes(pageNumber) 
            ? prev.filter(p => p !== pageNumber)
            : [...prev, pageNumber].sort((a,b) => a - b)
        );
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedPages(pages.map(p => p.pageNumber));
        } else {
            setSelectedPages([]);
        }
    }

    const pageRanges = useMemo((): PageRange[] => {
        if (selectedPages.length === 0) return [];
        const ranges: PageRange[] = [];
        let start = selectedPages[0];
        let end = selectedPages[0];

        for (let i = 1; i < selectedPages.length; i++) {
            if (selectedPages[i] === end + 1) {
                end = selectedPages[i];
            } else {
                ranges.push({ from: start, to: end });
                start = selectedPages[i];
                end = selectedPages[i];
            }
        }
        ranges.push({ from: start, to: end });
        return ranges;
    }, [selectedPages]);
    
    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSplit = async () => {
        if (!file || pageRanges.length === 0) {
            toast({ title: "No pages selected", description: "Please select at least one page to split.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);
            const input: SplitPdfInput = { pdfUri, ranges: pageRanges };
            const result = await splitPdf(input);
            if (result && result.splitPdfs) {
                setSplitResult(result);
                setStage('download');
            } else {
                throw new Error("Failed to split the PDF.");
            }
        } catch (error: any) {
             toast({ title: "Splitting Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleReset = () => {
        setStage('upload');
        setFile(null);
        setPages([]);
        setSelectedPages([]);
        setSplitResult(null);
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
                                {isLoading ? <><Loader2 className="mr-2 animate-spin" />Processing...</> : "Select Pages"}
                            </Button>
                        </div>
                    )}
                </div>
            )
            case 'select': return (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                            <h2 className="text-xl font-semibold">Select Pages to Split</h2>
                            <p className="text-muted-foreground">Select one or more pages to create new PDF files.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="select-all" 
                             checked={selectedPages.length === pages.length}
                             onCheckedChange={handleSelectAll}
                           />
                           <Label htmlFor="select-all">Select All</Label>
                        </div>
                    </div>
                    <ScrollArea className="h-[60vh] w-full border rounded-md p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {pages.map(page => (
                            <div key={page.pageNumber} className="relative group cursor-pointer" onClick={() => handlePageSelect(page.pageNumber)}>
                                <Card className="overflow-hidden">
                                  <Image src={page.src} alt={`Page ${page.pageNumber}`} width={200} height={280} className="w-full h-auto" />
                                </Card>
                                <div className="absolute top-2 right-2">
                                  <Checkbox checked={selectedPages.includes(page.pageNumber)} id={`page-${page.pageNumber}`} />
                                </div>
                                <Label htmlFor={`page-${page.pageNumber}`} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded-full text-xs font-bold">{page.pageNumber}</Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                     <div className="mt-6 flex justify-between items-center">
                         <p className="text-sm text-muted-foreground">{selectedPages.length} page(s) selected.</p>
                       <Button size="lg" onClick={handleSplit} disabled={isLoading || selectedPages.length === 0}>
                            {isLoading ? <><Loader2 className="mr-2 animate-spin" />Splitting...</> : <><Scissors className="mr-2"/>Split PDF</>}
                        </Button>
                    </div>
                </div>
            )
            case 'download': return (
                <div className="text-center flex flex-col items-center gap-4">
                    <Scissors className="h-16 w-16 text-green-500 bg-green-500/10 p-2 rounded-full" />
                    <h2 className="text-2xl font-bold">PDF Split Successfully!</h2>
                    <p className="text-muted-foreground">Your new documents are ready for download.</p>
                    <Card className="w-full max-w-md mt-4">
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                            <ul className="space-y-2">
                                {splitResult?.splitPdfs.map(pdf => (
                                    <li key={pdf.filename} className="flex justify-between items-center bg-muted p-2 rounded-md">
                                        <span className="font-mono text-sm">{pdf.filename}</span>
                                        <Button size="sm" asChild>
                                            <a href={pdf.pdfUri} download={pdf.filename}><FileDown className="mr-2 h-4 w-4"/>Download</a>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <div className="flex gap-4 mt-4">
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
                <h1 className="text-4xl font-bold font-headline">Split PDF</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Extract pages from your PDF into separate files.
                </p>
            </header>
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>
            <div className="mt-12">
              <FAQ />
            </div>
            <AllTools />
        </div>
    )
}
