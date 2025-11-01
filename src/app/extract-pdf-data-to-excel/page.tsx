
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, Wand2, PlusCircle, Trash2, MousePointer, Sparkles, Zap, Database, Table } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { findPdfElements } from '@/ai/flows/find-pdf-elements';
import type { FindPdfElementsInput, FindPdfElementsOutput } from '@/lib/types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import { ModernUploadArea } from '@/components/modern-upload-area';
import { Input } from '@/components/ui/input';


pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const languages = [
    { value: 'eng', label: 'English' },
    { value: 'hin', label: 'Hindi' },
    { value: 'spa', label: 'Spanish' },
    { value: 'fra', label: 'French' },
    { value: 'deu', label: 'German' },
    { value: 'chi_sim', label: 'Chinese (Simplified)' },
    { value: 'ara', label: 'Arabic' },
]

interface SelectionBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function ExtractDataToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('eng');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FindPdfElementsOutput | null>(null);
  const [columns, setColumns] = useState<{ id: number; name: string; elements: any[] }[]>([{ id: Date.now(), name: 'Column 1', elements: [] }]);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');


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

  useEffect(() => {
    if (columns.length > 0 && !activeColumnId) {
        setActiveColumnId(columns[0].id);
    }
  }, [columns, activeColumnId]);
  

  const handleFileChange = (selectedFile: File) => {
    
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setAnalysisResult(null);
      const newColumns = [{ id: Date.now(), name: 'Column 1', elements: [] }];
      setColumns(newColumns);
      setActiveColumnId(newColumns[0].id);
    } else {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a PDF file.", 
        variant: "destructive" 
      });
    }
  };

  const renderPdfPageToImage = async (pdfFile: File, pageNum: number): Promise<{imageUri: string, width: number, height: number}> => {
    const fileBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    
    if (pageNum > pdf.numPages) {
        throw new Error("Page number out of range.");
    }
    
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) {
      throw new Error("Could not create canvas context.");
    }
    
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return {
        imageUri: canvas.toDataURL('image/png'),
        width: viewport.width,
        height: viewport.height,
    };
  }

  const handleAnalyze = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PDF to extract data from.", variant: "destructive" });
        return;
    }
    if (!language) {
        toast({ title: "No language selected", description: "Please select the document language.", variant: "destructive" });
        return;
    }

    setIsAnalyzing(true);
    setProcessingMessage('Analyzing first page...');
    setProgress(10);
    setAnalysisResult(null);
    try {
      const { imageUri, width, height } = await renderPdfPageToImage(file, 1);
      const input: FindPdfElementsInput = { imageUri, pageWidth: width, pageHeight: height, language };
      const result = await findPdfElements(input);
      
      if (result && result.elements.length > 0) {
        setAnalysisResult(result);
        if (columns.length > 0) {
            setActiveColumnId(columns[0].id);
        }
      } else {
        throw new Error("AI could not detect any text or image elements on the first page of the PDF.");
      }
    } catch (error: any) {
      if (!isAbortError(error)) {
        console.error("Analysis failed:", error);
        toast({
          title: "Analysis Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
      setProcessingMessage('');
    }
  };
  
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPoint({ x, y });
        setSelectionBox({ x, y, width: 0, height: 0 });
        setIsSelecting(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelecting || !startPoint || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(startPoint.x, currentX);
        const y = Math.min(startPoint.y, currentY);
        const width = Math.abs(startPoint.x - currentX);
        const height = Math.abs(startPoint.y - currentY);
        setSelectionBox({ x, y, width, height });
    };

    const handleMouseUp = async () => {
        if (!isSelecting || !selectionBox || !file || !activeColumnId) return;
        
        setIsAnalyzing(true);
        const fileBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
        const numPages = pdf.numPages;
        
        let allSelectedElements: any[] = [];

        try {
            for (let i = 1; i <= numPages; i++) {
                setProcessingMessage(`Extracting from page ${i} of ${numPages}...`);
                setProgress((i / numPages) * 100);
                
                const { imageUri, width, height } = await renderPdfPageToImage(file, i);
                const pageAnalysis = await findPdfElements({ imageUri, pageWidth: width, pageHeight: height, language });

                if (pageAnalysis.elements) {
                    const pageSelectedElements = pageAnalysis.elements.filter(el => {
                        if (el.type !== 'text' || !el.box) return false;
                        const elBox = { x: el.box.x!, y: el.box.y!, width: el.box.width!, height: el.box.height! };
                        return (
                            elBox.x < selectionBox.x + selectionBox.width &&
                            elBox.x + elBox.width > selectionBox.x &&
                            elBox.y < selectionBox.y + selectionBox.height &&
                            elBox.y + elBox.height > selectionBox.y
                        );
                    });
                    allSelectedElements.push(...pageSelectedElements.sort((a,b) => a.box.y! - b.box.y!));
                }
            }

            setColumns(prev => prev.map(col => {
                if (col.id === activeColumnId) {
                    return { ...col, elements: allSelectedElements };
                }
                return col;
            }));

            toast({ title: `${allSelectedElements.length} items extracted from ${numPages} pages.` });

        } catch (error: any) {
             if (!isAbortError(error)) {
               toast({ title: "Extraction Error", description: `Failed to process page. ${error.message}`, variant: "destructive" });
             }
        } finally {
            setIsAnalyzing(false);
            setProcessingMessage('');
            setProgress(0);
            setIsSelecting(false);
            setSelectionBox(null);
            setStartPoint(null);
        }
    };


  const addColumn = () => {
      const newId = Date.now();
      setColumns(prev => [...prev, {id: newId, name: `Column ${prev.length + 1}`, elements: []}]);
      setActiveColumnId(newId);
  }

  const removeColumn = (id: number) => {
      setColumns(prev => prev.filter(col => col.id !== id));
      if (activeColumnId === id) {
          setActiveColumnId(columns.length > 1 ? columns[0].id : null);
      }
  }
  
  const updateColumnName = (id: number, name: string) => {
      setColumns(prev => prev.map(col => col.id === id ? { ...col, name } : col));
  }
  
  const handleDownloadExcel = () => {
      const wb = XLSX.utils.book_new();
      const maxRows = Math.max(...columns.map(col => col.elements.length));
      const data: (string | number)[][] = [];
      const headers = columns.map(col => col.name);
      data.push(headers);
      
      for(let i=0; i < maxRows; i++) {
          const row = columns.map(col => col.elements[i]?.text || '');
          data.push(row);
      }
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `extracted-data.xlsx`);
  }

  const handleReset = () => {
    setFile(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    const newColumns = [{ id: Date.now(), name: 'Column 1', elements: [] }];
    setColumns(newColumns);
    setActiveColumnId(newColumns[0].id);
    setLanguage('eng');
  };
  
    const renderUpload = () => (
         <div className="flex flex-col items-center gap-6">
            {!file ? (
                <div 
                    className="w-full border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
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
            ) : (
                 <div className="flex flex-col items-center justify-center bg-muted/50 border rounded-lg p-8 w-full">
                    <FileType className="w-16 h-16 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">{file.name}</p>
                </div>
            )}
             <div className="w-full space-y-2">
                <Label htmlFor="language">Document Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>

             <Button 
                size="lg" 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file}
                >
                {isAnalyzing ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing PDF...
                    </>
                ) : <><Wand2 className="mr-2"/>Preview First Page</>}
            </Button>
        </div>
    );
    

  return (
    <ModernPageLayout
      title="Extract Data from PDF to Excel"
      description="Visually select data from your PDF to create a custom Excel sheet with AI-powered precision."
      icon={<Database className="w-8 h-8" />}
    >
      {!analysisResult ? (
        <ModernSection>
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <FileType className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Upload PDF Document</h3>
            </div>

            {!file ? (
              <ModernUploadArea
                onFileSelect={handleFileChange}
                accept="application/pdf"
                maxSize={50 * 1024 * 1024}
                icon={<UploadCloud className="w-12 h-12" />}
                title="Drop your PDF here or click to browse"
                subtitle="Supports PDF files up to 50MB"
              />
            ) : (
              <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileType className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-600">PDF Document</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">AI Configuration</h4>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                      Document Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="bg-white/80 border-purple-200">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !file}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing PDF... {Math.round(progress)}%
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        <Zap className="w-4 h-4 mr-1" />
                        Analyze with AI
                      </>
                    )}
                  </Button>

                  {isAnalyzing && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ModernSection>
      ) : (
        <ModernSection>
          <div className="grid lg:grid-cols-12 gap-8 h-[80vh]">
            <div className="lg:col-span-8 relative border-2 border-blue-200/50 rounded-xl overflow-auto bg-gradient-to-br from-blue-50/30 to-purple-50/20 p-4 flex justify-center items-start">
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-xl">
                  <div className="p-4 bg-white rounded-xl shadow-lg border border-blue-200/50">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-800">{processingMessage}</p>
                    <Progress value={progress} className="w-64 mt-2" />
                  </div>
                </div>
              )}
              <div 
                ref={containerRef}
                className="relative cursor-crosshair" 
                style={{ width: analysisResult.pageWidth, height: analysisResult.pageHeight }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <Image
                  src={`data:image/png;base64,${analysisResult.elements.find(el => el.type === 'image')?.content}`}
                  alt="PDF Preview"
                  width={analysisResult.pageWidth}
                  height={analysisResult.pageHeight}
                  className="absolute top-0 left-0 rounded-lg shadow-sm"
                  draggable="false"
                  priority
                />
                {isSelecting && selectionBox && (
                  <div
                    className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 rounded"
                    style={{
                      left: selectionBox.x,
                      top: selectionBox.y,
                      width: selectionBox.width,
                      height: selectionBox.height,
                    }}
                  />
                )}
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                  <Table className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Excel Columns</h3>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {columns.map(col => (
                  <Card 
                    key={col.id} 
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md',
                      activeColumnId === col.id 
                        ? 'border-2 border-blue-500 ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-purple-50/30' 
                        : 'border border-gray-200 hover:border-blue-300'
                    )}
                  >
                    <div className="p-3" onClick={() => setActiveColumnId(col.id)}>
                      <div className="flex justify-between items-center mb-2">
                        <Input 
                          value={col.name} 
                          onChange={e => updateColumnName(col.id, e.target.value)} 
                          className="h-8 text-base font-semibold border-none focus-visible:ring-1 bg-transparent"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 hover:bg-red-100 hover:text-red-600" 
                          onClick={(e) => {e.stopPropagation(); removeColumn(col.id)}}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {col.elements.map((el, i) => (
                          <p key={i} className="text-sm truncate bg-white/80 border border-gray-200/50 p-2 rounded-md shadow-sm">
                            {el.text}
                          </p>
                        ))}
                        {col.elements.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <MousePointer className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Draw a box on the PDF to extract data</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex-shrink-0 space-y-3">
                <Button 
                  onClick={addColumn} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02]" 
                  variant="default"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> 
                  Add Column
                </Button>
                <Button 
                  onClick={handleDownloadExcel} 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02]" 
                  disabled={columns.every(c => c.elements.length === 0)}
                >
                  <FileDown className="w-4 h-4 mr-2" /> 
                  Download Excel
                </Button>
                <Button 
                  onClick={handleReset} 
                  className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-xl transition-all duration-300" 
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> 
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        </ModernSection>
      )}
    </ModernPageLayout>
  );
}
