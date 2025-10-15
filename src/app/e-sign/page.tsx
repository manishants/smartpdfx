
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Pen, Type, Eraser, Check, Wand2, FileSignature, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eSignPdf } from '@/lib/actions/e-sign-pdf';
import type { ESignPdfInput, SignaturePlacement } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { Rnd } from 'react-rnd';
import { cn } from '@/lib/utils';


type Stage = 'upload' | 'sign' | 'place' | 'download';
type SignatureMode = 'draw' | 'type' | 'upload';

interface PlacedSignature {
    id: string;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function ESignPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfImages, setPdfImages] = useState<string[]>([]);
    const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}[]>([]);
    const [signature, setSignature] = useState<string | null>(null);
    const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
    const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);
    const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [zoom, setZoom] = useState(1);


    const sigCanvas = useRef<SignatureCanvas>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        }
    }, []);

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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
        const images: string[] = [];
        const dimensions: {width: number, height: number}[] = [];
        const pdfData = await arrayBufferFromFile(pdfFile);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                images.push(canvas.toDataURL('image/png'));
                dimensions.push({ width: viewport.width, height: viewport.height });
            }
        }
        return { images, dimensions };
    };

    const handlePdfUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        try {
            const { images, dimensions } = await renderPdfToImages(file);
            if (images.length > 0) {
                setPdfImages(images);
                setPageDimensions(dimensions);
                setStage('place');
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
    
    const handleSignatureSave = () => {
        if (signatureMode === 'draw' && sigCanvas.current) {
            if(sigCanvas.current.isEmpty()) {
                toast({ title: "Signature is empty", description: "Please draw your signature before saving.", variant: "destructive" });
                return;
            }
            setSignature(sigCanvas.current.toDataURL('image/png'));
        } else if (signatureMode === 'type') {
            if (!typedSignature.trim()) {
                toast({ title: "Signature is empty", description: "Please type your name before saving.", variant: "destructive" });
                return;
            }
            // Simple text to image conversion via canvas
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "black";
                ctx.font = '50px "Homemade Apple", cursive';
                ctx.fillText(typedSignature, 20, 90);
                setSignature(canvas.toDataURL('image/png'));
            }
        }
        handlePdfUpload();
    }

    const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const sigFile = event.target.files[0];
            if (sigFile.type.startsWith('image/')) {
                const sigUri = await fileToDataUri(sigFile);
                setSignature(sigUri);
                handlePdfUpload();
            } else {
                toast({ title: "Invalid file type", description: "Please upload an image file for your signature.", variant: "destructive" });
            }
        }
    }

    const handlePageDrop = (e: React.DragEvent<HTMLDivElement>, pageIndex: number) => {
        e.preventDefault();
        const signatureData = e.dataTransfer.getData("application/json");
        if (!signatureData) return;

        const { width, height } = JSON.parse(signatureData);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - (width / 2)) / zoom;
        const y = (e.clientY - rect.top - (height / 2)) / zoom;
        
        setPlacedSignatures(prev => [...prev, { id: `sig-${Date.now()}`, pageIndex, x, y, width, height }]);
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
        const signatureData = JSON.stringify({ width: 150, height: 75 });
        e.dataTransfer.setData("application/json", signatureData);
    }
    
    const handleApplySignatures = async () => {
        if (!file || !signature || placedSignatures.length === 0) {
            toast({ title: "Missing information", description: "Please place at least one signature.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);
            const pdfData = await arrayBufferFromFile(file);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

            const placements: SignaturePlacement[] = await Promise.all(placedSignatures.map(async (ps) => {
                const page = await pdf.getPage(ps.pageIndex + 1);
                const originalViewport = page.getViewport({ scale: 1.0 });

                const renderedPage = pageDimensions[ps.pageIndex];
                if (!renderedPage) return null;

                const scale = originalViewport.width / renderedPage.width;
                
                return {
                    pageIndex: ps.pageIndex,
                    x: ps.x * scale,
                    y: ps.y * scale,
                    width: ps.width * scale,
                    height: ps.height * scale,
                };
            })).then(results => results.filter((p): p is SignaturePlacement => p !== null));


            const input: ESignPdfInput = { pdfUri, signatureImageUri: signature, placements };
            const result = await eSignPdf(input);
            
            if (result && result.signedPdfUri) {
                setSignedPdfUri(result.signedPdfUri);
                setStage('download');
            } else {
                throw new Error("Failed to sign the PDF.");
            }
        } catch (error: any) {
            toast({ title: "Signing Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
    
    const removeSignature = (id: string) => {
        setPlacedSignatures(prev => prev.filter(s => s.id !== id));
    }

    const handleReset = () => {
        setStage('upload');
        setFile(null);
        setPdfImages([]);
        setPageDimensions([]);
        setSignature(null);
        setTypedSignature('');
        setPlacedSignatures([]);
        setSignedPdfUri(null);
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
                            <Button size="lg" onClick={() => setStage('sign')} disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 animate-spin" />Processing...</> : "Proceed to Sign"}
                            </Button>
                        </div>
                    )}
                </div>
            )
            case 'sign': return (
                <div>
                     <style>{`@import url('https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap');`}</style>
                    <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as SignatureMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="draw"><Pen className="mr-2"/>Draw</TabsTrigger>
                            <TabsTrigger value="type"><Type className="mr-2"/>Type</TabsTrigger>
                            <TabsTrigger value="upload"><UploadCloud className="mr-2"/>Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="draw">
                            <Card className="mt-4">
                                <CardContent className="p-2">
                                    <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-48 rounded-md bg-white'}} />
                                    <Button variant="ghost" size="sm" onClick={() => sigCanvas.current?.clear()} className="mt-2"><Eraser className="mr-2"/>Clear</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="type">
                             <Card className="mt-4">
                                <CardContent className="p-4">
                                    <Input 
                                        placeholder="Type your full name" 
                                        className="text-4xl h-24 p-4" 
                                        style={{fontFamily: '"Homemade+Apple", cursive'}}
                                        value={typedSignature}
                                        onChange={(e) => setTypedSignature(e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="upload">
                            <Card 
                                className="mt-4 border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => document.getElementById('sig-upload')?.click()}
                            >
                                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                                <p className="mt-4 font-semibold text-primary">Click to upload signature</p>
                                <Input id="sig-upload" type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-6 flex justify-end">
                       <Button size="lg" onClick={handleSignatureSave}><Check className="mr-2" />Use This Signature</Button>
                    </div>
                </div>
            )
            case 'place':
                const currentPageImage = pdfImages[currentPageIndex];
                const currentPageDimension = pageDimensions[currentPageIndex];
                return (
                <div className="grid md:grid-cols-12 gap-6 h-[80vh]">
                    <aside className="md:col-span-3 flex flex-col items-center gap-4 p-4 border-r">
                        <h3 className="font-semibold text-lg">Your Signature</h3>
                        {signature && (
                            <div className="p-2 border border-dashed rounded-md cursor-grab">
                                <Image 
                                    src={signature} 
                                    alt="Your signature"
                                    width={150}
                                    height={75}
                                    draggable="true"
                                    onDragStart={handleDragStart}
                                />
                            </div>
                        )}
                        <p className="text-sm text-center text-muted-foreground">Drag your signature and drop it onto the document pages.</p>
                        
                        {activeSignatureId && (
                           <Button variant="destructive" className="w-full mt-4" onClick={() => removeSignature(activeSignatureId)}>
                               <Trash2 className="mr-2" /> Remove Selected
                           </Button>
                        )}

                        <Button className="w-full mt-auto" size="lg" onClick={handleApplySignatures} disabled={isLoading || placedSignatures.length === 0}>
                            {isLoading ? <><Loader2 className="mr-2 animate-spin" />Applying...</> : <><Wand2 className="mr-2"/>Apply Signatures</>}
                        </Button>
                    </aside>
                    <main className="md:col-span-9 bg-muted/50 flex flex-col justify-between items-center p-4 overflow-auto">
                        <div className="relative shadow-lg flex-1 w-full flex items-center justify-center">
                            <div 
                                className="relative" 
                                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                                onDragOver={(e) => e.preventDefault()} 
                                onDrop={(e) => handlePageDrop(e, currentPageIndex)} 
                                onClick={() => setActiveSignatureId(null)}
                            >
                                <Image id={`pdf-page-${currentPageIndex}`} src={currentPageImage} alt={`PDF Page ${currentPageIndex + 1}`} width={currentPageDimension?.width || 800} height={currentPageDimension?.height || 1100} className="w-full h-auto" />
                                {placedSignatures.filter(ps => ps.pageIndex === currentPageIndex).map(ps => (
                                    <Rnd
                                        key={ps.id}
                                        size={{ width: ps.width, height: ps.height }}
                                        position={{ x: ps.x, y: ps.y }}
                                        onDragStart={(e) => { e.stopPropagation(); setActiveSignatureId(ps.id); }}
                                        onDragStop={(e, d) => {
                                            const updatedSigs = placedSignatures.map(s => s.id === ps.id ? {...s, x: d.x, y: d.y} : s);
                                            setPlacedSignatures(updatedSigs);
                                        }}
                                        onResizeStart={(e) => { e.stopPropagation(); setActiveSignatureId(ps.id); }}
                                        onResizeStop={(e, direction, ref, delta, position) => {
                                            const updatedSigs = placedSignatures.map(s => s.id === ps.id ? {
                                                ...s,
                                                width: parseFloat(ref.style.width),
                                                height: parseFloat(ref.style.height),
                                                ...position
                                            } : s);
                                            setPlacedSignatures(updatedSigs);
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setActiveSignatureId(ps.id); }}
                                        className={cn("border border-dashed", activeSignatureId === ps.id ? "border-primary" : "border-transparent")}
                                    >
                                        <Image
                                            src={signature!}
                                            alt="Placed signature"
                                            layout="fill"
                                            className="cursor-move object-contain"
                                        />
                                    </Rnd>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-4 bg-background p-2 rounded-lg border shadow-sm">
                            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}><ZoomOut className="h-4 w-4" /></Button>
                            <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
                            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.25))}><ZoomIn className="h-4 w-4" /></Button>
                            <div className="w-px h-6 bg-border mx-4"></div>
                            <Button variant="outline" size="icon" onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))} disabled={currentPageIndex === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">Page {currentPageIndex + 1} of {pdfImages.length}</span>
                            <Button variant="outline" size="icon" onClick={() => setCurrentPageIndex(p => Math.min(pdfImages.length - 1, p + 1))} disabled={currentPageIndex === pdfImages.length - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </main>
                </div>
            )
            case 'download': return (
                <div className="text-center flex flex-col items-center gap-4">
                    <Check className="h-16 w-16 text-green-500 bg-green-500/10 p-2 rounded-full" />
                    <h2 className="text-2xl font-bold">PDF Signed Successfully!</h2>
                    <p className="text-muted-foreground">Your signed document is ready for download.</p>
                    <div className="flex gap-4 mt-4">
                        <Button size="lg" asChild>
                            <a href={signedPdfUri!} download={file?.name.replace('.pdf', '-signed.pdf')}>
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
        <div className="container mx-auto px-4 py-8 md:py-12">
             <header className="text-center">
                <h1 className="text-4xl font-bold font-headline">e-Sign PDF</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Easily sign your documents online. It's secure and simple.
                </p>
            </header>
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6 min-h-[70vh]">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

    