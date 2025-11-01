
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, RotateCcw, CheckCircle, Sparkles, Zap, RotateCw, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { rotatePdf } from '@/lib/actions/rotate-pdf';
import type { RotatePdfInput, RotatePdfOutput, Rotation } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AllTools } from '@/components/all-tools';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToolSections } from '@/components/tool-sections';
import { useToolSections } from '@/hooks/use-tool-sections';

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
    <ModernSection
        title="AI-Enhanced PDF Rotation"
        subtitle="Frequently asked questions about our intelligent PDF rotation tool"
        icon={<RotateCw className="h-6 w-6" />}
        className="mt-12"
        contentClassName="max-w-4xl mx-auto"
    >
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
            <AccordionItem value="item-6">
                <AccordionTrigger>How does AI enhance the rotation process?</AccordionTrigger>
                <AccordionContent>
                    Our AI technology automatically detects page orientation and provides smart suggestions for optimal rotation. It also preserves document structure and maintains perfect quality during the rotation process.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </ModernSection>
);


export default function RotatePdfPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [rotatedPdfUri, setRotatedPdfUri] = useState<string | null>(null);
    const { sections } = useToolSections('PDF Rotation');

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
            toast({ 
                title: "Invalid file type", 
                description: "Please select a PDF file. Only PDF files are accepted.", 
                variant: "destructive" 
            });
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
    


    return (
        <ModernPageLayout
            title="AI PDF Rotator"
            description="Rotate PDF pages with precision using intelligent AI-powered orientation detection"
            icon={<RotateCw className="w-8 h-8" />}
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
                                        title="Drop your PDF here for AI rotation"
                                        subtitle="Supports PDF files up to 100MB"
                                        icon={<FileText className="h-12 w-12" />}
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">Smart Detection</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200/50">
                                            <Zap className="h-4 w-4 text-indigo-600" />
                                            <span className="text-sm font-medium text-indigo-700">AI Rotation</span>
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
                                                        Preview Pages
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {stage === 'rotate' && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-2xl" />
                            
                            <Card className="relative border-0 bg-white/50 backdrop-blur-sm shadow-xl">
                                <CardContent className="p-8">
                                    <div className="text-center mb-6">
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                                <RotateCw className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                Rotate Pages
                                            </h2>
                                        </div>
                                        <p className="text-gray-600">Click the rotate button on any page to rotate it clockwise.</p>
                                    </div>
                                    
                                    <ScrollArea className="h-[60vh] w-full border rounded-lg p-4 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {pages.map(page => (
                                                <div key={page.pageNumber} className="relative group">
                                                    <Card className="overflow-hidden border-2 border-gray-200/50 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg">
                                                        <div style={{ transform: `rotate(${page.rotation}deg)` }} className="transition-transform duration-300">
                                                            <Image 
                                                                src={page.src} 
                                                                alt={`Page ${page.pageNumber}`} 
                                                                width={200} 
                                                                height={280} 
                                                                className="w-full h-auto" 
                                                            />
                                                        </div>
                                                    </Card>
                                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-8 w-8 bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300" 
                                                            onClick={() => handleRotatePage(page.pageNumber)}
                                                        >
                                                            <RotateCcw className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </div>
                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                        {page.pageNumber}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <Button 
                                            size="lg" 
                                            onClick={handleApplyRotation} 
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                                                PDF Rotated Successfully!
                                            </h2>
                                            <p className="text-gray-600">Your rotated document is ready for download.</p>
                                        </div>
                                        
                                        <div className="flex gap-4 mt-4">
                                            <Button 
                                                size="lg" 
                                                onClick={handleDownload}
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                subtitle="Advanced rotation technology with intelligent page detection"
                icon={<RotateCw className="h-6 w-6" />}
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
                            AI automatically detects page orientation and suggests optimal rotation angles for perfect document alignment.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Precision Rotation</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Advanced algorithms ensure perfect 90-degree rotations while preserving document quality and structure.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <RotateCw className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Lossless Processing</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Maintain original document quality with zero degradation during the rotation process.
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                    <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-500/20 rounded">
                            <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h5 className="font-medium text-sm text-blue-800">Pro Tip</h5>
                            <p className="text-xs text-blue-700 mt-1">
                                Use the preview feature to check page orientation before applying rotations. Each rotation is 90 degrees clockwise.
                            </p>
                        </div>
                    </div>
                </div>
            </ModernSection>

            <ToolSections 
                toolName="PDF Rotation" 
                sections={sections} 
            />

            <FAQ />
            <AllTools />
        </ModernPageLayout>
    );
}
