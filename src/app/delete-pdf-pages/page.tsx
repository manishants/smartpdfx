
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, FileDown, Loader2, RefreshCw, Trash2, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { deletePdfPages } from '@/lib/actions/delete-pdf-pages';
import type { DeletePdfPagesInput } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type Stage = 'upload' | 'select' | 'download';

interface PageToRender {
  src: string;
  pageNumber: number;
}

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Easily Delete PDF Pages</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Our PDF Page Deleter allows you to quickly and easily remove unwanted pages from your PDF documents. Whether you need to get rid of blank pages, irrelevant sections, or sensitive information, this tool provides a simple visual interface to get the job done.
                </p>
                <p>
                    Simply upload your PDF, and our tool will generate a preview of all its pages. Click on the pages you want to remove, and then click "Delete Pages" to create a new, clean PDF without the unwanted pages.
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
                <AccordionTrigger>How does this tool work?</AccordionTrigger>
                <AccordionContent>
                    The tool renders a preview of each page of your uploaded PDF. When you select pages and click "Delete Pages," our server takes your original file and the list of pages you want to keep, and builds a brand new PDF containing only those pages.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I delete multiple pages at once?</AccordionTrigger>
                <AccordionContent>
                    Yes, you can select as many pages as you like for deletion by clicking on them. The selected pages will be highlighted, and all of them will be removed from the final document.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Are my uploaded files secure?</AccordionTrigger>
                <AccordionContent>
                    Absolutely. Your files are uploaded over a secure connection, and we permanently delete them from our servers one hour after processing. We do not view, share, or store your documents.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Is there a file size limit?</AccordionTrigger>
                <AccordionContent>
                    While there is no strict limit, performance is best with reasonably sized PDFs (e.g., under 100MB). Very large files may take longer to process.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I recover a page I deleted by mistake?</AccordionTrigger>
                <AccordionContent>
                    Once you download the new PDF, the changes are final for that file. However, your original file remains untouched. If you make a mistake, you can simply start over by re-uploading the original document.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function DeletePdfPagesPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [modifiedPdfUri, setModifiedPdfUri] = useState<string | null>(null);

    const { toast } = useToast();
    
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.disableWorker = true;
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
                pagesToRender.push({ src: canvas.toDataURL('image/png'), pageNumber: i });
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
            : [...prev, pageNumber]
        );
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedPages(pages.map(p => p.pageNumber));
        } else {
            setSelectedPages([]);
        }
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
        if (!file || selectedPages.length === 0) {
            toast({ title: "No pages selected", description: "Please select at least one page to delete.", variant: "destructive" });
            return;
        }
        
        const pagesToKeep = pages.map(p => p.pageNumber - 1).filter(pIndex => !selectedPages.includes(pIndex + 1));
            
        if (pagesToKeep.length === 0) {
            toast({ title: "Cannot delete all pages", description: "You cannot delete all pages of the document." });
            return;
        }

        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);
            const input: DeletePdfPagesInput = { pdfUri, pagesToKeep };
            const result = await deletePdfPages(input);
            if (result && result.modifiedPdfUri) {
                setModifiedPdfUri(result.modifiedPdfUri);
                setStage('download');
            } else {
                throw new Error("Failed to delete pages from the PDF.");
            }
        } catch (error: any) {
             toast({ title: "Processing Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
    
     const handleDownload = () => {
        if (modifiedPdfUri && file) {
            const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
            const newFilename = `${originalFilename}-modified.pdf`;
            
            const a = document.createElement('a');
            a.href = modifiedPdfUri;
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
        setSelectedPages([]);
        setModifiedPdfUri(null);
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
                                {isLoading ? <><Loader2 className="mr-2 animate-spin" />Processing...</> : "Select Pages to Delete"}
                            </Button>
                        </div>
                    )}
                </div>
            )
            case 'select': return (
                <div>
                     <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                            <h2 className="text-xl font-semibold">Select Pages to Delete</h2>
                            <p className="text-muted-foreground">Click on pages to select them for removal.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Checkbox 
                             id="select-all" 
                             checked={selectedPages.length > 0 && selectedPages.length === pages.length}
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
                         <p className="text-sm text-muted-foreground">{selectedPages.length} page(s) selected for deletion.</p>
                       <Button size="lg" onClick={handleApplyChanges} disabled={isLoading || selectedPages.length === 0}>
                            {isLoading ? <><Loader2 className="mr-2 animate-spin" />Deleting...</> : <><Trash2 className="mr-2"/>Delete Pages</>}
                        </Button>
                    </div>
                </div>
            )
            case 'download': return (
                <div className="text-center flex flex-col items-center gap-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold">Pages Deleted Successfully!</h2>
                    <p className="text-muted-foreground">Your modified document is ready for download.</p>
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
                <h1 className="text-4xl font-bold font-headline">Delete PDF Pages</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Select and remove one or more pages from your PDF file.
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

    
