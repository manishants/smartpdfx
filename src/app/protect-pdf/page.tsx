
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, KeyRound, FileType, CheckCircle, Eye, EyeOff } from "lucide-react";
import { protectPdf } from '@/lib/actions/protect-pdf';
import { useToast } from '@/hooks/use-toast';
import type { ProtectPdfInput, ProtectPdfOutput } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  name: string;
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>How strong is the password protection?</AccordionTrigger>
                <AccordionContent>
                    Our tool uses standard PDF encryption to protect your file. It's strong enough to prevent unauthorized users who don't have the password from opening and viewing the document. For maximum security, we recommend using a long, complex password with a mix of letters, numbers, and symbols.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What happens if I forget my password?</AccordionTrigger>
                <AccordionContent>
                    We do not store your password or your files on our servers. This means that if you forget the password you set, we cannot help you recover it. Please make sure to store your password in a safe place. You can use our <a href="/unlock-pdf" className="text-primary underline">Unlock PDF</a> tool if you have the password.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my uploaded files secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. We take your privacy very seriously. Your PDF is uploaded over a secure connection (HTTPS), processed on our server to apply the password, and then permanently deleted one hour later.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function ProtectPdfPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);
  const [result, setResult] = useState<ProtectPdfOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile({ file: selectedFile, name: selectedFile.name });
        setResult(null);
        setPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
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
      if (droppedFile.type === 'application/pdf') {
        setFile({ file: droppedFile, name: droppedFile.name });
        setResult(null);
        setPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" });
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

  const handleProtect = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a PDF to protect.", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Password required", description: "Please enter a password for the PDF.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
        toast({ title: "Passwords do not match", description: "Please ensure both passwords are the same.", variant: "destructive" });
        return;
    }

    setIsProtecting(true);
    setResult(null);
    try {
      const pdfUri = await fileToDataUri(file.file);
      const input: ProtectPdfInput = { pdfUri, password };
      
      const protectResult = await protectPdf(input);
      
      if (protectResult && protectResult.protectedPdfUri) {
        setResult(protectResult);
      } else {
        throw new Error("Protection returned no data.");
      }
    } catch (error: any) {
      console.error("Protection failed:", error);
      toast({
        title: "Protection Failed",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProtecting(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-protected.pdf`;
      
      const a = document.createElement('a');
      a.href = result.protectedPdfUri;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setIsProtecting(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Protect PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Add a password and encrypt your PDF file.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto">
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
                <p className="mt-4 font-semibold text-primary">Drag & drop a PDF here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {file && !result && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                </div>
                <div className="w-full max-w-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Set a Password</Label>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                       <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleProtect}
                  disabled={isProtecting}
                >
                  {isProtecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Protecting...
                    </>
                   ) : <><KeyRound className="mr-2"/> Protect PDF</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">PDF Protected!</h2>
                 <p className="text-muted-foreground">A password has been added to {file.name}.</p>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Protected PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Protect Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
