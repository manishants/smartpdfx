
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, RefreshCw, Wand2, FileText, Users, FileDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { extractVoters } from '@/ai/flows/extract-voter-list';
import type { ExtractVotersInput, ExtractVotersOutput, Voter } from '@/lib/types';
import { AllTools } from '@/components/all-tools';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
const [maxPagesSelected, setMaxPagesSelected] = useState<number>(40);
  const [enableLivePreview, setEnableLivePreview] = useState<boolean>(true);
  const [previewVoters, setPreviewVoters] = useState<Voter[]>([]);
  const seenKeysRef = useRef<Set<string>>(new Set());
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
    setProcessedPages(0);
    setTotalPages(0);
    setPreviewVoters([]);
    seenKeysRef.current = new Set<string>();
    try {
      // If the input is an image, analyze directly. If it's a PDF, process up to 30 pages.
      if (file.type === 'application/pdf') {
        // Ensure pdf.js worker is configured and safe under Next.js dev
        pdfjsLib.GlobalWorkerOptions.disableWorker = true;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
const maxPages = Math.min(Math.max(1, maxPagesSelected), 10000, pdf.numPages);
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
            const perPageInput: ExtractVotersInput = { fileUri: pageImageUri };
            const pageResult = await extractVoters(perPageInput);
            if (pageResult && Array.isArray(pageResult.voters)) {
              allVoters.push(...pageResult.voters);
              if (enableLivePreview) {
                // Incremental dedupe and preview update
                setPreviewVoters((prev) => {
                  const next = [...prev];
                  for (const v of pageResult.voters) {
                    const key = (v.voterId && v.voterId.trim()) || `${v.name}|${v.fatherOrHusbandName}|${v.age}|${v.gender}`;
                    if (!seenKeysRef.current.has(key)) {
                      seenKeysRef.current.add(key);
                      next.push(v);
                    }
                  }
                  return next;
                });
              }
            }
          }
          // Release canvas memory
          try {
            (page as any).cleanup?.();
          } catch {}
          setProcessedPages(i);
        }

        // Deduplicate by voterId if present, else keep entries
        const seen = new Set<string>();
        const deduped = allVoters.filter(v => {
          const key = (v.voterId && v.voterId.trim()) || `${v.name}|${v.fatherOrHusbandName}|${v.age}|${v.gender}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setResult({ voters: deduped });
      } else {
        const fileUri = await fileToDataUri(file);
        const input: ExtractVotersInput = { fileUri };
        const analysisResult = await extractVoters(input);
        if (analysisResult) {
          setResult(analysisResult);
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
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
<Label htmlFor="max-pages">Max pages to process (1–10000)</Label>
                        <Input
                          id="max-pages"
                          type="number"
                          min={1}
                          max={10000}
value={maxPagesSelected}
onChange={(e) => setMaxPagesSelected(Math.max(1, Math.min(10000, Number(e.target.value || 1))))}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-6 md:mt-0">
                        <Checkbox
                          id="live-preview"
                          checked={enableLivePreview}
                          onCheckedChange={(val) => setEnableLivePreview(Boolean(val))}
                        />
                        <Label htmlFor="live-preview">Show live preview while processing</Label>
                      </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 flex flex-col items-center text-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <h2 className="text-2xl font-semibold mt-4">Extracting Voter Data...</h2>
                      {totalPages > 0 ? (
                        <p className="text-muted-foreground">Processing page {processedPages} of {totalPages}</p>
                      ) : (
                        <p className="text-muted-foreground">The AI is reading the document. This may take a moment.</p>
                      )}
                  </div>
                  {enableLivePreview && (
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="font-medium">Live Preview</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Extracted so far: {previewVoters.length}</span>
                      </div>
                      <div className="border rounded-lg max-h-[50vh] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Voter ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Father/Husband</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Age</TableHead>
                              <TableHead>AC No.</TableHead>
                              <TableHead>AC Name</TableHead>
                              <TableHead>Section No.</TableHead>
                              <TableHead>House No.</TableHead>
                              <TableHead>Age As On</TableHead>
                              <TableHead>Publication Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewVoters.map((voter) => (
                              <TableRow key={`preview-${voter.id}-${voter.voterId || voter.name}`}>
                                <TableCell>{voter.id}</TableCell>
                                <TableCell>{voter.voterId}</TableCell>
                                <TableCell>{voter.name}</TableCell>
                                <TableCell>{voter.fatherOrHusbandName}</TableCell>
                                <TableCell>{voter.gender}</TableCell>
                                <TableCell>{voter.age}</TableCell>
                                <TableCell>{voter.assemblyConstituencyNumber}</TableCell>
                                <TableCell>{voter.assemblyConstituencyName}</TableCell>
                                <TableCell>{voter.sectionNumber}</TableCell>
                                <TableCell>{voter.houseNumber}</TableCell>
                                <TableCell>{voter.ageAsOn}</TableCell>
                                <TableCell>{voter.publicationDate}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
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
                                    <TableHead>AC No.</TableHead>
                                    <TableHead>AC Name</TableHead>
                                    <TableHead>Section No.</TableHead>
                                    <TableHead>House No.</TableHead>
                                    <TableHead>Age As On</TableHead>
                                    <TableHead>Publication Date</TableHead>
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
                                        <TableCell>{voter.assemblyConstituencyNumber}</TableCell>
                                        <TableCell>{voter.assemblyConstituencyName}</TableCell>
                                        <TableCell>{voter.sectionNumber}</TableCell>
                                        <TableCell>{voter.houseNumber}</TableCell>
                                        <TableCell>{voter.ageAsOn}</TableCell>
                                        <TableCell>{voter.publicationDate}</TableCell>
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
