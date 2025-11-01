
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, FileDown, Loader2, RefreshCw, Type, ImageIcon as ImageIconLucide, Save, Trash2, Wand2, Square, Pen, Highlighter, RotateCcw, ScanText, FileEdit, MousePointer, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { editPdf } from '@/lib/actions/edit-pdf';
import type { EditPdfInput, PdfEdit } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rnd } from 'react-rnd';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Tesseract from 'tesseract.js';
import { ToolSections } from '@/components/tool-sections';
import { useToolSections } from '@/hooks/use-tool-sections';
import { findPdfElements } from '@/ai/flows/find-pdf-elements';

type Stage = 'upload' | 'edit' | 'download';
type EditMode = 'select' | 'text' | 'image' | 'rectangle' | 'drawing' | 'highlight';

interface PageToRender {
  src: string;
  pageNumber: number;
  width: number;
  height: number;
}

interface EditableItem {
    id: string;
    type: 'text' | 'image' | 'rectangle' | 'drawing' | 'highlight' | 'cover';
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string; // text content, image data URI, or shape color
    points?: { x: number; y: number }[];
    fontSize?: number;
    rotation?: number;
    backgroundColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

export default function EditPdfPage() {
  const { sections } = useToolSections('PDF Editor');
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');
    const [pages, setPages] = useState<PageToRender[]>([]);
    const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<EditMode>('select');
    const [editedPdfUri, setEditedPdfUri] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [ocrLanguage, setOcrLanguage] = useState<string>('English');

    const [isDrawing, setIsDrawing] = useState(false);
    const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const { toast } = useToast();
    
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }, []);

    // OCR functionality (robust: PDF.js text -> AI OCR -> Tesseract)
    const aiPerformOCR = async () => {
        if (!pages[currentPageIndex]) return;
        setIsLoading(true);
        setLoadingMessage('AI OCR: detecting text blocks...');
        try {
            const renderedPage = pages[currentPageIndex];
            const aiResult = await findPdfElements({
                imageUri: renderedPage.src,
                pageWidth: renderedPage.width,
                pageHeight: renderedPage.height,
                language: ocrLanguage,
            } as any);

            const aiTextItems: EditableItem[] = (aiResult.elements || [])
                .filter((el: any) => el.text && el.box)
                .map((el: any, idx: number) => ({
                    id: `ai-ocr-text-${Date.now()}-${idx}`,
                    type: 'text' as const,
                    pageIndex: currentPageIndex,
                    x: el.box.x,
                    y: el.box.y,
                    width: el.box.width,
                    height: el.box.height,
                    content: el.text,
                    fontSize: Math.max(12, el.box.height),
                    rotation: 0,
                }));

            if (aiTextItems.length > 0) {
                setEditableItems(prev => [...prev, ...aiTextItems]);
                toast({ title: 'AI OCR Complete', description: `Detected ${aiTextItems.length} text blocks via Genkit AI.` });
            } else {
                toast({ title: 'No text found', description: 'AI OCR returned no text for this page.', variant: 'destructive' });
            }
        } catch (err: any) {
            console.error('AI OCR failed', err);
            toast({ title: 'AI OCR Failed', description: err?.message || 'Could not extract text with AI OCR.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    const performOCR = async () => {
        if (!file || !pages[currentPageIndex]) return;

        setIsLoading(true);
        setLoadingMessage('Extracting text from page...');

        try {
            const renderedPage = pages[currentPageIndex];

            // 1) Attempt native PDF text extraction via pdf.js
            try {
                const pdfData = await arrayBufferFromFile(file);
                const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                const page = await pdf.getPage(currentPageIndex + 1);
                const originalViewport = page.getViewport({ scale: 1.0 });
                const scale = renderedPage.width / originalViewport.width;

                const textContent = await page.getTextContent();
                const items = (textContent.items || []) as any[];

                const extractedTextItems: EditableItem[] = items.map((item, idx) => {
                    const t = item.transform || [1,0,0,1,0,0];
                    const x = (t[4] || 0) * scale;
                    const yScale = Math.abs(t[3] || 0);
                    const fontHeight = (yScale || 12) * scale;
                    const yTop = ((t[5] || 0) * scale) - fontHeight; // transform f is baseline
                    const width = (item.width || (Math.abs(t[0] || 0))) * scale;
                    const height = fontHeight;
                    const content = item.str || '';
                    return {
                        id: `pdfjs-text-${Date.now()}-${idx}`,
                        type: 'text' as const,
                        pageIndex: currentPageIndex,
                        x, y: yTop, width, height,
                        content,
                        fontSize: Math.max(12, height),
                        rotation: 0,
                    } as EditableItem;
                }).filter(el => el.content && el.content.trim().length > 0 && el.width > 2 && el.height > 8);

                if (extractedTextItems.length > 0) {
                    setEditableItems(prev => [...prev, ...extractedTextItems]);
                    toast({
                        title: 'Text Extracted',
                        description: `Found ${extractedTextItems.length} text chunks via PDF parsing.`,
                    });
                    setIsLoading(false);
                    return;
                }
            } catch (pdfParseErr) {
                console.warn('PDF.js text extraction failed or found no text:', pdfParseErr);
            }

            // 2) AI OCR for bounding boxes if no native text found
            try {
                setLoadingMessage('AI OCR: detecting text blocks...');
                const aiResult = await findPdfElements({
                    imageUri: renderedPage.src,
                    pageWidth: renderedPage.width,
                    pageHeight: renderedPage.height,
                    language: ocrLanguage,
                } as any);

                const aiTextItems: EditableItem[] = (aiResult.elements || [])
                    .filter((el: any) => el.text && el.box)
                    .map((el: any, idx: number) => ({
                        id: `ai-ocr-text-${Date.now()}-${idx}`,
                        type: 'text' as const,
                        pageIndex: currentPageIndex,
                        x: el.box.x,
                        y: el.box.y,
                        width: el.box.width,
                        height: el.box.height,
                        content: el.text,
                        fontSize: Math.max(12, el.box.height),
                        rotation: 0,
                    }));

                if (aiTextItems.length > 0) {
                    setEditableItems(prev => [...prev, ...aiTextItems]);
                    toast({
                        title: 'AI OCR Complete',
                        description: `Detected ${aiTextItems.length} text blocks via AI OCR.`,
                    });
                    setIsLoading(false);
                    return;
                }
            } catch (aiErr: any) {
                console.warn('AI OCR failed or returned no elements:', aiErr?.message || aiErr);
            }

            // 3) Fallback to local Tesseract OCR
            try {
                setLoadingMessage('Local OCR: recognizing text...');
                const result = await Tesseract.recognize(renderedPage.src, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setLoadingMessage(`Extracting text... ${Math.round((m.progress || 0) * 100)}%`);
                        }
                    }
                });

                const words = (result?.data?.words || []) as any[];
                const newTextItems: EditableItem[] = words
                    .filter((word: any) => (word.confidence || 0) > 60 && word.bbox)
                    .map((word: any, index: number) => ({
                        id: `ocr-text-${Date.now()}-${index}`,
                        type: 'text' as const,
                        pageIndex: currentPageIndex,
                        x: word.bbox.x0,
                        y: word.bbox.y0,
                        width: word.bbox.x1 - word.bbox.x0,
                        height: word.bbox.y1 - word.bbox.y0,
                        content: word.text,
                        fontSize: Math.max(12, word.bbox.y1 - word.bbox.y0),
                        rotation: 0,
                    }));

                if (newTextItems.length > 0) {
                    setEditableItems(prev => [...prev, ...newTextItems]);
                    toast({
                        title: 'OCR Complete',
                        description: `Extracted ${newTextItems.length} text elements from the page.`,
                    });
                } else {
                    // As a last resort, if Tesseract returns a raw text string, attach one text box
                    const rawText = (result?.data?.text || '').trim();
                    if (rawText.length > 0) {
                        setEditableItems(prev => [...prev, {
                            id: `ocr-text-${Date.now()}-raw`,
                            type: 'text',
                            pageIndex: currentPageIndex,
                            x: 16,
                            y: 16,
                            width: Math.max(200, renderedPage.width - 32),
                            height: 48,
                            content: rawText,
                            fontSize: 16,
                            rotation: 0,
                        }]);
                        toast({ title: 'OCR Complete', description: 'Extracted raw text from page.' });
                    } else {
                        toast({
                            title: 'No text found',
                            description: 'No readable text was detected on this page.',
                            variant: 'destructive',
                        });
                    }
                }
            } catch (tessErr: any) {
                console.error('Local OCR (Tesseract) failed', tessErr);
                toast({
                    title: 'OCR Failed',
                    description: tessErr?.message || 'Could not extract text from the page.',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

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
        const scale = 1.5;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                pagesToRender.push({ 
                    src: canvas.toDataURL('image/png'), 
                    pageNumber: i,
                    width: viewport.width,
                    height: viewport.height
                });
            }
        }
        return pagesToRender;
    };

    const handlePdfUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        setLoadingMessage('Rendering PDF pages...');
        try {
            const renderedPages = await renderPdfToImages(file);
            if (renderedPages.length > 0) {
                setPages(renderedPages);
                setStage('edit');
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
    
    const addText = () => {
        const page = pages[currentPageIndex];
        setEditableItems(prev => [...prev, {
            id: `text-${Date.now()}`,
            type: 'text',
            pageIndex: currentPageIndex,
            x: page.width / 2 - 100,
            y: page.height / 2 - 25,
            width: 200,
            height: 50,
            content: "New Text",
            fontSize: 16,
            rotation: 0,
        }])
    }
    
    const addRectangle = () => {
        const page = pages[currentPageIndex];
        setEditableItems(prev => [...prev, {
            id: `rect-${Date.now()}`,
            type: 'rectangle',
            pageIndex: currentPageIndex,
            x: page.width / 2 - 75,
            y: page.height / 2 - 50,
            width: 150,
            height: 100,
            content: '#ef4444', // Default color (red)
            backgroundColor: '#ef4444',
            rotation: 0,
        }])
    }

    const addImage = (imageUri: string, img: HTMLImageElement) => {
        const page = pages[currentPageIndex];
        const aspectRatio = img.width / img.height;
        let width = 200;
        let height = 200 / aspectRatio;

        if (height > page.height - 40) {
            height = page.height - 40;
            width = height * aspectRatio;
        }

        setEditableItems(prev => [...prev, {
            id: `image-${Date.now()}`,
            type: 'image',
            pageIndex: currentPageIndex,
            x: page.width / 2 - width / 2,
            y: page.height / 2 - height / 2,
            width,
            height,
            content: imageUri,
            rotation: 0,
        }])
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.onload = () => {
                       addImage(event.target?.result as string, img);
                    }
                    img.src = event.target?.result as string;
                }
                reader.readAsDataURL(file);
            } else {
                toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
            }
        }
        e.target.value = '';
    }

    const updateItem = (id: string, newProps: Partial<EditableItem>) => {
        setEditableItems(prev => prev.map(item => item.id === id ? { ...item, ...newProps } : item));
    }
    
    const deleteActiveItem = () => {
        if (activeItemId) {
            setEditableItems(prev => prev.filter(item => item.id !== activeItemId));
            setActiveItemId(null);
        }
    }

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSaveChanges = async () => {
        if (!file) return;
        setIsLoading(true);
        setLoadingMessage('Saving changes...');

        try {
            const pdfUri = await fileToDataUri(file);
            const pdfData = await arrayBufferFromFile(file);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

            const scaledEdits: PdfEdit[] = await Promise.all(editableItems.map(async (item) => {
                const page = await pdf.getPage(item.pageIndex + 1);
                const originalViewport = page.getViewport({ scale: 1.0 });

                const renderedPage = pages[item.pageIndex];
                const scale = originalViewport.width / renderedPage.width;
                
                return {
                    ...item,
                    points: item.points?.map(p => ({ x: p.x * scale, y: p.y * scale })),
                    x: item.x * scale,
                    y: item.y * scale,
                    width: item.width * scale,
                    height: item.height * scale,
                    fontSize: item.fontSize ? item.fontSize * scale : undefined,
                };
            }));

            const input: EditPdfInput = { pdfUri, edits: scaledEdits };
            const result = await editPdf(input);
            if (result.editedPdfUri) {
                setEditedPdfUri(result.editedPdfUri);
                setStage('download');
            }

        } catch (error: any) {
            toast({ title: "Saving Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleReset = () => {
        setStage('upload');
        setFile(null);
        setPages([]);
        setEditableItems([]);
        setActiveItemId(null);
        setEditMode('select');
        setEditedPdfUri(null);
        setIsLoading(false);
    }
    
    const currentPath = useRef<{x: number, y: number}[]>([]);
    
    const getCoords = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editMode !== 'drawing' && editMode !== 'highlight') return;
        setIsDrawing(true);
        currentPath.current = [getCoords(e)];
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing) return;
        currentPath.current.push(getCoords(e));
        
        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(currentPath.current[0].x, currentPath.current[0].y);
            currentPath.current.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = editMode === 'drawing' ? '#000000' : '#fef08a';
            ctx.lineWidth = editMode === 'drawing' ? 3 : 15;
            ctx.globalAlpha = editMode === 'highlight' ? 0.5 : 1.0;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
             ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        if (currentPath.current.length > 1) {
            setEditableItems(prev => [...prev, {
                id: `${editMode}-${Date.now()}`,
                type: editMode,
                pageIndex: currentPageIndex,
                points: currentPath.current,
                x: 0, y: 0, width: 0, height: 0,
                content: '',
                strokeColor: editMode === 'drawing' ? '#000000' : '#facc15',
                strokeWidth: editMode === 'drawing' ? 3 : 15,
            }]);
        }
        currentPath.current = [];
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
                                {isLoading ? <><Loader2 className="mr-2 animate-spin" />Processing...</> : "Start Editing"}
                            </Button>
                        </div>
                    )}
                </div>
            )
            case 'edit': 
                const activeItem = editableItems.find(item => item.id === activeItemId);
                const currentPage = pages[currentPageIndex];
                return (
                <div className="flex flex-col h-[85vh]">
                    <header className="flex items-center justify-between p-2 border-b">
                         <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleReset}><RotateCcw /></Button>
                            <h2 className="font-semibold text-lg">PDF Editor</h2>
                         </div>
                        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                            <Button variant={editMode === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setEditMode('select')} title="Select"><MousePointer /></Button>
                            <Button variant={editMode === 'text' ? 'secondary' : 'ghost'} size="icon" onClick={() => { setEditMode('text'); addText() }} title="Add Text"><Type /></Button>
                            <select
                                value={ocrLanguage}
                                onChange={(e) => setOcrLanguage(e.target.value)}
                                className="mx-2 text-sm border rounded-md px-2 py-1 bg-background"
                                title="OCR Language"
                            >
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>German</option>
                                <option>Italian</option>
                            </select>
                            <Button variant="secondary" size="icon" onClick={aiPerformOCR} title="AI OCR" disabled={isLoading}><ScanText /></Button>
                            <Button variant={editMode === 'image' ? 'secondary' : 'ghost'} size="icon" onClick={() => document.getElementById(`image-upload`)?.click()} title="Add Image"><ImageIconLucide /></Button>
                            <Button variant={editMode === 'drawing' ? 'secondary' : 'ghost'} size="icon" onClick={() => setEditMode('drawing')} title="Draw"><Pen /></Button>
                            <Button variant={editMode === 'highlight' ? 'secondary' : 'ghost'} size="icon" onClick={() => setEditMode('highlight')} title="Highlight"><Highlighter /></Button>
                            <Button variant={editMode === 'rectangle' ? 'secondary' : 'ghost'} size="icon" onClick={() => { setEditMode('rectangle'); addRectangle() }} title="Add Shape"><Square /></Button>
                            <Input id={`image-upload`} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                        </div>
                        <Button size="lg" onClick={handleSaveChanges} disabled={isLoading}>
                             {isLoading ? <><Loader2 className="mr-2 animate-spin" />Saving...</> : <><Save className="mr-2"/>Save PDF</>}
                        </Button>
                    </header>
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Page Thumbnails */}
                        <aside className="w-40 border-r bg-background overflow-y-auto">
                            <ScrollArea className="h-full">
                                <div className="p-2 space-y-2">
                                    {pages.map((page, index) => (
                                        <div key={index} className={cn("relative border-2 cursor-pointer", currentPageIndex === index ? "border-primary" : "border-transparent")} onClick={() => setCurrentPageIndex(index)}>
                                            <Image src={page.src} alt={`Page ${index + 1}`} width={150} height={210} className="w-full h-auto" />
                                            <div className="absolute bottom-1 right-1 bg-background/80 px-1.5 py-0.5 rounded-sm text-xs font-bold">{index + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </aside>
                        
                        {/* Center Editor */}
                        <main className="flex-1 bg-muted/50 flex items-center justify-center p-4 overflow-auto">
                            {isLoading && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">{loadingMessage}</p></div>}
                            <div 
                                id={`page-container-${currentPageIndex}`} 
                                className="relative shadow-lg" style={{width: currentPage.width, height: currentPage.height, cursor: (editMode === 'drawing' || editMode === 'highlight') ? 'crosshair' : 'default'}} 
                                onClick={() => setActiveItemId(null)}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={() => { if(isDrawing) handleMouseUp(new MouseEvent("mouseup") as any);}}
                            >
                                <Image src={currentPage.src} alt={`PDF Page ${currentPageIndex + 1}`} width={currentPage.width} height={currentPage.height} className="w-full h-auto" priority />
                                <svg width={currentPage.width} height={currentPage.height} className="absolute top-0 left-0 pointer-events-none">
                                    {editableItems.filter(item => (item.type === 'drawing' || item.type === 'highlight') && item.pageIndex === currentPageIndex && item.points && item.points.length > 1).map(item => (
                                        <path 
                                            key={item.id}
                                            d={`M ${item.points![0].x} ${item.points![0].y} ${item.points!.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                                            stroke={item.strokeColor}
                                            strokeWidth={item.strokeWidth}
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            opacity={item.type === 'highlight' ? 0.5 : 1.0}
                                        />
                                    ))}
                                </svg>
                                <canvas ref={drawingCanvasRef} width={currentPage.width} height={currentPage.height} className="absolute top-0 left-0 pointer-events-none" />
                                {editableItems.filter(item => (item.type !== 'drawing' && item.type !== 'highlight') && item.pageIndex === currentPageIndex).map(item => (
                                   <Rnd
                                    key={item.id}
                                    size={{ width: item.width, height: item.height }}
                                    position={{ x: item.x, y: item.y }}
                                    onDragStart={(e) => {e.stopPropagation(); setActiveItemId(item.id)}}
                                    onDragStop={(e, d) => { updateItem(item.id, { x: d.x, y: d.y }) }}
                                    onResizeStart={(e) => {e.stopPropagation(); setActiveItemId(item.id)}}
                                    onResizeStop={(e, direction, ref, delta, position) => {
                                        updateItem(item.id, {
                                            width: parseFloat(ref.style.width),
                                            height: parseFloat(ref.style.height),
                                            ...position,
                                        });
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setActiveItemId(item.id) }}
                                    className={cn("border border-dashed", activeItemId === item.id ? "border-primary z-10" : "border-transparent")}
                                    enableResizing={editMode === 'select' && item.type !== 'cover'}
                                    disableDragging={editMode !== 'select' || item.type === 'cover'}
                                    >
                                       <div className="w-full h-full" style={{ transform: `rotate(${item.rotation || 0}deg)`}}>
                                            {item.type === 'text' ? (
                                                <Textarea defaultValue={item.content} onBlur={(e) => updateItem(item.id, {content: e.target.value})} className="w-full h-full cursor-move p-0 border-none resize-none bg-transparent focus-visible:ring-0" style={{fontSize: item.fontSize, color: 'black'}}/>
                                            ) : item.type === 'image' ? (
                                                <Image src={item.content} alt="Editable image" layout="fill" className="w-full h-full cursor-move object-contain"/>
                                            ) : item.type === 'rectangle' || item.type === 'cover' ? (
                                                <div className="w-full h-full cursor-move" style={{ backgroundColor: item.backgroundColor }}></div>
                                            ) : null}
                                       </div>
                                   </Rnd>
                                ))}
                            </div>
                        </main>
                        
                        {/* Right Properties Panel */}
                         <aside className="w-64 border-l bg-background p-4 overflow-y-auto">
                           <h3 className="font-semibold text-lg text-center mb-4">Properties</h3>
                           {activeItem ? (
                               <div className="space-y-4">
                                     {activeItem.type === 'text' && (
                                         <div className="space-y-2">
                                            <Label htmlFor="text-content">Text</Label>
                                            <Textarea id="text-content" value={activeItem.content} onChange={e => updateItem(activeItemId!, { content: e.target.value })} />
                                            <Label htmlFor="font-size">Font Size</Label>
                                            <Input id="font-size" type="number" value={activeItem.fontSize} onChange={e => updateItem(activeItemId!, { fontSize: Number(e.target.value) })} />
                                         </div>
                                     )}
                                     {(activeItem.type === 'image' || activeItem.type === 'rectangle') && (
                                        <div className="space-y-2">
                                            <Label>Rotation: {activeItem.rotation || 0}°</Label>
                                            <Slider 
                                                value={[activeItem.rotation || 0]} 
                                                onValueChange={([v]) => updateItem(activeItemId!, { rotation: v })}
                                                min={0}
                                                max={360}
                                                step={1}
                                            />
                                        </div>
                                     )}
                                     {activeItem.type === 'rectangle' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="bg-color">Fill Color</Label>
                                            <div className="flex items-center gap-2">
                                                <Input id="bg-color" type="color" value={activeItem.backgroundColor} onChange={e => updateItem(activeItemId!, { backgroundColor: e.target.value, content: e.target.value })} className="p-1 h-10"/>
                                                <Input type="text" value={activeItem.backgroundColor} onChange={e => updateItem(activeItemId!, { backgroundColor: e.target.value, content: e.target.value })}/>
                                            </div>
                                        </div>
                                     )}
                                     <Button variant="destructive" className="w-full" onClick={deleteActiveItem}><Trash2 className="mr-2"/> Delete Element</Button>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground mt-8">
                                    <p>Select an element on the page to see its properties.</p>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            )
            case 'download': return (
                <div className="text-center flex flex-col items-center gap-4">
                    <FileEdit className="h-16 w-16 text-green-500 bg-green-500/10 p-2 rounded-full" />
                    <h2 className="text-2xl font-bold">PDF Edited Successfully!</h2>
                    <p className="text-muted-foreground">Your edited document is ready for download.</p>
                    <div className="flex gap-4 mt-4">
                        <Button size="lg" asChild>
                            <a href={editedPdfUri!} download={file?.name.replace('.pdf', '-edited.pdf')}>
                                <FileDown className="mr-2" /> Download
                            </a>
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
        <div className="w-full min-h-screen bg-muted/30">
            {stage === 'upload' && (
                 <header className="text-center py-8">
                    <h1 className="text-4xl font-bold font-headline">PDF Editor</h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        Add or edit text, images, shapes, and drawings in your PDF documents.
                    </p>
                </header>
            )}
            <div className={cn(stage !== 'edit' && 'container mx-auto py-8')}>
                <Card className={cn(stage === 'edit' && 'h-screen border-0 rounded-none')}>
                    <CardContent className={cn(stage !== 'edit' ? 'p-6 min-h-[50vh]' : 'p-0 h-full')}>
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>

            {/* Hero Sections for Future Content */}
            {stage === 'upload' && (
                <div className="bg-background">
                    {/* Hero Section 1 - OCR Features */}
                    <section className="py-20 px-4">
                        <div className="container mx-auto max-w-6xl">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-bold text-foreground">
                                        Extract Text with OCR Technology
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Convert scanned documents and images into editable text with our advanced OCR technology. 
                                        Edit existing text while preserving original formatting and fonts.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <ScanText className="h-5 w-5 text-primary" />
                                            <span>Accurate Text Recognition</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Type className="h-5 w-5 text-primary" />
                                            <span>Font Preservation</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                                    <div className="text-center text-muted-foreground">
                                        <ScanText className="h-24 w-24 mx-auto mb-4 opacity-50" />
                                        <p>OCR Feature Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hero Section 2 - Advanced Editing */}
                    <section className="py-20 px-4 bg-muted/50">
                        <div className="container mx-auto max-w-6xl">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-8 flex items-center justify-center min-h-[300px] order-2 lg:order-1">
                                    <div className="text-center text-muted-foreground">
                                        <Pen className="h-24 w-24 mx-auto mb-4 opacity-50" />
                                        <p>Advanced Editing Tools</p>
                                    </div>
                                </div>
                                <div className="space-y-6 order-1 lg:order-2">
                                    <h2 className="text-4xl font-bold text-foreground">
                                        Professional PDF Editing
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Add text, images, shapes, and drawings to your PDFs. Draw annotations, 
                                        highlight important content, and create professional documents.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Pen className="h-5 w-5 text-blue-500" />
                                            <span>Drawing Tools</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Highlighter className="h-5 w-5 text-blue-500" />
                                            <span>Highlighting</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hero Section 3 - Easy Upload */}
                    <section className="py-20 px-4">
                        <div className="container mx-auto max-w-6xl">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-bold text-foreground">
                                        Simple Drag & Drop Upload
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Get started in seconds. Simply drag and drop your PDF files or click to browse. 
                                        Our editor supports all standard PDF formats and processes files quickly.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <UploadCloud className="h-5 w-5 text-green-500" />
                                            <span>Fast Upload</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileEdit className="h-5 w-5 text-green-500" />
                                            <span>All PDF Formats</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                                    <div className="text-center text-muted-foreground">
                                        <UploadCloud className="h-24 w-24 mx-auto mb-4 opacity-50" />
                                        <p>Upload Interface Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hero Section 4 - Security & Privacy */}
                    <section className="py-20 px-4 bg-muted/50">
                        <div className="container mx-auto max-w-6xl">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-8 flex items-center justify-center min-h-[300px] order-2 lg:order-1">
                                    <div className="text-center text-muted-foreground">
                                        <Wand2 className="h-24 w-24 mx-auto mb-4 opacity-50" />
                                        <p>Security Features</p>
                                    </div>
                                </div>
                                <div className="space-y-6 order-1 lg:order-2">
                                    <h2 className="text-4xl font-bold text-foreground">
                                        Secure & Private Processing
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Your documents are processed securely with enterprise-grade encryption. 
                                        Files are automatically deleted after processing to ensure your privacy.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Wand2 className="h-5 w-5 text-purple-500" />
                                            <span>Encrypted Processing</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Trash2 className="h-5 w-5 text-purple-500" />
                                            <span>Auto-Delete Files</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hero Section 5 - Download & Export */}
                    <section className="py-20 px-4">
                        <div className="container mx-auto max-w-6xl">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-bold text-foreground">
                                        Export & Download Options
                                    </h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Save your edited PDFs in high quality. Download instantly or save to cloud storage. 
                                        Maintain original formatting while preserving all your edits and annotations.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileDown className="h-5 w-5 text-orange-500" />
                                            <span>Instant Download</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Save className="h-5 w-5 text-orange-500" />
                                            <span>High Quality Output</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                                    <div className="text-center text-muted-foreground">
                                        <FileDown className="h-24 w-24 mx-auto mb-4 opacity-50" />
                                        <p>Download Interface Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            
            {/* SEO Sections */}
            {stage === 'upload' && (
                <ToolSections
                    toolName="PDF Editor"
        sections={sections}
                />
            )}
        </div>
    )
}
