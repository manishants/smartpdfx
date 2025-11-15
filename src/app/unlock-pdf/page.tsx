
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, KeyRound, FileText, CheckCircle, Eye, EyeOff, Sparkles, Zap, Shield, Lock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { UnlockPdfInput, UnlockPdfOutput } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';
import { AIPoweredFeatures } from '@/components/ai-powered-features';
import { ProTip } from '@/components/pro-tip';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  name: string;
}

const FAQ = () => (
  <ModernSection
    title="AI-Powered PDF Security"
    subtitle="Frequently Asked Questions"
    icon={<Shield className="h-6 w-6" />}
    className="mt-12"
    contentClassName="w-full"
  >
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
      <AccordionItem value="item-4">
        <AccordionTrigger>How does AI enhance the unlocking process?</AccordionTrigger>
        <AccordionContent>
          Our AI algorithms optimize the decryption process, automatically detect different encryption methods, and ensure the highest success rate while maintaining the integrity of your document's content and formatting.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ModernSection>
);


export default function UnlockPdfPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [result, setResult] = useState<UnlockPdfOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile({ file: selectedFile, name: selectedFile.name });
      setResult(null);
      setPassword('');
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
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
      const res = await fetch('/api/unlock-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unlocking failed. Please verify the password and file.');
      }
      if (data && data.unlockedPdfUri) {
        setResult(data as UnlockPdfOutput);
      } else {
        throw new Error('Unlocking returned no data.');
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
    <ModernPageLayout
      title="PDF Password Remover"
      description="Unlock password-protected PDFs with AI-powered security tools"
      icon={<Lock className="h-8 w-8" />}
      backgroundVariant="home"
    >
      <ModernSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="max-w-2xl mx-auto space-y-8">
          {/* Upload Area */}
          {!file && (
            <ModernUploadArea
              onFileSelect={handleFileChange}
              accept="application/pdf"
              title="Upload Protected PDF"
              subtitle="Select a password-protected PDF file to unlock"
              icon={<FileText className="h-12 w-12 text-primary/60" />}
            />
          )}

          {/* File Info and Password Input */}
          {file && !result && (
            <div className="space-y-6">
              {/* File Display */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100">{file.name}</h3>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Password-protected PDF
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <Label htmlFor="password" className="text-base font-medium">
                      Enter PDF Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter the password to unlock this PDF"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-12 h-12 text-base"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && password) {
                          handleUnlock();
                        }
                      }}
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
                  <Button
                    onClick={handleUnlock}
                    disabled={isUnlocking || !password}
                    className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isUnlocking ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Unlocking PDF...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Unlock PDF
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
              title="PDF Successfully Unlocked!"
              subtitle="Your PDF is now accessible without a password"
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
                      {file.name.replace('.pdf', '-unlocked.pdf')}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Password protection has been removed
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
                    Download Unlocked PDF
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Unlock Another PDF
                  </Button>
                </div>
              </div>
            </ModernSection>
          )}
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <AIPoweredFeatures
              features={[
                'Secure unlocking with privacy protection',
                'Requires correct open password',
                'Preserves formatting and metadata',
                'Fast processing and clear status',
              ]}
            />
            <ProTip tip="Enter the exact viewing password. Owner-only restrictions without an open password aren’t removed; this tool is for authorized access, not password cracking." />
          </div>
        </div>
      </ModernSection>

      {/* Tool-specific sections removed as part of home-only sections refactor */}

      <FAQ />
      <ToolHowtoRenderer slug="unlock-pdf" />
      <ToolCustomSectionRenderer slug="unlock-pdf" />
      <AllTools />
    </ModernPageLayout>
  );
}
