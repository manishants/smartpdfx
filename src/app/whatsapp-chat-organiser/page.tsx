
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, RefreshCw, Wand2, FileText, MessageSquare, Users, Star, CalendarDays, Paperclip, FileDown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { OrganiseWhatsappChatInput, OrganiseWhatsappChatOutput } from '@/lib/types';
import { organiseWhatsappChat } from '@/ai/flows/organise-whatsapp-chat';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Packer, Document, Paragraph, HeadingLevel, TextRun, AlignmentType } from 'docx';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AllTools } from '@/components/all-tools';

export default function WhatsappChatOrganiserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OrganiseWhatsappChatOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({ title: "Invalid file type", description: "Please select a .txt file exported from WhatsApp.", variant: "destructive" });
      }
    }
  };

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
        toast({ title: "No file selected", description: "Please select a chat file to analyze.", variant: "destructive" });
        return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const chatContent = await fileToText(file);
      const input: OrganiseWhatsappChatInput = { chatContent };
      
      const analysisResult = await organiseWhatsappChat(input);
      
      if (analysisResult) {
        setResult(analysisResult);
      } else {
        throw new Error("Analysis process returned no data.");
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong while analyzing the chat. The format might be unsupported.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsAnalyzing(false);
  };
  
  const handleDownload = async () => {
    if (!result || !file) {
      toast({ title: "No data to download", description: "Please analyze a chat first.", variant: "destructive" });
      return;
    }

    const { saveAs } = (await import('file-saver'));
    const chatContent = await fileToText(file);
    const chatLines = chatContent.split('\n').map(line => new Paragraph(line));

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "WhatsApp Chat Analysis Report",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: `Analysis of: ${file.name}`,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: "",
                    children: [new TextRun({break: 1})]
                }),
                new Paragraph({
                    text: "Conversation Summary",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: result.summary,
                    style: "Normal"
                }),
                 new Paragraph({ text: "",
                    children: [new TextRun({break: 1})]
                }),
                new Paragraph({
                    text: "Key Statistics",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({ text: `Total Messages: ${result.statistics.totalMessages}`, bullet: { level: 0 } }),
                new Paragraph({ text: `Media Items Shared: ${result.statistics.mediaSharedCount}`, bullet: { level: 0 } }),
                new Paragraph({ text: `Most Active Day: ${result.statistics.mostActiveDay}`, bullet: { level: 0 } }),
                new Paragraph({ text: "",
                    children: [new TextRun({break: 1})]
                }),
                new Paragraph({
                    text: "Key Topics",
                    heading: HeadingLevel.HEADING_1,
                }),
                ...result.keyTopics.map(topic => new Paragraph({ text: topic, bullet: { level: 0 } })),
                 new Paragraph({ text: "",
                    children: [new TextRun({break: 1})]
                }),
                new Paragraph({
                    text: "Participants & Message Count",
                    heading: HeadingLevel.HEADING_1,
                }),
                ...result.statistics.messagesByParticipant.map(p => new Paragraph({ text: `${p.participant}: ${p.messageCount} messages`, bullet: { level: 0 } })),
                new Paragraph({ text: "",
                    children: [new TextRun({break: 1})]
                }),
                new Paragraph({
                    text: "Full Chat Transcript",
                    heading: HeadingLevel.HEADING_1,
                }),
                ...chatLines,
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `whatsapp-analysis-${file.name}.docx`);
    });
  };

  const chartData = result?.statistics.messagesByParticipant
  ? [...result.statistics.messagesByParticipant]
      .sort((a, b) => b.messageCount - a.messageCount)
      .map(item => ({ name: item.participant, messages: item.messageCount }))
  : [];


  return (
    <>
    <main className="flex-1 p-4 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">WhatsApp Chat Analyzer</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Uncover insights from your WhatsApp conversations. Upload your exported `.txt` chat file to get a free, AI-powered summary and analysis.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {!result && !isAnalyzing && (
                 <div>
                    <div 
                        className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <UploadCloud className="mx-auto h-12 w-12 text-primary" />
                        <p className="mt-4 font-semibold text-primary">Drag & drop your exported chat file here</p>
                        <p className="text-sm text-muted-foreground mt-1">Must be a .txt file. We never read or store your chat data.</p>
                        <Input 
                        id="file-upload"
                        type="file" 
                        className="hidden" 
                        accept=".txt"
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
                                <Wand2 className="mr-2"/>Analyze Chat
                            </Button>
                        </div>
                    )}
                 </div>
            )}
            
            {isAnalyzing && (
                 <div className="space-y-8">
                    <div className="flex flex-col items-center text-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <h2 className="text-2xl font-semibold mt-4">Analyzing your chat...</h2>
                      <p className="text-muted-foreground">The AI is reading your conversation to generate insights. This may take a moment.</p>
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                    <Skeleton className="h-72 w-full" />
                </div>
            )}


            {result && (
                <div className="space-y-8 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conversation Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{result.summary}</p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.statistics.totalMessages}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.participants.length}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{new Date(result.statistics.mostActiveDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Media Shared</CardTitle>
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{result.statistics.mediaSharedCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Topics</CardTitle>
                                <CardDescription>The main topics discussed in the chat.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                               {result.keyTopics.map((topic) => (
                                    <Badge key={topic} variant="secondary" className="text-sm py-1 px-3">{topic}</Badge>
                               ))}
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Participants</CardTitle>
                                <CardDescription>All members of the conversation.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                               {result.participants.map((person) => (
                                    <Badge key={person} variant="outline" className="text-sm py-1 px-3">{person}</Badge>
                               ))}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Message Breakdown</CardTitle>
                            <CardDescription>Number of messages sent by each participant.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        contentStyle={{ 
                                            backgroundColor: 'hsl(var(--background))', 
                                            border: '1px solid hsl(var(--border))' 
                                        }}
                                    />
                                    <Bar dataKey="messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    
                    <div className="text-center mt-8 flex justify-center gap-4">
                         <Button size="lg" variant="secondary" onClick={handleDownload}>
                            <FileDown className="mr-2" />
                            Download Report (.docx)
                         </Button>
                         <Button size="lg" variant="outline" onClick={handleReset}>
                            <RefreshCw className="mr-2" />
                            Analyze Another Chat
                        </Button>
                    </div>
                </div>
            )}

          </CardContent>
        </Card>

         <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Is my chat data safe?</AccordionTrigger>
                    <AccordionContent>
                        Yes. Your privacy is our top priority. Your chat file is processed entirely in your browser and on our secure servers for analysis. It is never stored, and we permanently delete it immediately after processing. We cannot read your chats.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>How do I export my WhatsApp chat?</AccordionTrigger>
                    <AccordionContent>
                        Open the WhatsApp chat you want to export, tap the three dots in the top-right corner, select 'More' > 'Export chat', and choose 'Without Media'. This will generate a .txt file that you can upload here.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                    <AccordionTrigger>Why is this tool useful?</AccordionTrigger>
                    <AccordionContent>
                        It helps you quickly understand long conversations without rereading everything. It's perfect for business records, summarizing group project discussions, or even just for fun insights into your friendships. You can see who talks the most, what you talk about, and get a neutral summary of any conversation. Check out our <Link href="/blog/we-analyzed-10000-whatsapp-messages" className="text-primary underline">blog post</Link> for ideas!
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
         </div>
      </div>
    </main>
    <AllTools />
    </>
  );
}
