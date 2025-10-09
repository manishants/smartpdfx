
"use client";

import { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileDown, Loader2, RefreshCw, FileType, CheckCircle, FileUp } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


// Placeholder for the flow
// import { pptToPdf } from '@/ai/flows/ppt-to-pdf';


const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md-p-8">
            <CardTitle className="text-2xl font-bold mb-4">Reliable PowerPoint to PDF Conversion</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Easily convert your Microsoft PowerPoint presentations (.ppt, .pptx) into high-quality PDF files. Our converter ensures that your slides, images, text, and formatting are perfectly preserved, making it easy to share, archive, or print your presentations.
                </p>
                <p>
                    PDFs are a universal format that can be opened on any device, ensuring your presentation looks exactly as you intended, every time. Protect your layout and fonts by converting to PDF before sharing.
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
                <AccordionTrigger>Will my animations and transitions be preserved?</AccordionTrigger>
                <AccordionContent>
                    No. The PDF format is static and does not support animations, transitions, or embedded videos. The converter will create a static image of each slide as it appears in the final presentation.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>How is the quality of the final PDF?</AccordionTrigger>
                <AccordionContent>
                    Our tool is optimized to create high-quality PDFs that preserve the original resolution of your images and the clarity of your text, making it suitable for both digital viewing and professional printing.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Are my presentation files secure?</AccordionTrigger>
                <AccordionContent>
                    Yes. We use secure connections for all file transfers, and your files are automatically deleted from our servers one hour after conversion. Your privacy and data security are paramount.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Can I convert a password-protected PowerPoint file?</AccordionTrigger>
                <AccordionContent>
                    No, you must remove the password from the PowerPoint file before uploading it to our tool. Our converter cannot access password-protected presentations.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can I convert a PDF back to PowerPoint?</AccordionTrigger>
                <AccordionContent>
                    Yes! For that, you can use our dedicated <a href="/pdf-to-ppt" className="text-primary underline">PDF to PowerPoint Converter</a>, which uses AI to reconstruct editable slides from your PDF.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);


export default function PptToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ pdfUri: string } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
       if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a PPT or PPTX file.", variant: "destructive" });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a PowerPoint document to convert.", variant: "destructive" });
        return;
    }
    setIsConverting(true);
    setResult(null);
    try {
      // const pptUri = await fileToDataUri(file);
      // const input = { pptUri };
      // const conversionResult = await pptToPdf(input);
      
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
        <h1 className="text-4xl font-bold font-headline">PowerPoint to PDF</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Convert your PowerPoint presentations to PDF files.
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
                <p className="mt-4 font-semibold text-primary">Drag & drop a PowerPoint file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
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
