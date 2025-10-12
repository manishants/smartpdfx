
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Wand2, Sparkles } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { resumeAssistant } from '@/ai/flows/resume-assistant';
import type { ResumeAssistantInput, ResumeAssistantOutput } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';


export default function ResumeAssistantPage() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAssistantOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast({ title: "Resume is empty", description: "Please paste your resume text to get feedback.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const input: ResumeAssistantInput = { resumeText };
      const analysisResult = await resumeAssistant(input);
      if (analysisResult) {
        setResult(analysisResult);
      } else {
        throw new Error("Analysis failed to return any feedback.");
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeText('');
    setResult(null);
    setIsAnalyzing(false);
  };
  
  const markdownComponents = {
      h3: ({...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
      ul: ({...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
      li: ({...props}) => <li className="text-muted-foreground" {...props} />,
  }

  return (
    <>
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Resume Assistant</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Get expert feedback on your resume in seconds.
        </p>
      </header>
      
      <div className="max-w-6xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-4">
                 <h3 className="text-xl font-semibold text-center">Paste Your Resume</h3>
                 <Textarea
                  placeholder="Paste the full text of your resume here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="h-96 text-sm"
                  disabled={isAnalyzing}
                />
                <Button 
                  className="w-full"
                  size="lg" 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                   ) : <><Wand2 className="mr-2"/>Get AI Feedback</>}
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                 <h3 className="text-xl font-semibold text-center">AI Feedback</h3>
                 <Card className="h-96">
                     <CardContent className="p-6 h-full overflow-y-auto">
                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="mt-4 text-muted-foreground">Your feedback is being generated...</p>
                            </div>
                        )}
                        {result && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="text-primary"/>Overall Score & Impression</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-4xl font-bold text-center mb-2">{result.overallScore}/100</p>
                                        <p className="text-muted-foreground">{result.overallImpression}</p>
                                    </CardContent>
                                </Card>
                                <ReactMarkdown components={markdownComponents}>
                                    {result.feedback}
                                </ReactMarkdown>
                            </div>
                        )}
                        {!isAnalyzing && !result && (
                            <div className="flex items-center justify-center h-full">
                               <p className="text-muted-foreground text-center">Your resume feedback will appear here.</p>
                            </div>
                        )}
                     </CardContent>
                 </Card>
                 {result && (
                     <Button 
                        className="w-full"
                        variant="outline"
                        onClick={handleReset}
                    >
                      <RefreshCw className="mr-2" />
                      Analyze Another Resume
                    </Button>
                 )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    <AllTools />
    </>
  );
}
