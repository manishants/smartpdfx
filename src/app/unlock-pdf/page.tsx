
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, KeyRound, FileType, CheckCircle, Eye, EyeOff } from "lucide-react";
import { unlockPdf } from '@/lib/actions/unlock-pdf';
import { useToast } from '@/hooks/use-toast';
import type { UnlockPdfInput, UnlockPdfOutput } from '@/lib/types';
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
                <AccordionTrigger>What kind of PDF protection can this tool remove?</AccordionTrigger>
                <AccordionContent>
                    This tool is designed to remove the "user password" or "open password," which is the password required to open and view a PDF file. It does not remove "owner passwords" or permission restrictions (like restrictions on printing or copying) if no open password is set.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is it legal to remove a password from a PDF?</AccordionTrigger>
                <AccordionContent>
                    You should only use this tool on PDFs that you own or have the legal right to decrypt. Removing a password from a document that you are not authorized to access may be illegal. Please use this service responsibly.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Are my files secure during the unlock process?</AccordionTrigger>
                <AccordionContent>
                    Yes. We use a secure HTTPS connection for all file uploads. Your PDF is processed on our servers and then permanently deleted one hour later. We do not store your files or your password.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function UnlockPdfPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [result, setResult] = useState<UnlockPdfOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile({ file: selectedFile, name: selectedFile.name });
        setResult(null);
        setPassword('');
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

  const handleUnlock = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a PDF to unlock.", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Password required", description: "Please enter the password for the PDF.", variant: "destructive" });
      return;
    }
    setIsUnlocking(true);
    setResult(null);
    try {
      const pdfUri = await fileToDataUri(file.file);
      const input: UnlockPdfInput = { pdfUri, password };
      
      const unlockResult = await unlockPdf(input);
      
      if (unlockResult && unlockResult.unlockedPdfUri) {
        setResult(unlockResult);
      } else {
        throw new Error("Unlocking returned no data.");
      }
    } catch (error: any) {
      console.error("Unlocking failed:", error);
      toast({
        title: "Unlocking Failed",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      const originalFilename = file.name.substring(0, file.name.lastIndexOf('.'));
      const newFilename = `${originalFilename}-unlocked.pdf`;
      
      const a = document.createElement('a');
      a.href = result.unlockedPdfUri;
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
    setShowPassword(false);
    setIsUnlocking(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Unlock PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Remove password protection from your PDF file.
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
                <p className="mt-4 font-semibold text-primary">Drag & drop a protected PDF here</p>
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
                <div className="w-full max-w-sm space-y-2">
                  <Label htmlFor="password">PDF Password</Label>
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
                <Button 
                  size="lg" 
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unlocking...
                    </>
                   ) : <><KeyRound className="mr-2"/> Unlock PDF</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">PDF Unlocked!</h2>
                 <p className="text-muted-foreground">The password has been removed from {file.name}.</p>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={handleDownload}>
                      <FileDown className="mr-2" />
                      Download Unlocked PDF
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Unlock Another
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
