
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, AppWindow, Trash2, CheckCircle, Move, Sparkles, Zap, FileText, ArrowUpDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { organizePdf } from '@/lib/actions/organize-pdf';
import type { OrganizePdfInput, OrganizePdfOutput } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';

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
    <ModernSection
        title="AI-Enhanced PDF Organization"
        subtitle="Frequently asked questions about our intelligent page organizer"
        icon={<ArrowUpDown className="h-6 w-6" />}
        className="mt-12"
    >
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How do I reorder pages?</AccordionTrigger>
                <AccordionContent>
                    Simply click and hold a page thumbnail, then drag it to your desired position in the sequence. The other pages will automatically adjust to make room. Our AI-enhanced interface provides smooth drag-and-drop functionality.
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
            <AccordionItem value="item-6">
                <AccordionTrigger>How does AI enhance the organization process?</AccordionTrigger>
                <AccordionContent>
                    Our AI-powered interface provides intelligent page detection, smooth drag-and-drop interactions, and optimized processing for faster organization. The system automatically maintains document quality while reorganizing your pages.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </ModernSection>
);


export default function OrganizePdfPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [organizedPdfUri, setOrganizedPdfUri] = useState<string | null>(null);
    
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const { toast } = useToast();
    
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }, []);

    const arrayBufferFromFile = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    const handleFileChange = (file: File) => {
        if (file.type === 'application/pdf') {
            setFile(file);
        } else {
            toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
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
            const newFilename = `${originalFilename}-organized.pdf`;
            
            const a = document.createElement('a');
            a.href = organizedPdfUri;
            a.download = newFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newPages = [...pages];
        const dragItemContent = newPages.splice(dragItem.current, 1)[0];
        newPages.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setPages(newPages);
    };

    const handleReset = () => {
        setStage('upload');
        setFile(null);
        setPages([]);
        setOrganizedPdfUri(null);
        setIsLoading(false);
    }
    


    return (
        <ModernPageLayout
            title="AI PDF Organizer"
            description="Intelligently reorder and organize PDF pages with advanced drag-and-drop functionality"
            icon={<ArrowUpDown className="w-8 h-8" />}
            backgroundVariant="home"
        >
            <ModernSection>
                <div className="max-w-6xl mx-auto space-y-8">
                    {stage === 'upload' && (
                        <div className="relative">
                            {/* AI Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-2xl" />
                            <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl" />
                            
                            <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                            <UploadCloud className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            Upload PDF Document
                                        </h3>
                                    </div>
                                    
                                    <ModernUploadArea
                                        onFileSelect={handleFileChange}
                                        accept="application/pdf"
                                        maxSize={100 * 1024 * 1024} // 100MB
                                        title="Drop your PDF here for AI organization"
                                        subtitle="Supports PDF files up to 100MB"
                                        icon={<FileText className="h-12 w-12" />}
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">Smart Detection</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200/50">
                                            <ArrowUpDown className="h-4 w-4 text-indigo-600" />
                                            <span className="text-sm font-medium text-indigo-700">AI Organization</span>
                                        </div>
                                    </div>
                                    
                                    {file && (
                                        <div className="mt-6 flex flex-col items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="font-semibold text-gray-800">{file.name}</p>
                                            </div>
                                            <Button 
                                                size="lg" 
                                                onClick={handlePdfUpload} 
                                                disabled={isLoading}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-2 h-5 w-5" />
                                                        Organize Pages
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {stage === 'organize' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-2xl" />
                            
                            <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                                <CardContent className="p-8">
                                    <div className="text-center mb-6">
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                                <ArrowUpDown className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                Organize Pages
                                            </h2>
                                        </div>
                                        <p className="text-gray-600">Drag and drop pages to reorder. Click the trash icon to delete.</p>
                                    </div>
                                    
                                    <ScrollArea className="h-[60vh] w-full border rounded-lg p-4 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {pages.map((page, index) => (
                                                <div 
                                                    key={`${page.originalPageNumber}-${index}`}
                                                    className={cn("relative group cursor-grab hover:cursor-grabbing transition-all duration-200", 
                                                        dragItem.current === index && "opacity-50 scale-95")}
                                                    draggable
                                                    onDragStart={() => (dragItem.current = index)}
                                                    onDragEnter={() => (dragOverItem.current = index)}
                                                    onDragEnd={handleDrop}
                                                    onDragOver={(e) => e.preventDefault()}
                                                >
                                                    <Card className="overflow-hidden border-2 border-gray-200/50 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg">
                                                        <Image 
                                                            src={page.src} 
                                                            alt={`Page ${page.originalPageNumber}`} 
                                                            width={200} 
                                                            height={280} 
                                                            className="w-full h-auto pointer-events-none" 
                                                        />
                                                    </Card>
                                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="destructive" 
                                                            size="icon" 
                                                            className="h-8 w-8 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm" 
                                                            onClick={() => handleDeletePage(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="p-1 bg-white/90 backdrop-blur-sm rounded border border-blue-200">
                                                            <Move className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <Button 
                                            size="lg" 
                                            onClick={handleApplyChanges} 
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Applying...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="mr-2 h-5 w-5" />
                                                    Apply Changes & Download
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {stage === 'download' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30 rounded-2xl" />
                            
                            <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                                <CardContent className="p-8">
                                    <div className="text-center flex flex-col items-center gap-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-20 animate-pulse" />
                                            <div className="relative p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                                                <CheckCircle className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                PDF Organized Successfully!
                                            </h2>
                                            <p className="text-gray-600">Your new document is ready for download.</p>
                                        </div>
                                        
                                        <div className="flex gap-4 mt-4">
                                            <Button 
                                                size="lg" 
                                                onClick={handleDownload}
                                                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                <FileDown className="mr-2 h-5 w-5" />
                                                Download
                                            </Button>
                                            <Button 
                                                size="lg" 
                                                variant="outline" 
                                                onClick={handleReset}
                                                className="border-gray-300 hover:bg-gray-50"
                                            >
                                                <RefreshCw className="mr-2 h-5 w-5" />
                                                Start Over
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </ModernSection>

            <ModernSection
                title="AI-Enhanced PDF Processing"
                subtitle="Advanced organization technology with intelligent page management"
                icon={<ArrowUpDown className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Smart Detection</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            AI automatically analyzes your PDF structure and provides intelligent suggestions for optimal page organization.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <ArrowUpDown className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Drag & Drop Interface</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Intuitive drag-and-drop functionality with smooth animations and real-time visual feedback for effortless page reordering.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Lossless Processing</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Maintain original document quality with zero degradation during the organization process.
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                    <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-500/20 rounded">
                            <ArrowUpDown className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-sm text-blue-800">Pro Tip</h5>
                            <p className="text-xs text-blue-700 mt-1">
                                Use the drag handles to reorder pages and the trash icon to delete unwanted pages. Changes are applied instantly with our AI-powered processing.
                            </p>
                        </div>
                    </div>
                </div>
            </ModernSection>

            <FAQ />
            <ToolCustomSectionRenderer slug="organize-pdf" />
            <AllTools />
        </ModernPageLayout>
    );
}
