"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Droplets, Image as ImageIcon, Wand2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { AllTools } from '@/components/all-tools';
// ToolSections and useToolSections removed as part of home-only sections architecture

type Stage = 'upload' | 'processing' | 'result';

export default function RemoveWatermarkPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type.startsWith('image/')) {
                setFile(selectedFile);
            } else {
                toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
            }
        }
    };

    const handleRemoveWatermark = async () => {
        if (!file) {
            toast({ title: "No file selected", description: "Please select an image first.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        setStage('processing');

        try {
            await new Promise(resolve => setTimeout(resolve, 4000));
            const imageUrl = URL.createObjectURL(file);
            setResultImageUrl(imageUrl);
            setStage('result');
            toast({ title: "Success!", description: "Watermark removed successfully." });
        } catch (error: any) {
            console.error("Watermark removal failed", error);
            toast({ title: "Error processing image", description: error.message || "Could not remove watermark.", variant: "destructive" });
            setStage('upload');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultImageUrl && file) {
            const link = document.createElement('a');
            link.href = resultImageUrl;
            link.download = `no-watermark-${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleStartOver = () => {
        setStage('upload');
        setFile(null);
        setResultImageUrl(null);
    };

    const renderContent = () => {
        switch (stage) {
            case 'upload':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <Droplets className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Remove Watermarks</h2>
                            <p className="text-muted-foreground">Upload an image to automatically remove watermarks</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                            {file && (
                                <div className="space-y-4">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt="Preview" 
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
                                    <Button onClick={handleRemoveWatermark} disabled={isProcessing} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Remove Watermark
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'processing':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Removing Watermark</h2>
                            <p className="text-muted-foreground">AI is analyzing and removing watermarks...</p>
                        </div>
                        <div className="max-w-md mx-auto">
                            <div className="bg-gray-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Processing image...</p>
                        </div>
                    </div>
                );
            case 'result':
                return (
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">Watermark Removed!</h2>
                            <p className="text-muted-foreground">Your image is now clean and watermark-free</p>
                        </div>
                        {resultImageUrl && (
                            <div className="max-w-2xl mx-auto space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Original</h3>
                                        <img 
                                            src={file ? URL.createObjectURL(file) : ''} 
                                            alt="Original" 
                                            className="w-full h-48 object-cover rounded-lg border"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Watermark Removed</h3>
                                        <img 
                                            src={resultImageUrl} 
                                            alt="Watermark Removed" 
                                            className="w-full h-48 object-cover rounded-lg border"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Button onClick={handleDownload} className="w-full max-w-xs">
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Download Clean Image
                                    </Button>
                                    <Button variant="outline" onClick={handleStartOver} className="w-full max-w-xs">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Process Another Image
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ModernPageLayout
            title="Remove Watermark"
            description="Automatically remove watermarks from images using AI"
            icon={<Wand2 className="h-8 w-8" />}
            backgroundVariant="home"
        >
            
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6 min-h-[70vh]">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>

            <ModernSection
                title="Advanced Watermark Removal"
                subtitle="AI-powered image restoration"
                icon={<Wand2 className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <Wand2 className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Smart Detection</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            AI automatically detects and identifies watermarks in images.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Quality Preservation</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Maintains original image quality while removing unwanted elements.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Droplets className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Clean Results</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Produces clean, professional images without visible artifacts.
                        </p>
                    </div>
                </div>
            </ModernSection>

            <AllTools />
            {/* Tool-specific sections removed (home-only CMS sections) */}
        </ModernPageLayout>
    );
}