
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, RefreshCw, Wand2, FileText, Users } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';


export default function VoterListExtractorPage() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image or PDF file.", variant: "destructive" });
      }
    }
  };


  return (
    <>
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Voter List Extractor</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Extract structured data from scanned voter lists.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
             <div>
                <div 
                    className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 font-semibold text-primary">Click to upload Image or PDF</p>
                    <Input 
                        id="file-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        disabled
                    />
                </div>
                {file && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                        <FileText className="h-5 w-5" />
                        <span>{file.name}</span>
                    </div>
                )}
             </div>

             <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Feature Currently Disabled</AlertTitle>
                <AlertDescription>
                    This AI-powered tool is currently unavailable. We are working on a non-AI alternative.
                </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </div>
    </main>
    <AllTools />
    </>
  );
}
