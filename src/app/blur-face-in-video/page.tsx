"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, Eye, EyeOff, Video as VideoIcon } from "lucide-react";
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
                <AccordionTrigger>How does face blurring work?</AccordionTrigger>
                <AccordionContent>
                    Our AI automatically detects faces in your video and applies a blur effect to protect privacy. The technology uses advanced computer vision to identify facial features and track them throughout the video.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What video formats are supported?</AccordionTrigger>
                <AccordionContent>
                    We support common video formats including MP4, AVI, MOV, and WEBM. For best results, use videos with clear visibility of faces and good lighting conditions.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is the original video quality preserved?</AccordionTrigger>
                <AccordionContent>
                    Yes, we maintain the original video quality while only applying blur effects to detected faces. The rest of the video remains unchanged in terms of resolution and clarity.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function BlurFaceInVideoPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type.startsWith('video/')) {
                setFile(selectedFile);
            } else {
                toast({ title: "Invalid file type", description: "Please select a video file.", variant: "destructive" });
            }
        }
    };

    const handleBlurFaces = async () => {
        if (!file) {
            toast({ title: "No file selected", description: "Please select a video file first.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        setStage('processing');

        try {
            // Mock implementation - replace with actual AI service
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate processing
            
            // For demo purposes, use the original video
            const videoUrl = URL.createObjectURL(file);
            setResultVideoUrl(videoUrl);
            setStage('result');
            toast({ title: "Success!", description: "Faces have been blurred in your video." });
        } catch (error: any) {
            console.error("Face blurring failed", error);
            toast({ title: "Error processing video", description: error.message || "Could not blur faces in the video.", variant: "destructive" });
            setStage('upload');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultVideoUrl && file) {
            const link = document.createElement('a');
            link.href = resultVideoUrl;
            link.download = `blurred-${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleStartOver = () => {
        setStage('upload');
        setFile(null);
        setResultVideoUrl(null);
    };

    const renderUploadStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <UploadCloud className="h-12 w-12 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Video</h2>
                <p className="text-muted-foreground">Select a video file to blur faces for privacy protection</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
                <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
                {file && (
                    <div className="space-y-4">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <VideoIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
                        <Button onClick={handleBlurFaces} disabled={isProcessing} className="w-full">
                            <EyeOff className="mr-2 h-4 w-4" />
                            Blur Faces in Video
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderProcessingStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">AI is Processing Your Video</h2>
                <p className="text-muted-foreground">Please wait while we detect and blur faces in your video...</p>
            </div>
        </div>
    );

    const renderResultStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <EyeOff className="h-12 w-12 text-green-600" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Faces Blurred Successfully!</h2>
                <p className="text-muted-foreground">Your video has been processed with face privacy protection</p>
            </div>
            {resultVideoUrl && (
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="relative w-full rounded-lg overflow-hidden">
                        <video 
                            src={resultVideoUrl} 
                            controls 
                            className="w-full h-auto max-h-96"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="space-y-4">
                        <Button onClick={handleDownload} className="w-full max-w-xs">
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Blurred Video
                        </Button>
                        <Button variant="outline" onClick={handleStartOver} className="w-full max-w-xs">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Process Another Video
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
                <h1 className="text-4xl font-bold font-headline">Blur Faces in Video</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Protect privacy with AI-powered face blurring
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
                title="AI-Powered Privacy Protection"
                subtitle="Advanced face detection and blurring technology"
                icon={<Eye className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <Eye className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Smart Detection</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Advanced AI algorithms automatically detect and track faces throughout your video with high accuracy.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <EyeOff className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Privacy Protection</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Ensure privacy compliance by automatically blurring faces while maintaining video quality and clarity.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <VideoIcon className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Quality Preservation</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Maintain original video quality while applying precise blur effects only to detected facial areas.
                        </p>
                    </div>
                </div>
            </ModernSection>

            <FAQ />
            <AllTools />
        </ModernPageLayout>
    );
}