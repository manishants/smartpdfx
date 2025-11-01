
"use client";

import { useState, useRef, useCallback } from 'react';
import Image from "next/image";
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Pen, Type, Eraser, Check, Wand2, FileSignature, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eSignPdf } from '@/lib/actions/e-sign-pdf';
import type { ESignPdfInput, SignaturePlacement, SignatureAsset } from '@/lib/types';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { cn } from '@/lib/utils';

// Set up PDF.js worker (match the installed version dynamically)
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Stage = 'upload' | 'sign' | 'place' | 'download';
type SignatureMode = 'draw' | 'type' | 'upload';

interface PlacedSignature {
    id: string;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    assetId: string;
}

export default function ESignPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [signatureAssets, setSignatureAssets] = useState<SignatureAsset[]>([]);
    const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
    const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);
    const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pageWidth, setPageWidth] = useState<number>(0);
    const [pageHeight, setPageHeight] = useState<number>(0);
    const [uploadedSignatureUri, setUploadedSignatureUri] = useState<string | null>(null);
    const [includeDate, setIncludeDate] = useState(false);
    const [dateOffsetX, setDateOffsetX] = useState<number>(0);
    const [dateOffsetY, setDateOffsetY] = useState<number>(0);
    const [dateFontSize, setDateFontSize] = useState<number>(10);

    const sigCanvas = useRef<SignatureCanvas>(null);
    const { toast } = useToast();

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const signatureFileToDataUri = async (file: File): Promise<string> => {
        return fileToDataUri(file);
    };

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

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setStage('place');
    }, []);

    const onPageLoadSuccess = useCallback((page: any) => {
        setPageWidth(page.width);
        setPageHeight(page.height);
    }, []);

    const handlePdfUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        // The PDF will be loaded by react-pdf Document component
        setStage('sign');
        setIsLoading(false);
    };

    const handleSignatureSave = () => {
        let dataUri: string | null = null;
        if (signatureMode === 'draw' && sigCanvas.current) {
            if (sigCanvas.current.isEmpty()) {
                toast({ title: "Signature is empty", description: "Please draw your signature before saving.", variant: "destructive" });
                return;
            }
            dataUri = sigCanvas.current.toDataURL('image/png');
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
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
                dataUri = canvas.toDataURL('image/png');
            }
        } else if (signatureMode === 'upload') {
            if (!uploadedSignatureUri) {
                toast({ title: "No image selected", description: "Please upload a signature image.", variant: "destructive" });
                return;
            }
            dataUri = uploadedSignatureUri;
        }

        if (!dataUri) return;

        const asset: SignatureAsset = {
            id: Date.now().toString(),
            imageUri: dataUri,
        };
        setSignatureAssets(prev => [asset, ...prev]);
        setActiveSignatureId(asset.id);
        setStage('place');
    };

    const handleClearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setTypedSignature('');
        setUploadedSignatureUri(null);
    };

    const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
        const assetId = activeSignatureId ?? signatureAssets[0]?.id;
        if (!assetId) {
            toast({ title: "No signature selected", description: "Add or select a signature to place.", variant: "destructive" });
            return;
        }
        const signatureData = JSON.stringify({ width: 150, height: 75, assetId });
        e.dataTransfer.setData("application/json", signatureData);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        try {
            const signatureData = JSON.parse(e.dataTransfer.getData("application/json"));
            const newSignature: PlacedSignature = {
                id: Date.now().toString(),
                pageIndex: pageNumber - 1,
                x: x / zoom,
                y: y / zoom,
                width: signatureData.width / zoom,
                height: signatureData.height / zoom,
                assetId: signatureData.assetId,
            };
            setPlacedSignatures(prev => [...prev, newSignature]);
        } catch (error) {
            console.error("Error parsing signature data:", error);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleApplySignatures = async () => {
        if (!file || placedSignatures.length === 0) {
            toast({ title: "Missing information", description: "Please place at least one signature.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const pdfUri = await fileToDataUri(file);

            // Convert placed signatures to the format expected by the server action
            const placements: SignaturePlacement[] = placedSignatures.map((ps) => {
                // Scale coordinates based on the actual PDF page size vs rendered size
                const scaleX = pageWidth > 0 ? 1 : 1; // We'll use 1:1 scaling for simplicity
                const scaleY = pageHeight > 0 ? 1 : 1;
                
                return {
                    pageIndex: ps.pageIndex,
                    x: ps.x * scaleX,
                    y: ps.y * scaleY,
                    width: ps.width * scaleX,
                    height: ps.height * scaleY,
                    signatureId: ps.assetId,
                    ...(includeDate
                        ? {
                            dateText: `Signed on ${new Date().toLocaleDateString()}`,
                            dateOffsetX,
                            dateOffsetY,
                            dateFontSize,
                          }
                        : {}),
                };
            });

            const input: ESignPdfInput = {
                pdfUri,
                signatures: signatureAssets,
                placements,
            };
            const result = await eSignPdf(input);
            
            setSignedPdfUri(result.signedPdfUri);
            setStage('download');
            toast({ title: "Success!", description: "Your PDF has been signed successfully." });
        } catch (error: any) {
            console.error("Signing failed", error);
            toast({ title: "Error signing PDF", description: error.message || "Could not sign the PDF.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (signedPdfUri) {
            const link = document.createElement('a');
            link.href = signedPdfUri;
            link.download = `signed-${file?.name || 'document.pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleRemoveSignature = (id: string) => {
        setPlacedSignatures(prev => prev.filter(sig => sig.id !== id));
        if (activeSignatureId === id) {
            setActiveSignatureId(null);
        }
    };

    const handleStartOver = () => {
        setStage('upload');
        setFile(null);
        setSignatureAssets([]);
        setPlacedSignatures([]);
        setSignedPdfUri(null);
        setActiveSignatureId(null);
        setPageNumber(1);
        setNumPages(0);
        setTypedSignature('');
        setUploadedSignatureUri(null);
        setIncludeDate(false);
        setDateOffsetX(0);
        setDateOffsetY(0);
        setDateFontSize(10);
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
    };

    const renderUploadStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <UploadCloud className="h-12 w-12 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Your PDF</h2>
                <p className="text-muted-foreground">Select the PDF document you want to sign</p>
            </div>
            <div className="max-w-md mx-auto">
                <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
            </div>
            {file && (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
                    <Button onClick={handlePdfUpload} disabled={isLoading} className="w-full max-w-xs">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <>Continue </>}
                    </Button>
                </div>
            )}
        </div>
    );

    const renderSignatureStage = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Create Your Signature</h2>
                <p className="text-muted-foreground">Choose how you'd like to create your signature</p>
            </div>
            
            <Tabs value={signatureMode} onValueChange={(value) => setSignatureMode(value as SignatureMode)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="draw" className="flex items-center gap-2">
                        <Pen className="h-4 w-4" />
                        Draw
                    </TabsTrigger>
                    <TabsTrigger value="type" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Type
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" />
                        Upload
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="draw" className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                        <SignatureCanvas
                            ref={sigCanvas}
                            canvasProps={{
                                width: 500,
                                height: 200,
                                className: 'signature-canvas w-full h-full border rounded'
                            }}
                        />
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={handleClearSignature}>
                            <Eraser className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                        <Button onClick={handleSignatureSave}>
                            <Check className="mr-2 h-4 w-4" />
                            Save Signature
                        </Button>
                    </div>
                </TabsContent>
                
                <TabsContent value="type" className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type your name:</label>
                        <Input
                            value={typedSignature}
                            onChange={(e) => setTypedSignature(e.target.value)}
                            placeholder="Enter your full name"
                            className="text-center text-2xl font-serif"
                            style={{ fontFamily: '"Homemade Apple", cursive' }}
                        />
                    </div>
                    <div className="text-center">
                        <Button onClick={handleSignatureSave}>
                            <Check className="mr-2 h-4 w-4" />
                            Save Signature
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Upload signature image (PNG/JPEG):</label>
                        <Input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    const uri = await signatureFileToDataUri(f);
                                    setUploadedSignatureUri(uri);
                                }
                            }}
                        />
                    </div>
                    {uploadedSignatureUri && (
                        <div className="border rounded-lg p-2 bg-white">
                            <Image
                                src={uploadedSignatureUri}
                                alt="Uploaded signature"
                                width={200}
                                height={100}
                                className="mx-auto"
                            />
                        </div>
                    )}
                    <div className="text-center">
                        <Button onClick={handleSignatureSave}>
                            <Check className="mr-2 h-4 w-4" />
                            Save Signature
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    const renderPlacementStage = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Place Your Signature</h2>
                    <p className="text-muted-foreground">Drag and drop your signature onto the document</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Signature Assets</label>
                        <Button variant="outline" size="sm" onClick={() => setStage('sign')}>
                            <FileSignature className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </div>

                    {signatureAssets.length === 0 && (
                        <p className="text-xs text-muted-foreground">No signatures yet. Click Add to create or upload.</p>
                    )}

                    {signatureAssets.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {signatureAssets.map((asset) => (
                                <div key={asset.id} className={cn("border rounded p-2 bg-white cursor-pointer", activeSignatureId === asset.id && "ring-2 ring-primary")}
                                     onClick={() => setActiveSignatureId(asset.id)}>
                                    <Image src={asset.imageUri} alt="Signature asset" width={120} height={60} className="object-contain mx-auto" />
                                    <div className="flex justify-end gap-2 mt-1">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setActiveSignatureId(asset.id); }}>
                                            Select
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSignatureAssets(prev => prev.filter(a => a.id !== asset.id)); if (activeSignatureId === asset.id) setActiveSignatureId(null); }}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    { (activeSignatureId || signatureAssets[0]) && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Drag to place:</label>
                            <div className="border rounded-lg p-2 bg-white">
                                <Image
                                    src={(signatureAssets.find(a => a.id === activeSignatureId) || signatureAssets[0])!.imageUri}
                                    alt="Active signature"
                                    width={150}
                                    height={75}
                                    className="mx-auto cursor-move"
                                    draggable
                                    onDragStart={handleDragStart}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Drag this onto the PDF page
                            </p>
                        </div>
                    )}

                    {placedSignatures.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Placed Signatures:</label>
                            <div className="space-y-1">
                                {placedSignatures.map((sig) => (
                                    <div key={sig.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                                        <span>Page {sig.pageIndex + 1}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveSignature(sig.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date Options</label>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={includeDate} onChange={(e) => setIncludeDate(e.target.checked)} />
                            <span className="text-sm">Include date near signature</span>
                        </div>
                        {includeDate && (
                            <div className="grid grid-cols-3 gap-2">
                                <Input type="number" value={dateOffsetX} onChange={(e) => setDateOffsetX(Number(e.target.value))} placeholder="Offset X" />
                                <Input type="number" value={dateOffsetY} onChange={(e) => setDateOffsetY(Number(e.target.value))} placeholder="Offset Y" />
                                <Input type="number" value={dateFontSize} onChange={(e) => setDateFontSize(Number(e.target.value))} placeholder="Font size" />
                            </div>
                        )}
                    </div>

                    <Button onClick={handleApplySignatures} disabled={isLoading || placedSignatures.length === 0} className="w-full">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing...</> : <><Wand2 className="mr-2 h-4 w-4" /> Apply Signatures</>}
                    </Button>
                </div>

                <div className="lg:col-span-3">
                    <div className="border rounded-lg overflow-hidden bg-gray-100">
                        {file && (
                            <div className="relative">
                                <div className="flex items-center justify-between p-2 bg-white border-b">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                            disabled={pageNumber <= 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm">
                                            Page {pageNumber} of {numPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                                            disabled={pageNumber >= numPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div 
                                    className="relative overflow-auto max-h-[600px]"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                                >
                                    <Document
                                        file={file}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            onLoadSuccess={onPageLoadSuccess}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                    
                                    {/* Render placed signatures for current page */}
                                    {placedSignatures
                                        .filter(sig => sig.pageIndex === pageNumber - 1)
                                        .map((sig) => (
                                            <Rnd
                                                key={sig.id}
                                                size={{ width: sig.width, height: sig.height }}
                                                position={{ x: sig.x, y: sig.y }}
                                                onDragStop={(e, d) => {
                                                    setPlacedSignatures(prev =>
                                                        prev.map(s => s.id === sig.id ? { ...s, x: d.x, y: d.y } : s)
                                                    );
                                                }}
                                                onResizeStop={(e, direction, ref, delta, position) => {
                                                    setPlacedSignatures(prev =>
                                                        prev.map(s => s.id === sig.id ? {
                                                            ...s,
                                                            width: parseInt(ref.style.width),
                                                            height: parseInt(ref.style.height),
                                                            ...position,
                                                        } : s)
                                                    );
                                                }}
                                                bounds="parent"
                                                className={cn(
                                                    "border-2 border-dashed border-primary/50 bg-primary/10",
                                                    activeSignatureId === sig.assetId && "border-primary border-solid"
                                                )}
                                                onClick={() => setActiveSignatureId(sig.assetId)}
                                            >
                                                <Image
                                                    src={(signatureAssets.find(a => a.id === sig.assetId) || signatureAssets[0])?.imageUri || ''}
                                                    alt="Placed signature"
                                                    fill
                                                    className="object-contain pointer-events-none"
                                                />
                                            </Rnd>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDownloadStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-12 w-12 text-green-600" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">PDF Signed Successfully!</h2>
                <p className="text-muted-foreground">Your document has been signed and is ready for download</p>
            </div>
            <div className="space-y-4">
                <Button onClick={handleDownload} className="w-full max-w-xs">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Signed PDF
                </Button>
                <Button variant="outline" onClick={handleStartOver} className="w-full max-w-xs">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sign Another Document
                </Button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (stage) {
            case 'upload':
                return renderUploadStage();
            case 'sign':
                return renderSignatureStage();
            case 'place':
                return renderPlacementStage();
            case 'download':
                return renderDownloadStage();
            default:
                return renderUploadStage();
        }
    };

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

    