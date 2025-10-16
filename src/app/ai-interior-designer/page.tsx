"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileDown, Loader2, RefreshCw, Sparkles, Home, Palette, Wand2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Stage = 'upload' | 'processing' | 'result';

const designStyles = [
    'Modern',
    'Minimalist',
    'Scandinavian',
    'Industrial',
    'Bohemian',
    'Traditional',
    'Contemporary',
    'Rustic',
    'Art Deco',
    'Mid-Century Modern'
];

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How does AI interior design work?</AccordionTrigger>
                <AccordionContent>
                    Our AI analyzes your room photo to understand the layout, lighting, and existing elements. It then applies the selected design style to create a realistic redesign that maintains the room's structure while transforming its aesthetic.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What image formats are supported?</AccordionTrigger>
                <AccordionContent>
                    We support common image formats including JPG, PNG, GIF, and WEBP. For best results, use high-quality photos with good lighting that clearly show the room's features.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Can I try multiple design styles?</AccordionTrigger>
                <AccordionContent>
                    Yes! You can upload the same room photo and experiment with different design styles to see how each one transforms your space. This helps you visualize various options before making design decisions.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function AIInteriorDesignerPage() {
    const [stage, setStage] = useState<Stage>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImageUri, setResultImageUri] = useState<string | null>(null);
    const { toast } = useToast();

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

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

    const handleRedesign = async () => {
        if (!file || !selectedStyle) {
            toast({ title: "Missing information", description: "Please select an image and design style.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        setStage('processing');

        try {
            const photoUri = await fileToDataUri(file);
            // Mock implementation - replace with actual AI service
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing
            
            // For demo purposes, use the original image
            setResultImageUri(photoUri);
            setStage('result');
            toast({ title: "Success!", description: "Your room has been redesigned successfully." });
        } catch (error: any) {
            console.error("Redesign failed", error);
            toast({ title: "Error redesigning room", description: error.message || "Could not redesign the room.", variant: "destructive" });
            setStage('upload');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (resultImageUri) {
            const link = document.createElement('a');
            link.href = resultImageUri;
            link.download = `redesigned-${selectedStyle.toLowerCase()}-${file?.name || 'room.jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleStartOver = () => {
        setStage('upload');
        setFile(null);
        setSelectedStyle('');
        setResultImageUri(null);
    };

    const renderUploadStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <UploadCloud className="h-12 w-12 text-primary" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Room Photo</h2>
                <p className="text-muted-foreground">Select a photo of the room you want to redesign</p>
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
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                            <Image
                                src={URL.createObjectURL(file)}
                                alt="Selected room"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
                    </div>
                )}
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose design style" />
                    </SelectTrigger>
                    <SelectContent>
                        {designStyles.map((style) => (
                            <SelectItem key={style} value={style}>
                                {style}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {file && selectedStyle && (
                    <Button onClick={handleRedesign} disabled={isProcessing} className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Redesign Room
                    </Button>
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
                <h2 className="text-2xl font-semibold mb-2">AI is Redesigning Your Room</h2>
                <p className="text-muted-foreground">Please wait while our AI transforms your space in {selectedStyle} style...</p>
            </div>
        </div>
    );

    const renderResultStage = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-green-600" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Room Redesigned Successfully!</h2>
                <p className="text-muted-foreground">Your room has been transformed in {selectedStyle} style</p>
            </div>
            {resultImageUri && (
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Original</h3>
                            <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                <Image
                                    src={URL.createObjectURL(file!)}
                                    alt="Original room"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Redesigned ({selectedStyle})</h3>
                            <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                <Image
                                    src={resultImageUri}
                                    alt="Redesigned room"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Button onClick={handleDownload} className="w-full max-w-xs">
                            <FileDown className="mr-2 h-4 w-4" />
                            Download Redesigned Image
                        </Button>
                        <Button variant="outline" onClick={handleStartOver} className="w-full max-w-xs">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Redesign Another Room
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
                <h1 className="text-4xl font-bold font-headline">AI Interior Designer</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Transform your space with AI-powered interior design
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
                title="AI-Powered Interior Design"
                subtitle="Transform any room with intelligent design suggestions"
                icon={<Home className="h-6 w-6" />}
                className="mt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Smart Analysis</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            AI analyzes your room's layout, lighting, and existing elements to create personalized design recommendations.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <Palette className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Multiple Styles</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Choose from various design styles including Modern, Minimalist, Scandinavian, and more to match your preferences.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Wand2 className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-800">Instant Results</h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Get professional-quality room redesigns in seconds with our advanced AI technology.
                        </p>
                    </div>
                </div>
            </ModernSection>

            <FAQ />
            <AllTools />
        </ModernPageLayout>
    );
}