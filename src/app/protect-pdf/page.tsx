
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, KeyRound, FileText, CheckCircle, Eye, EyeOff, Sparkles, Zap, Shield, Lock } from "lucide-react";
import { protectPdf } from '@/lib/actions/protect-pdf';
import { useToast } from '@/hooks/use-toast';
import type { ProtectPdfInput, ProtectPdfOutput } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';
// ToolSections and useToolSections removed as part of home-only sections architecture

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  name: string;
}

const FAQ = () => (
  <ModernSection
    title="AI-Enhanced PDF Security"
    subtitle="Frequently Asked Questions"
    icon={<Shield className="h-6 w-6" />}
    className="mt-12"
    contentClassName="w-full"
  >
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>How strong is the password protection?</AccordionTrigger>
        <AccordionContent>
          Our AI-powered tool uses advanced PDF encryption standards to protect your file. It's strong enough to prevent unauthorized users who don't have the password from opening and viewing the document. For maximum security, we recommend using a long, complex password with a mix of letters, numbers, and symbols.
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
      <AccordionItem value="item-4">
        <AccordionTrigger>How does AI enhance the protection process?</AccordionTrigger>
        <AccordionContent>
          Our AI algorithms optimize the encryption process, automatically select the best security settings for your document, and ensure maximum compatibility while maintaining the highest level of protection for your sensitive content.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function ProtectPdfPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);
  const [result, setResult] = useState<ProtectPdfOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile({ file: selectedFile, name: selectedFile.name });
      setResult(null);
      setPassword('');
      setConfirmPassword('');
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a PDF file. Only PDF files are accepted.", 
        variant: "destructive" 
      });
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
    <ModernPageLayout
      title="PDF Password Protector"
      description="Secure your PDFs with AI-powered encryption and password protection"
      icon={<Lock className="h-8 w-8" />}
      backgroundVariant="home"
    >
      <ModernSection
        className="text-center"
      >
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Upload Area */}
          {!file && (
            <ModernUploadArea
              onFileSelect={handleFileChange}
              accept="application/pdf"
              title="Upload PDF to Protect"
              subtitle="Select a PDF file to add password protection"
              icon={<FileText className="h-12 w-12 text-primary/60" />}
            />
          )}

          {/* File Info and Password Setup */}
          {file && !result && (
            <div className="space-y-6">
              {/* File Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">{file.name}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Ready for password protection
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Setup */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Set Password Protection</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-base font-medium">
                        Create Password
                      </Label>
                      <div className="relative">
                        <Input 
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-12 h-12 text-base"
                        />
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-base font-medium">
                        Confirm Password
                      </Label>
                      <Input 
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleProtect}
                    disabled={isProtecting || !password || !confirmPassword}
                    className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isProtecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Protecting PDF...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Protect PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && file && (
            <ModernSection
              title="PDF Successfully Protected!"
              subtitle="Your PDF is now secured with password protection"
              icon={<Sparkles className="h-6 w-6" />}
              className="mt-8"
            >
              <div className="space-y-6">
                {/* Success Indicator */}
                <div className="flex justify-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                  <div className="text-center">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      {file.name.replace('.pdf', '-protected.pdf')}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Password protection has been applied
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Protected PDF
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Protect Another PDF
                  </Button>
                </div>
              </div>
            </ModernSection>
          )}
        </div>
      </ModernSection>

      {/* Tool-specific sections removed (home-only CMS sections) */}

      <ToolHowtoRenderer slug="protect-pdf" />
      <FAQ />
      <ToolCustomSectionRenderer slug="protect-pdf" />
      <AllTools />
    </ModernPageLayout>
  );
}
