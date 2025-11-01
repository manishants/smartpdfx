
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, RefreshCw, Wand2, FileText, Users, FileDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { extractVoters } from '@/ai/flows/extract-voter-list';
import type { ExtractVotersInput, ExtractVotersOutput, Voter } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function VoterListExtractorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtractVotersOutput | null>(null);
  const { toast } = useToast();

  const isAbortError = (error: any) => {
    const msg = String(error?.message || '');
    return (
      error?.name === 'AbortError' ||
      msg.includes('AbortError') ||
      msg.includes('ERR_ABORTED') ||
      msg.toLowerCase().includes('aborted')
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
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

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a file to analyze.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const fileUri = await fileToDataUri(file);
      const input: ExtractVotersInput = { fileUri };
      
      const analysisResult = await extractVoters(input);
      
      if (analysisResult) {
        setResult(analysisResult);
      } else {
        throw new Error("Analysis process returned no data.");
      }
    } catch (error: any) {
      if (!isAbortError(error)) {
        console.error("Analysis failed:", error);
        toast({
          title: "An Error Occurred",
          description: error.message || "Something went wrong while analyzing the file.",
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsAnalyzing(false);
  };
  
    const handleDownloadExcel = () => {
    if (!result || result.voters.length === 0) {
      toast({ title: "No data to download", description: "Please extract voter data first." });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(result.voters);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voters");
    XLSX.writeFile(workbook, "voter-list.xlsx");
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
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            {!result && !isAnalyzing && (
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
                        />
                    </div>
                    {file && (
                        <div className="flex flex-col items-center gap-4 mt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-5 w-5" />
                                <span>{file.name}</span>
                            </div>
                            <Button 
                                size="lg" 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                            >
                                <Wand2 className="mr-2"/>Extract Voter Data
                            </Button>
                        </div>
                    )}
                 </div>
            )}

            {isAnalyzing && (
                <div className="flex flex-col items-center text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <h2 className="text-2xl font-semibold mt-4">Extracting Voter Data...</h2>
                    <p className="text-muted-foreground">The AI is reading the document. This may take a moment.</p>
                </div>
            )}

            {result && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary"/>
                            <h2 className="text-2xl font-bold">Extracted Voters ({result.voters.length})</h2>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="secondary" onClick={handleDownloadExcel}>
                              <FileDown className="mr-2"/>Download Excel
                           </Button>
                           <Button variant="outline" onClick={handleReset}>
                                <RefreshCw className="mr-2"/>Start Over
                           </Button>
                        </div>
                    </div>

                    <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Voter ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Father/Husband</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Age</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.voters.map((voter) => (
                                    <TableRow key={voter.id}>
                                        <TableCell>{voter.id}</TableCell>
                                        <TableCell>{voter.voterId}</TableCell>
                                        <TableCell>{voter.name}</TableCell>
                                        <TableCell>{voter.fatherOrHusbandName}</TableCell>
                                        <TableCell>{voter.gender}</TableCell>
                                        <TableCell>{voter.age}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

          </CardContent>
        </Card>
      </div>
    </main>
    <AllTools />
    </>
  );
}
