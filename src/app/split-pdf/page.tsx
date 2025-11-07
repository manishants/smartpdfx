
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, FileDown, Loader2, RefreshCw, Scissors, FileArchive, Sparkles, Zap, FileText, Split, Plus, Trash } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { splitPdf } from '@/lib/actions/split-pdf';
import type { SplitPdfInput, SplitPdfOutput, PageRange } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AllTools } from '@/components/all-tools';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
// ToolSections and useToolSections removed as part of home-only sections architecture
import { AIPoweredFeatures } from "@/components/ai-powered-features";
import { ProTip } from "@/components/pro-tip";

type Stage = 'upload' | 'select' | 'download';
type RangeMode = 'select' | 'custom' | 'fixed';

interface PageToRender {
  src: string;
  pageNumber: number;
}

const FAQ = () => (
  <ModernSection
    title="AI-Powered PDF Splitting"
    subtitle="Frequently Asked Questions"
    icon={<Split className="h-6 w-6" />}
    className="mt-12"
    contentClassName="w-full"
  >
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
          When you select pages, our AI-powered tool intelligently groups consecutive pages into a single new PDF. For example, if you select pages 1, 2, 4, 5, and 7, the tool will create three separate PDF files: one with pages 1-2, one with pages 4-5, and one with just page 7.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it safe to upload my confidential documents?</AccordionTrigger>
        <AccordionContent>
          Yes, your privacy is our priority. Your files are uploaded over a secure connection, processed automatically with AI-enhanced security, and then permanently deleted from our servers one hour later. We never view, share, or store your documents.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>How does AI enhance the splitting process?</AccordionTrigger>
        <AccordionContent>
          Our AI algorithms analyze document structure to optimize page grouping, preserve formatting and metadata, ensure clean splits at natural boundaries, and maintain the highest quality output while processing files efficiently.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function SplitPdfPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [splitResult, setSplitResult] = useState<SplitPdfOutput | null>(null);
    const [mode, setMode] = useState<RangeMode>('select');
    const [customRanges, setCustomRanges] = useState<PageRange[]>([{ from: 1, to: 1 }]);
    const [fixedSize, setFixedSize] = useState<number>(1);

    const { toast } = useToast();
    
    useEffect(() => {
        (pdfjsLib.GlobalWorkerOptions as any).workerSrc =
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
                description: "Only PDF files are accepted. Please select a PDF file.", 
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

    const sanitizedCustomRanges = useMemo((): PageRange[] => {
        if (pages.length === 0) return [];
        return customRanges
            .map(r => {
                const from = Math.max(1, Math.min(pages.length, Math.floor(r.from || 1)));
                const toRaw = Math.max(1, Math.min(pages.length, Math.floor(r.to || r.from || 1)));
                const to = Math.max(from, toRaw);
                return { from, to };
            })
            .filter(r => r.from <= r.to);
    }, [customRanges, pages.length]);

    const fixedRanges = useMemo((): PageRange[] => {
        if (pages.length === 0 || fixedSize < 1) return [];
        const size = Math.max(1, Math.min(pages.length, Math.floor(fixedSize)));
        const ranges: PageRange[] = [];
        let start = 1;
        while (start <= pages.length) {
            const end = Math.min(start + size - 1, pages.length);
            ranges.push({ from: start, to: end });
            start = end + 1;
        }
        return ranges;
    }, [pages.length, fixedSize]);

    const computedRanges = useMemo((): PageRange[] => {
        switch (mode) {
            case 'custom':
                return sanitizedCustomRanges;
            case 'fixed':
                return fixedRanges;
            case 'select':
            default:
                return pageRanges;
        }
    }, [mode, sanitizedCustomRanges, fixedRanges, pageRanges]);
    
    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSplit = async () => {
        if (!file || computedRanges.length === 0) {
            toast({ title: "No pages selected", description: "Please select at least one page to split.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);
            const input: SplitPdfInput = { pdfUri, ranges: computedRanges };
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
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="application/pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileChange(f);
                          }}
                        />
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
                        <div className="flex items-center gap-2">
                            <Label className="font-medium">Range mode:</Label>
                            <div className="flex items-center gap-2">
                                <Button variant={mode==='select' ? 'default' : 'outline'} size="sm" onClick={() => setMode('select')}>Pages</Button>
                                <Button variant={mode==='custom' ? 'default' : 'outline'} size="sm" onClick={() => setMode('custom')}>Custom ranges</Button>
                                <Button variant={mode==='fixed' ? 'default' : 'outline'} size="sm" onClick={() => setMode('fixed')}>Fixed ranges</Button>
                            </div>
                        </div>
                    </div>
                    {mode === 'select' && (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        id="select-all" 
                                        checked={selectedPages.length === pages.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor="select-all">Select All</Label>
                                </div>
                                <p className="text-sm text-muted-foreground">{selectedPages.length} page(s) selected.</p>
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
                        </>
                    )}

                    {mode === 'custom' && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-md bg-muted/50">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-medium">Custom ranges</p>
                                        <p className="text-xs text-muted-foreground">Enter one or more page ranges. Pages: 1–{pages.length}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setCustomRanges(prev => [...prev, { from: 1, to: 1 }])}>
                                        <Plus className="mr-2 h-4 w-4" /> Add range
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {customRanges.map((range, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Label className="text-sm">Range {idx + 1}</Label>
                                            <Input 
                                                type="number" min={1} max={pages.length}
                                                value={range.from}
                                                onChange={(e) => {
                                                    const v = Number(e.target.value);
                                                    setCustomRanges(prev => prev.map((r, i) => i === idx ? { ...r, from: v } : r));
                                                }}
                                                className="w-24"
                                            />
                                            <span>-</span>
                                            <Input 
                                                type="number" min={1} max={pages.length}
                                                value={range.to}
                                                onChange={(e) => {
                                                    const v = Number(e.target.value);
                                                    setCustomRanges(prev => prev.map((r, i) => i === idx ? { ...r, to: v } : r));
                                                }}
                                                className="w-24"
                                            />
                                            <Button variant="ghost" size="icon" aria-label="Remove range" onClick={() => setCustomRanges(prev => prev.filter((_, i) => i !== idx))}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{sanitizedCustomRanges.length} PDF file(s) will be created.</p>
                    </div>
                    )}

                    {mode === 'fixed' && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-md bg-muted/50 flex items-center gap-3">
                                <div className="flex-1">
                                    <p className="font-medium">Fixed ranges</p>
                                    <p className="text-xs text-muted-foreground">Split into files of N pages each.</p>
                                </div>
                                <Label className="text-sm">Pages per file</Label>
                                <Input type="number" className="w-24" min={1} max={pages.length} value={fixedSize} onChange={(e) => setFixedSize(Number(e.target.value))} />
                            </div>
                            <p className="text-sm text-muted-foreground">{fixedRanges.length} PDF file(s) will be created.</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end items-center">
                       <Button size="lg" onClick={handleSplit} disabled={isLoading || computedRanges.length === 0} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
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
        <ModernPageLayout
            title="AI-Powered PDF Splitter"
            description="Intelligently extract and split PDF pages with advanced AI optimization for perfect results."
            icon={<Split className="h-8 w-8" />}
            badge="AI Enhanced"
            gradient="from-orange-600 via-red-600 to-pink-500"
            backgroundVariant="home"
        >
            {stage === 'upload' && (
                <ModernSection
                    title="Smart PDF Splitting"
                    subtitle="Upload your PDF and let our AI analyze it for optimal page extraction"
                    icon={<Sparkles className="h-6 w-6" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Upload Area */}
                        <div className="lg:col-span-2">
                            <ModernUploadArea
                                onFileSelect={handleFileChange}
                                accept="application/pdf"
                                isLoading={isLoading}
                                icon={<FileText className="h-12 w-12" />}
                                title="Drop PDF file here"
                                subtitle="or click to select a PDF file"
                                className="mb-8"
                            />

                            {file && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-center p-4 bg-gradient-to-r from-background to-muted/50 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-6 w-6 text-primary" />
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <Button 
                                            size="lg" 
                                            onClick={handlePdfUpload} 
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-500 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    AI is analyzing your PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="mr-2 h-5 w-5" />
                                                    Analyze & Select Pages
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* AI Features Component - Right Side */}
                        <div className="lg:col-span-1">
                            <AIPoweredFeatures 
                                features={[
                                    "Smart page analysis",
                                    "Intelligent grouping", 
                                    "Batch processing",
                                    "Quality preservation"
                                ]}
                            />
                        </div>
                    </div>

                    {!file && (
                        <div className="text-center py-8">
                            <div className="space-y-4">
                                <div className="flex justify-center space-x-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Smart Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                                        <Split className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Precise Splitting</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground">
                                    Upload a PDF to start the intelligent splitting process
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Pro Tip Component - Below Upload */}
                    <div className="mt-8">
                        <ProTip 
                            tip="Our AI analyzes your PDF structure to suggest optimal page groupings. For best results, upload PDFs with clear page breaks and consistent formatting."
                        />
                    </div>
                </ModernSection>
            )}

            {stage === 'select' && (
                <ModernSection
                    title="Select Pages to Extract"
                    subtitle="Choose the pages you want to split into separate PDF files"
                    icon={<Scissors className="h-6 w-6" />}
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">PDF Analysis Complete</p>
                                    <p className="text-sm text-muted-foreground">
                                        {pages.length} pages detected • {selectedPages.length} selected
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="select-all" 
                                    checked={selectedPages.length === pages.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label htmlFor="select-all" className="font-medium">Select All</Label>
                            </div>
                        </div>

                        {/* Range mode selector */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label className="font-medium">Range mode:</Label>
                                <div className="flex items-center gap-2">
                                    <Button variant={mode==='select' ? 'default' : 'outline'} size="sm" onClick={() => setMode('select')}>Pages</Button>
                                    <Button variant={mode==='custom' ? 'default' : 'outline'} size="sm" onClick={() => setMode('custom')}>Custom ranges</Button>
                                    <Button variant={mode==='fixed' ? 'default' : 'outline'} size="sm" onClick={() => setMode('fixed')}>Fixed ranges</Button>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {computedRanges.length > 0 ? `${computedRanges.length} file${computedRanges.length !== 1 ? 's' : ''} will be created.` : 'No ranges selected.'}
                            </div>
                        </div>

                        {mode === 'select' && (
                            <ScrollArea className="h-[60vh] w-full border rounded-lg p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {pages.map(page => (
                                        <div 
                                            key={page.pageNumber} 
                                            className="relative group cursor-pointer transition-all duration-200 hover:scale-105" 
                                            onClick={() => handlePageSelect(page.pageNumber)}
                                        >
                                            <Card className={`overflow-hidden transition-all duration-200 ${
                                                selectedPages.includes(page.pageNumber) 
                                                    ? 'ring-2 ring-primary shadow-lg' 
                                                    : 'hover:shadow-md'
                                            }`}>
                                                <Image 
                                                    src={page.src} 
                                                    alt={`Page ${page.pageNumber}`} 
                                                    width={200} 
                                                    height={280} 
                                                    className="w-full h-auto" 
                                                />
                                            </Card>
                                            <div className="absolute top-2 right-2">
                                                <Checkbox 
                                                    checked={selectedPages.includes(page.pageNumber)} 
                                                    id={`page-${page.pageNumber}`}
                                                    className="bg-background/80 backdrop-blur-sm"
                                                />
                                            </div>
                                            <Label 
                                                htmlFor={`page-${page.pageNumber}`} 
                                                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border"
                                            >
                                                Page {page.pageNumber}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="vertical" />
                            </ScrollArea>
                        )}

                        {mode === 'custom' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-medium">Custom ranges</p>
                                            <p className="text-xs text-muted-foreground">Enter one or more page ranges. Pages: 1–{pages.length}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setCustomRanges(prev => [...prev, { from: 1, to: 1 }])}>
                                            <Plus className="mr-2 h-4 w-4" /> Add range
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {customRanges.map((range, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Label className="text-sm">Range {idx + 1}</Label>
                                                <Input 
                                                    type="number" min={1} max={pages.length}
                                                    value={range.from}
                                                    onChange={(e) => {
                                                        const v = Number(e.target.value);
                                                        setCustomRanges(prev => prev.map((r, i) => i === idx ? { ...r, from: v } : r));
                                                    }}
                                                    className="w-24"
                                                />
                                                <span>-</span>
                                                <Input 
                                                    type="number" min={1} max={pages.length}
                                                    value={range.to}
                                                    onChange={(e) => {
                                                        const v = Number(e.target.value);
                                                        setCustomRanges(prev => prev.map((r, i) => i === idx ? { ...r, to: v } : r));
                                                    }}
                                                    className="w-24"
                                                />
                                                <Button variant="ghost" size="icon" aria-label="Remove range" onClick={() => setCustomRanges(prev => prev.filter((_, i) => i !== idx))}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{sanitizedCustomRanges.length} PDF file{sanitizedCustomRanges.length !== 1 ? 's' : ''} will be created.</p>
                            </div>
                        )}

                        {mode === 'fixed' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg bg-muted/50 flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="font-medium">Fixed ranges</p>
                                        <p className="text-xs text-muted-foreground">Split into files of N pages each.</p>
                                    </div>
                                    <Label className="text-sm">Pages per file</Label>
                                    <Input type="number" className="w-24" min={1} max={pages.length} value={fixedSize} onChange={(e) => setFixedSize(Number(e.target.value))} />
                                </div>
                                <p className="text-sm text-muted-foreground">{fixedRanges.length} PDF file{fixedRanges.length !== 1 ? 's' : ''} will be created.</p>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <Button 
                                size="lg" 
                                onClick={handleSplit} 
                                disabled={isLoading || computedRanges.length === 0}
                                className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-500 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        AI is splitting your PDF...
                                    </>
                                ) : (
                                    <>
                                        <Scissors className="mr-2 h-5 w-5" />
                                        {mode === 'select' 
                                            ? `Split ${selectedPages.length} Page${selectedPages.length !== 1 ? 's' : ''} with AI`
                                            : `Split ${computedRanges.length} File${computedRanges.length !== 1 ? 's' : ''} with AI`}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </ModernSection>
            )}

            {stage === 'download' && (
                <ModernSection
                    title="Split Complete!"
                    subtitle="Your PDF has been successfully split with AI optimization"
                    icon={<Sparkles className="h-6 w-6" />}
                    className="text-center"
                >
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                                <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-500 p-4 rounded-full">
                                    <Scissors className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-500 bg-clip-text text-transparent">
                                Perfect Split Achieved!
                            </h3>
                            <p className="text-muted-foreground">
                                Your PDF pages have been extracted with AI-enhanced precision
                            </p>
                        </div>

                        <Card className="max-w-2xl mx-auto">
                            <CardContent className="p-6">
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {splitResult?.splitPdfs.map((pdf, index) => (
                                        <div key={pdf.filename} className="flex items-center justify-between p-3 bg-gradient-to-r from-background to-muted/50 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{pdf.filename}</p>
                                                    <p className="text-xs text-muted-foreground">Split PDF file</p>
                                                </div>
                                            </div>
                                            <Button size="sm" asChild className="shrink-0">
                                                <a href={pdf.pdfUri} download={pdf.filename}>
                                                    <FileDown className="mr-2 h-4 w-4" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center">
                            <Button 
                                size="lg" 
                                variant="outline" 
                                onClick={handleReset}
                                className="border-primary/20 hover:bg-primary/5"
                            >
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Split Another PDF
                            </Button>
                        </div>
                    </div>
                </ModernSection>
            )}

            <ModernSection
                title="AI-Enhanced Splitting Features"
                subtitle="Experience the power of intelligent PDF processing"
                icon={<Zap className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <h4 className="font-semibold">Smart Page Analysis</h4>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Our AI analyzes document structure to identify natural page boundaries and optimize splitting for the best results.
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Split className="h-5 w-5 text-primary" />
                            </div>
                            <h4 className="font-semibold">Intelligent Grouping</h4>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Advanced algorithms group consecutive pages intelligently while preserving formatting, metadata, and document integrity.
                        </p>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-3">
                        <div className="p-1 bg-primary/20 rounded">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h5 className="font-medium text-sm">Pro Tip</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                                Select multiple non-consecutive pages to create separate PDF files for each page range automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </ModernSection>

            {/* Tool-specific sections removed (home-only CMS sections) */}

            <FAQ />
            <ToolCustomSectionRenderer slug="split-pdf" />
            <AllTools />
        </ModernPageLayout>
    )
}
