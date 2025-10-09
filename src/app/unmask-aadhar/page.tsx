
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, ShieldCheck, FileType, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { maskAadharInPdf } from '@/ai/flows/mask-aadhar-in-pdf';
import { maskAadharInImage } from '@/ai/flows/mask-aadhar-in-image';
import { AllTools } from '@/components/all-tools';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
  type: 'pdf' | 'image';
}

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Secure Your Identity: Mask Aadhar Numbers</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Protecting your personal information is more important than ever. Our Aadhar Masking tool provides a crucial layer of security by automatically detecting and blacking out the first 8 digits of the Aadhar number on any uploaded document, whether it's an image or a PDF. This leaves only the last 4 digits visible, which is sufficient for verification purposes in most cases, while safeguarding your full identity.
                </p>
                <p>
                    <strong>How it Works:</strong> Upload a JPG, PNG, or PDF file containing an Aadhar card. Our AI model will locate the 12-digit number and apply a precise black mask over the first two blocks of digits. The processed, secure file is then available for immediate download. If you need to remove protection, you can try our <Link href="/unlock-pdf" className="text-primary hover:underline">Unlock PDF</Link> tool.
                </p>
                <p className="text-sm">
                    This privacy tool is free for everyone. To help us maintain this service, please consider a <Link href="#" className="text-primary font-bold hover:underline">Donation of just ₹1</Link>. Your support is invaluable.
                </p>
            </CardContent>
        </Card>
    </div>
);

export default function MaskAadharPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isMasking, setIsMasking] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      processFile(selectedFile);
    }
  };
  
  const processFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/')) {
       setFile({
         file: selectedFile,
         preview: URL.createObjectURL(selectedFile),
         type: 'image'
       });
       setResultUri(null);
    } else if (selectedFile.type === 'application/pdf') {
       setFile({
         file: selectedFile,
         preview: '', // No preview for PDF
         type: 'pdf'
       });
       setResultUri(null);
    } else {
      toast({ title: "Invalid file type", description: "Please select an image or PDF file.", variant: "destructive" });
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      processFile(droppedFile);
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

  const handleMask = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a file to mask.", variant: "destructive" });
        return;
    }
    setIsMasking(true);
    setResultUri(null);
    try {
      const fileUri = await fileToDataUri(file.file);
      
      let result;
      if (file.type === 'pdf') {
        result = await maskAadharInPdf({ pdfUri: fileUri });
        if (result && result.maskedPdfUri) {
          setResultUri(result.maskedPdfUri);
        } else {
           throw new Error("Masking returned no data or an invalid URI.");
        }
      } else {
        result = await maskAadharInImage({ imageUri: fileUri });
        if (result && result.maskedImageUri) {
          setResultUri(result.maskedImageUri);
        } else {
           throw new Error("Masking returned no data or an invalid URI.");
        }
      }
      
    } catch (error: any) {
      console.error("Masking failed:", error);
      toast({
        title: "Masking Failed",
        description: error.message || "Could not detect an Aadhar number. Please try a different file.",
        variant: "destructive"
      });
    } finally {
      setIsMasking(false);
    }
  };
  
  const handleDownload = () => {
    if (resultUri && file) {
      const originalFilename = file.file.name.substring(0, file.file.name.lastIndexOf('.'));
      const extension = file.type === 'pdf' ? 'pdf' : file.file.name.split('.').pop() || 'png';
      const newFilename = `${originalFilename}-masked.${extension}`;
      
      const a = document.createElement('a');
      a.href = resultUri;
      a.download = newFilename;
      document.body.appendChild(a);
a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUri(null);
    setIsMasking(false);
  };

  const renderFilePreview = () => {
    if (!file) return null;

    if (file.type === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
            <FileType className="w-16 h-16 text-primary" />
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.file.name}</p>
        </div>
      );
    }

    if (file.type === 'image') {
       return (
        <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow-md">
            <Image src={file.preview} alt="Original preview" width={600} height={400} className="w-full h-auto object-contain" />
        </div>
      );
    }
  };

  const renderResultPreview = () => {
    if (!resultUri || !file) return null;

     if (file.type === 'pdf') {
      return (
         <div className="text-center flex flex-col items-center gap-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-semibold mt-4">Masking Successful!</h2>
            <p className="text-muted-foreground">The Aadhar number has been masked in {file.file.name}.</p>
         </div>
      );
    }

    if (file.type === 'image') {
       return (
         <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-lg font-semibold">Original</h3>
                <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                    <Image src={file.preview} alt="Original preview" width={400} height={300} className="w-full h-auto object-contain" />
                </div>
            </div>
            <ShieldCheck className="h-8 w-8 text-primary hidden md:block" />
             <div className="flex flex-col items-center gap-2">
                <h3 className="text-lg font-semibold">Masked</h3>
                <div className="relative w-full max-w-xs border rounded-lg overflow-hidden shadow-md">
                    <Image src={resultUri} alt="Masked preview" width={400} height={300} className="w-full h-auto object-contain" />
                </div>
            </div>
         </div>
      );
    }
  }


  return (
    <>
    <div className="px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Mask Aadhar Number</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Protect your privacy by masking the number in your Aadhar file (Image or PDF).
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
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
                <p className="mt-4 font-semibold text-primary">Drag & drop your Aadhar file here</p>
                <p className="text-sm text-muted-foreground mt-1">Supports Images (JPG, PNG) and PDF files</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {file && !resultUri && (
              <div className="flex flex-col items-center gap-6">
                 {renderFilePreview()}
                <Button 
                  size="lg" 
                  onClick={handleMask}
                  disabled={isMasking}
                >
                  {isMasking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing & Masking...
                    </>
                   ) : <><ShieldCheck className="mr-2"/> Mask Aadhar Number</>}
                </Button>
              </div>
            )}

            {resultUri && file && (
               <div className="text-center flex flex-col items-center gap-6">
                 {renderResultPreview()}
                 <div className="mt-6 flex gap-4 justify-center">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Masked File
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Mask Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
        <ToolDescription />
      </div>
    </div>
    <AllTools />
    </>
  );
}
