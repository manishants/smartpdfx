"use client";

import { useState, useMemo } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { CompressImageOutput } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { AllTools } from '@/components/all-tools';
import Link from 'next/link';
import { compressImage } from '@/lib/actions/compress-image';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
}

const ToolDescription = () => (
    <div className="max-w-4xl mx-auto my-12 text-center">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Smart Image Compression</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Our smart image compressor uses a powerful lossy compression technique to reduce the file size of your JPG, PNG, and WEBP images by up to 90%. By intelligently decreasing the number of colors in the image, we can shrink the file size dramatically while maintaining excellent visual quality. This is perfect for optimizing images for your website, sharing them via email, or saving storage space.
                </p>
                <p>
                    <strong>How to Use:</strong> Upload your image, and our tool automatically finds the best balance between file size and quality to significantly reduce its size. For specific size targets, try our dedicated <Link href="/under-100kb-image" className="text-primary hover:underline">Under 100KB Image</Link> or <Link href="/under-30kb-image" className="text-primary hover:underline">Under 30KB Image</Link> tools.
                </p>
            </CardContent>
        </Card>
    </div>
);

export default function CompressImagePage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressImageOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile({
          file: selectedFile,
          preview: URL.createObjectURL(selectedFile),
        });
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile({
          file: droppedFile,
          preview: URL.createObjectURL(droppedFile),
        });
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      }
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select an image to compress.", variant: "destructive" });
        return;
    }
    setIsCompressing(true);
    setResult(null);
    try {
      const imageUri = await fileToDataUri(file.file);
      // For this generic page, we don't set a target size, so it will do a percentage reduction.
      const compressionResult = await compressImage({ imageUri });
      
      if (compressionResult) {
        setResult(compressionResult);
      } else {
        throw new Error("Compression returned no data.");
      }
    } catch (error) {
      console.error("Compression failed:", error);
      toast({
        title: "Compression Failed",
        description: "Something went wrong while compressing your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
    }
  };
  
  const getFileExtensionFromMimeType = (dataUri: string) => {
    const mimeType = dataUri.substring(dataUri.indexOf(':') + 1, dataUri.indexOf(';'));
    if (mimeType === 'image/jpeg') return 'jpg';
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';
    return 'jpg'; // fallback
  }

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const newExtension = getFileExtensionFromMimeType(result.compressedImageUri);
      const newFilename = `${originalFilename}-compressed.${newExtension}`;
      
      const a = document.createElement('a');
      a.href = result.compressedImageUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsCompressing(false);
  };

  const compressionPercentage = useMemo(() => {
    if (!result || !result.originalSize) return 0;
    return Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100);
  }, [result]);

  return (
    <>
    <div className="space-y-8 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Image Compressor</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Reduce the file size of your images by up to 90%.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!file && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Drag & drop an image here, or click to select a file</p>
                <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, GIF, WEBP</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {file && !result && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
                   <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
                </div>
                 <div className="text-center">
                    <p className="font-semibold">{file.file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatBytes(file.file.size)}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleCompress}
                  disabled={isCompressing}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                   ) : "Compress Image"}
                </Button>
              </div>
            )}

            {result && file && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Original Image */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-lg font-semibold">Original</h3>
                  <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                     <Image src={file.preview} alt="Original preview" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                  <Badge variant="secondary">{formatBytes(result.originalSize)}</Badge>
                </div>

                <div className="flex flex-col items-center gap-4 my-8 md:my-0">
                    <ArrowRight className="h-8 w-8 text-primary hidden md:block" />
                    <Badge variant="default" className="text-base py-1 px-3">
                        - {compressionPercentage}%
                    </Badge>
                </div>

                {/* Compressed Image */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-lg font-semibold">Compressed</h3>
                   <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                    <Image src={result.compressedImageUri} alt="Compressed preview" width={400} height={300} className="w-full h-auto object-contain" />
                  </div>
                  <Badge variant="secondary" className="text-green-600 font-bold">{formatBytes(result.compressedSize)}</Badge>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-8 text-center space-x-4">
                  <Button size="lg" onClick={handleDownload}>
                    <FileDown className="mr-2" />
                    Download
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleReset}>
                    <RefreshCw className="mr-2" />
                    Compress Another
                  </Button>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ToolDescription />
    </div>
    <AllTools />
    </>
  );
}
