
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Placeholder for the flow
// import { wordToPdf } from '@/ai/flows/word-to-pdf';


const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">High-Fidelity Word to PDF Converter</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Convert your Microsoft Word documents (.doc, .docx) to PDF with our easy-to-use tool. The converter is designed to faithfully preserve your original document's layout, formatting, fonts, and images, ensuring your PDF looks exactly like your Word file.
                </p>
                <p>
                    This is the perfect way to create professional-looking documents for sharing, printing, or archiving. PDFs are a universal standard, meaning anyone can view your file on any device without needing Microsoft Word.
                </p>
            </CardContent>
        </Card>
    </div>
);

const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Will my formatting and fonts be preserved?</AccordionTrigger>
                <AccordionContent>
                    Yes. Our converter is designed to create a PDF that is a perfect replica of your Word document. This includes fonts, images, tables, headers, footers, and page layout.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Can I convert a file with tracked changes and comments?</AccordionTrigger>
                <AccordionContent>
                    The PDF will be a "flat" version of the document. This means it will look like the "Final" or "No Markup" view in Microsoft Word. Tracked changes and comments will not be visible or included in the final PDF.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Is there a file size limit?</AccordionTrigger>
                <AccordionContent>
                    While there is no strict file size limit, we recommend uploading Word documents under 50MB for the best performance. Larger or more complex documents may take longer to convert.
                AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Are my files secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. We use a secure HTTPS connection for all uploads. Your files are automatically and permanently deleted from our servers one hour after conversion.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I convert a PDF back to Word?</AccordionTrigger>
                <AccordionContent>
                    Yes, you can use our dedicated <a href="/pdf-to-word" className="text-primary underline">PDF to Word Converter</a> to turn your PDFs into editable DOCX files.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ pdfUri: string } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
       if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a DOC or DOCX file.", variant: "destructive" });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a Word document to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    setResult(null);
    try {
      // const wordUri = await fileToDataUri(file);
      // const input = { wordUri };
      // const conversionResult = await wordToPdf(input);
      
      // Placeholder logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      const conversionResult = { pdfUri: "data:application/pdf;base64," };
      
      if (conversionResult) {
        // setResult(conversionResult);
        toast({ title: "Coming Soon!", description: "This feature is not yet implemented.", variant: "default" });
      } else {
        throw new Error("Conversion returned no data.");
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Something went wrong while converting your document.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsConverting(false);
  };

  return (
    <>
    <main className="flex-1 p-6 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Word to PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your Word documents to PDF files.
        </p>
      </header>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!file && (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-semibold text-primary">Drag & drop a Word file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                <Button 
                  size="lg" 
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                   ) : <><FileUp className="mr-2"/>Convert to PDF</>}
                </Button>
              </div>
            )}

            {result && file && (
               <div className="text-center flex flex-col items-center gap-4">
                 <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                 <h2 className="text-2xl font-semibold mt-4">Conversion Successful!</h2>
                 <div className="mt-6 flex gap-4">
                    <Button size="lg" asChild>
                      <a href={result.pdfUri} download={`${file.name}.pdf`}><FileDown className="mr-2" />Download PDF</a>
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleReset}>
                      <RefreshCw className="mr-2" />
                      Convert Another
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ToolDescription />
      <FAQ />
    </main>
    <AllTools />
    </>
  );
}
