
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, RefreshCw, Wand2, FileText, Users, FileDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { ExtractVotersOutput, Voter } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
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
  const [processedPages, setProcessedPages] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
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

  // Retry helper for Genkit calls to handle 429/quota with exponential backoff
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const shouldRetry = (error: any) => {
    const msg = String(error?.message || error || '').toLowerCase();
    return (
      msg.includes('429') ||
      msg.includes('too many requests') ||
      msg.includes('resource exhausted') ||
      msg.includes('quota') ||
      msg.includes('rate') ||
      msg.includes('fetch failed') ||
      msg.includes('network') ||
      msg.includes('timeout')
    );
  };
  async function retryGenkit<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 1200): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;
        if (!shouldRetry(err) || i === attempts - 1) break;
        const jitter = Math.floor(Math.random() * 250);
        await sleep(baseDelayMs * (i + 1) + jitter);
      }
    }
    throw lastErr;
  }

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

  // Server analysis: centralize Genkit flows behind API to avoid client-side quota/CORS
  const analyzePageOnServer = async (imageUri: string): Promise<Voter[]> => {
    const resp = await retryGenkit(() => fetch('/api/voter-extract/analyze-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUri }),
    }));
    const r = resp as Response;
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      throw new Error(text || 'Server analysis failed');
    }
    const data = await r.json().catch(() => ({}));
    return Array.isArray(data?.voters) ? (data.voters as Voter[]) : [];
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a file to analyze.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setProcessedPages(0);
    setTotalPages(0);
    try {
      // If the input is an image, analyze directly. If it's a PDF, process up to 30 pages.
      if (file.type === 'application/pdf') {
        // Ensure pdf.js worker is configured and safe under Next.js dev
        pdfjsLib.GlobalWorkerOptions.disableWorker = true;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const maxPages = Math.min(30, pdf.numPages);
        setTotalPages(maxPages);

        const allVoters: Voter[] = [];
        const DPI = 200; // higher DPI for better OCR accuracy
        const jpegQuality = 0.9;

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const scale = DPI / 72;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const pageImageUri = canvas.toDataURL('image/jpeg', jpegQuality);
            const pageVoters = await analyzePageOnServer(pageImageUri);
            allVoters.push(...pageVoters);
          }
          setProcessedPages(i);
        }

        // Deduplicate by voterId if present, else keep entries
        const normalizeEpic = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const seen = new Set<string>();
        const deduped = allVoters.filter(v => {
          const key = (v.voterId && normalizeEpic(v.voterId)) || `${v.name}|${v.fatherOrHusbandName}|${v.age}|${v.gender}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Normalize formatting for new fields
        const normalizeDigits = (s?: string) => {
          const m = (s || '').match(/\d+/);
          return m ? m[0] : '';
        };
        const normalizeDate = (s?: string) => {
          const m = (s || '').match(/\b\d{2}-\d{2}-\d{4}\b/);
          return m ? m[0] : '';
        };
        const normalizeAssemblyNumber = (s?: string) => {
          // e.g., "172-बिहारशरीफ" or just "172"
          const m = (s || '').match(/\d{1,4}/);
          return m ? m[0] : '';
        };
        const normalizeAssemblyName = (s?: string) => {
          const str = (s || '').trim();
          if (!str) return '';
          const parts = str.split(/\s*-\s*/);
          if (parts.length >= 2) return parts.slice(1).join('-').trim();
          // Fallback: remove leading digits and separators
          return str.replace(/^\d+\s*-\s*/, '').trim();
        };

        const normalized = deduped.map(v => ({
          ...v,
          voterId: normalizeEpic(v.voterId),
          assemblyConstituencyNumber: normalizeAssemblyNumber(v.assemblyConstituencyNumber),
          assemblyConstituencyName: normalizeAssemblyName(v.assemblyConstituencyName),
          sectionNumber: normalizeDigits(v.sectionNumber),
          houseNumber: normalizeDigits(v.houseNumber),
          ageAsOn: normalizeDate(v.ageAsOn),
          publicationDate: normalizeDate(v.publicationDate),
        }));

        setResult({ voters: normalized });
      } else {
        const fileUri = await fileToDataUri(file);
        const pageVoters = await analyzePageOnServer(fileUri);
        if (Array.isArray(pageVoters)) {
          // Normalize formatting for consistency
          const normalizeDigits = (s?: string) => {
            const m = (s || '').match(/\d+/);
            return m ? m[0] : '';
          };
          const normalizeDate = (s?: string) => {
            const m = (s || '').match(/\b\d{2}-\d{2}-\d{4}\b/);
            return m ? m[0] : '';
          };
          const normalizeAssemblyNumber = (s?: string) => {
            const m = (s || '').match(/\d{1,4}/);
            return m ? m[0] : '';
          };
          const normalizeAssemblyName = (s?: string) => {
            const str = (s || '').trim();
            if (!str) return '';
            const parts = str.split(/\s*-\s*/);
            if (parts.length >= 2) return parts.slice(1).join('-').trim();
            return str.replace(/^\d+\s*-\s*/, '').trim();
          };
          const normalizeEpic = (s?: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

          const normalized = pageVoters.map(v => ({
            ...v,
            voterId: normalizeEpic(v.voterId),
            assemblyConstituencyNumber: normalizeAssemblyNumber(v.assemblyConstituencyNumber),
            assemblyConstituencyName: normalizeAssemblyName(v.assemblyConstituencyName),
            sectionNumber: normalizeDigits(v.sectionNumber),
            houseNumber: normalizeDigits(v.houseNumber),
            ageAsOn: normalizeDate(v.ageAsOn),
            publicationDate: normalizeDate(v.publicationDate),
          }));
          setResult({ voters: normalized });
        } else {
          throw new Error("Analysis process returned no data.");
        }
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
    const header = [
      'id',
      'voterId',
      'name',
      'fatherOrHusbandName',
      'gender',
      'age',
      'assemblyConstituencyNumber',
      'assemblyConstituencyName',
      'sectionNumber',
      'houseNumber',
      'ageAsOn',
      'publicationDate',
    ];
    const rows = result.voters.map(v => ({
      id: v.id,
      voterId: v.voterId,
      name: v.name,
      fatherOrHusbandName: v.fatherOrHusbandName,
      gender: v.gender,
      age: v.age,
      assemblyConstituencyNumber: v.assemblyConstituencyNumber || '',
      assemblyConstituencyName: v.assemblyConstituencyName || '',
      sectionNumber: v.sectionNumber || '',
      houseNumber: v.houseNumber || '',
      ageAsOn: v.ageAsOn || '',
      publicationDate: v.publicationDate || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows, { header });
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
                    {totalPages > 0 ? (
                      <p className="text-muted-foreground">Processing page {processedPages} of {totalPages}</p>
                    ) : (
                      <p className="text-muted-foreground">The AI is reading the document. This may take a moment.</p>
                    )}
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
                                    <TableHead>Assembly No</TableHead>
                                    <TableHead>Assembly Name</TableHead>
                                    <TableHead>Section No</TableHead>
                                    <TableHead>House No</TableHead>
                                    <TableHead>Age As On</TableHead>
                                    <TableHead>Publication Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.voters.map((voter, idx) => (
                                    <TableRow key={`${(voter.voterId || '').toUpperCase()}|${voter.assemblyConstituencyNumber || ''}|${voter.sectionNumber || ''}|${voter.id || idx}`}>
                                        <TableCell>{voter.id}</TableCell>
                                        <TableCell>{voter.voterId}</TableCell>
                                        <TableCell>{voter.name}</TableCell>
                                        <TableCell>{voter.fatherOrHusbandName}</TableCell>
                                        <TableCell>{voter.gender}</TableCell>
                                        <TableCell>{voter.age}</TableCell>
                                        <TableCell>{voter.assemblyConstituencyNumber || ''}</TableCell>
                                        <TableCell>{voter.assemblyConstituencyName || ''}</TableCell>
                                        <TableCell>{voter.sectionNumber || ''}</TableCell>
                                        <TableCell>{voter.houseNumber || ''}</TableCell>
                                        <TableCell>{voter.ageAsOn || ''}</TableCell>
                                        <TableCell>{voter.publicationDate || ''}</TableCell>
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
