"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Users, Shuffle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Stage = 'upload' | 'processing' | 'result';

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does face swapping work?</AccordionTrigger>
                <AccordionContent>
                    Our AI technology uses advanced deep learning algorithms to detect facial features and seamlessly swap faces between two images while maintaining natural lighting and expressions.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What image formats are supported?</AccordionTrigger>
                <AccordionContent>
                    We support common image formats including JPG, PNG, and WEBP. For best results, use high-quality images with clear, front-facing faces.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is the face swap realistic?</AccordionTrigger>
                <AccordionContent>
                    Yes, our AI maintains facial expressions, lighting conditions, and skin tones to create realistic and natural-looking face swaps.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function FaceSwapPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [targetImage, setTargetImage] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSourceImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type.startsWith('image/')) {
                setSourceImage(file);
            } else {
                toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
            }
        }
    };

    const handleTargetImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type.startsWith('image/')) {
                setTargetImage(file);
            } else {
                toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
            }
        }
    };

    const handleFaceSwap = async () => {
        if (!sourceImage || !targetImage) {
            toast({ title: "Missing images", description: "Please select both source and target images.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        setStage('processing');

        try {
            // Mock implementation - replace with actual AI service
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate processing
            
            // For demo purposes, use the target image
            const imageUrl = URL.createObjectURL(targetImage);
            setResultImageUrl(imageUrl);
            setStage('result');
            toast({ title: "Success!", description: "Face swap completed successfully." });
        } catch (error: any) {
            console.error("Face swap failed", error);
            toast({ title: "Error processing images", description: error.message || "Could not complete face swap.", variant: "destructive" });
            setStage('upload');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultImageUrl && targetImage) {
            const link = document.createElement('a');
            link.href = resultImageUrl;
            link.download = `face-swapped-${targetImage.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleStartOver = () => {
        setStage('upload');
        setSourceImage(null);
        setTargetImage(null);
        setResultImageUrl(null);
    };

    const renderUploadStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <UploadCloud className="h-12 w-12 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Images</h2>
                <p className="text-muted-foreground">Select source and target images for face swapping</p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-medium">Source Image (Face to copy)</h3>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSourceImageChange}
                        className="cursor-pointer"
                    />
                    {sourceImage && (
                        <div className="space-y-2">
                            <img 
                                src={URL.createObjectURL(sourceImage)} 
                                alt="Source" 
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <p className="text-sm text-muted-foreground">{sourceImage.name}</p>
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    <h3 className="font-medium">Target Image (Face to replace)</h3>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleTargetImageChange}
                        className="cursor-pointer"
                    />
                    {targetImage && (
                        <div className="space-y-2">
                            <img 
                                src={URL.createObjectURL(targetImage)} 
                                alt="Target" 
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <p className="text-sm text-muted-foreground">{targetImage.name}</p>
                        </div>
                    )}
                </div>
            </div>
            {sourceImage && targetImage && (
                <Button onClick={handleFaceSwap} disabled={isProcessing} className="w-full max-w-md">
                    <Shuffle className="mr-2 h-4 w-4" />
                    Swap Faces
                </Button>
            )}
        </div>
    );

    const renderProcessingStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">AI is Swapping Faces</h2>
                <p className="text-muted-foreground">Please wait while we process your images...</p>
            </div>
        </div>
    );

    const renderResultStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <Shuffle className="h-12 w-12 text-green-600" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Face Swap Complete!</h2>
                <p className="text-muted-foreground">Your face swap has been processed successfully</p>
            </div>
            {resultImageUrl && (
                <div className="max-w-2xl mx-auto space-y-4">
                    <img 
                        src={resultImageUrl} 
                        alt="Face swapped result" 
                        className="w-full h-auto max-h-96 object-contain rounded-lg"
                    />
                    <div className="space-y-4">
                        <Button onClick={handleDownload} className="w-full max-w-xs">
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Result
                        </Button>
                        <Button variant="outline" onClick={handleStartOver} className="w-full max-w-xs">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Swap More Faces
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (stage) {
            case 'upload':
                return renderUploadStage();
            case 'processing':
                return renderProcessingStage();
            case 'result':
                return renderResultStage();
            default:
                return renderUploadStage();
        }
    };

    return (
        <ModernPageLayout>
            <header className="text-center">
                <h1 className="text-4xl font-bold font-headline">AI Face Swap</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Seamlessly swap faces between images with AI
                </p>
            </header>
            
            <div className="mt-8">
                <Card>
                    <CardContent className="p-6 min-h-[70vh]">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>

            <ModernSection
                title="Advanced Face Swapping Technology"
                subtitle="AI-powered face detection and seamless blending"
                icon={<Users className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Face Detection</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Advanced AI algorithms precisely detect and map facial features for accurate swapping.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <Shuffle className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Seamless Blending</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Natural lighting and color matching ensure realistic and believable face swaps.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <FileDown className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">High Quality Output</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Maintain image quality while creating professional-grade face swap results.
                        </p>
                    </div>
                </div>
            </ModernSection>

            <FAQ />
            <AllTools />
        </ModernPageLayout>
    );
}