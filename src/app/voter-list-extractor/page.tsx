
"use client";

import { useState } from 'react';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, RefreshCw, Wand2, FileText, FileType, CheckCircle, Copy, FileDown, Users } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Voter, ExtractVotersInput, ExtractVotersOutput } from '@/lib/types';
import { extractVoterList } from '@/ai/flows/extract-voter-list';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  file: File;
  preview: string;
  type: 'pdf' | 'image';
}

const FAQ = () => (
    <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What type of files can I upload?</AccordionTrigger>
                <AccordionContent>
                    This tool is optimized for scanned images (JPG, PNG) or PDF documents of Indian voter lists. For best results, ensure the image is clear and the text is legible.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>How accurate is the data extraction?</AccordionTrigger>
                <AccordionContent>
                    Our AI model is trained to recognize the specific format of voter lists. While it is highly accurate, OCR technology can sometimes make mistakes, especially with low-quality scans. We recommend double-checking the extracted data for critical applications.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                   Your privacy is our priority. Your uploaded files are sent securely to our servers for AI processing and are permanently deleted one hour after the extraction is complete. We do not store or view your documents.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function VoterListExtractorPage() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ExtractVotersOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile({
          file: selectedFile,
          preview: selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : '',
          type: selectedFile.type.startsWith('image/') ? 'image' : 'pdf',
        });
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select an image or PDF file.", variant: "destructive" });
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

  const handleExtract = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a file to process.", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    setResult(null);
    try {
      const fileUri = await fileToDataUri(file.file);
      const input: ExtractVotersInput = { fileUri };
      
      const extractionResult = await extractVoterList(input);
      
      if (extractionResult && extractionResult.voters) {
        setResult(extractionResult);
      } else {
        throw new Error("Data extraction returned no results.");
      }
    } catch (error: any) {
      console.error("Extraction failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while extracting data. The AI may not have found any voter data.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsExtracting(false);
  };
  
  const handleCopyToClipboard = () => {
    if (result && result.voters) {
        const textToCopy = result.voters.map(voter => `1. Serial no. - ${voter.id}\n2. निर्वाचक का नाम: ${voter.name}\n3. ${voter.fatherOrHusbandName.includes('पति') ? 'पति का नाम' : 'पिता का नाम'}: ${voter.fatherOrHusbandName.split(':').pop()?.trim() || ''}\n4. उम्र : ${voter.age}\n5. लिंग: ${voter.gender}\n6. ${voter.voterId}`).join('\n\n');
        navigator.clipboard.writeText(textToCopy);
        toast({ title: "Copied all data to clipboard!" });
    }
  };

  const handleDownload = async () => {
    if (!result || !result.voters || !file) {
      toast({ title: "No data to download", variant: "destructive" });
      return;
    }

    const { saveAs } = (await import('file-saver'));

    const headers = ["S. NO.", "नाम", "पिता/पति का नाम", "उम्र", "लिंग", "Voter ID"];
    
    const data = result.voters.map(voter => [
        voter.id,
        voter.name,
        voter.fatherOrHusbandName.split(':').pop()?.trim() || '',
        voter.age,
        voter.gender,
        voter.voterId
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Voters");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const fileName = `${file.file.name.split('.')[0]}_voters.xlsx`;
    saveAs(blob, fileName);
  };
  
  const renderUpload = () => {
      return (
        <div className="flex flex-col items-center gap-6">
             <div 
                className="w-full border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
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
                />
            </div>
            {file && (
                <div className="w-full">
                    {file.type === 'image' && file.preview && (
                         <div className="relative w-full border rounded-lg overflow-hidden shadow-md">
                           <Image src={file.preview} alt="Uploaded preview" width={800} height={600} className="w-full h-auto object-contain" />
                        </div>
                    )}
                    {file.type === 'pdf' && (
                         <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                            <FileType className="w-16 h-16 text-primary" />
                            <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.file.name}</p>
                        </div>
                    )}
                </div>
            )}
            
            {file && (
                <Button 
                  className="w-full max-w-xs"
                  size="lg" 
                  onClick={handleExtract}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting Data...
                    </>
                   ) : <><Wand2 className="mr-2"/>Extract Data</>}
                </Button>
            )}
        </div>
      )
  }

  return (
    <>
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Voter List Extractor</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Extract structured data from scanned voter lists using AI.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
             {!result && renderUpload()}
             
             {isExtracting && !result && (
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="text-xl font-semibold">AI is analyzing your document...</h2>
                    <p className="text-muted-foreground">This may take a moment, please wait.</p>
                </div>
             )}

             {result && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <h2 className="text-2xl font-bold">Extraction Complete</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={handleCopyToClipboard}><Copy className="mr-2"/>Copy All</Button>
                            <Button variant="secondary" onClick={handleDownload}><FileDown className="mr-2"/>Download .xlsx</Button>
                            <Button variant="outline" onClick={handleReset}><RefreshCw className="mr-2"/>Start Over</Button>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        {result.voters.map((voter, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{voter.name} (क्र.सं. {voter.id})</span>
                                        <Badge variant="outline">{voter.voterId}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>{voter.fatherOrHusbandName.split(':')[0]}:</strong> {voter.fatherOrHusbandName.split(':').pop()?.trim()}</p>
                                    <p><strong>उम्र:</strong> {voter.age}</p>
                                    <p><strong>लिंग:</strong> {voter.gender}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
             )}
          </CardContent>
        </Card>
        <FAQ />
      </div>
    </main>
    <AllTools />
    </>
  );
}
