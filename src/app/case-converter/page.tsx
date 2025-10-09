
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard, ClipboardCheck, Trash2, CaseUpper } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">The Ultimate Case Converter Tool</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Effortlessly switch your text between different letter cases with our versatile and easy-to-use case converter. Whether you're a writer, developer, or student, this tool is designed to save you time and make text manipulation simple. Paste your text, choose the desired case, and watch it transform instantly.
                </p>
                <p>
                    From converting text to <strong>Sentence case</strong> for proper grammar, to <strong>UPPERCASE</strong> for headlines, or <strong>Title Case</strong> for articles, our tool handles it all. No more manual editing—just quick, accurate conversions right in your browser.
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
                <AccordionTrigger>What does "Sentence case" do?</AccordionTrigger>
                <AccordionContent>
                    Sentence case capitalizes the first letter of the first word in each sentence and converts all other letters to lowercase. It automatically detects sentence-ending punctuation like periods, question marks, and exclamation marks.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>What is the difference between "Title Case" and "Capitalized Case"?</AccordionTrigger>
                <AccordionContent>
                    "Capitalized Case" simply capitalizes the first letter of every word. "Title Case" is more sophisticated; it also capitalizes the first letter of every word but typically excludes small, common words like "a," "an," "the," "and," "but," "or," etc., unless they are the first or last word of the title.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
                <AccordionTrigger>Is my text stored on your servers?</AccordionTrigger>
                <AccordionContent>
                    No. All conversions happen directly in your browser. Your text is never sent to our servers, ensuring your data remains completely private and secure.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
                <AccordionTrigger>Is there a character limit?</AccordionTrigger>
                <AccordionContent>
                    There is no hard character limit. The tool is designed to handle large blocks of text, but performance may vary depending on the processing power of your device for extremely large inputs.
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
                <AccordionTrigger>Can this tool handle multiple paragraphs?</AccordionTrigger>
                <AccordionContent>
                    Yes, absolutely. You can paste multiple paragraphs into the text area, and the tool will apply the selected case conversion to the entire text while preserving your paragraph breaks.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function CaseConverterPage() {
  const [text, setText] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const handleClear = () => {
      setText('');
  }

  const toSentenceCase = () => {
    if (!text) return;
    const lower = text.toLowerCase();
    const sentences = lower.match(/[^.!?]+[.!?]*/g) || [];
    const result = sentences.map(sentence => {
        const trimmed = sentence.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }).join(' ');
    setText(result);
  };

  const toLowerCase = () => setText(text.toLowerCase());
  const toUpperCase = () => setText(text.toUpperCase());
  
  const toCapitalizedCase = () => {
      setText(text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
  }
  
  const toTitleCase = () => {
      const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
      setText(text.toLowerCase().split(' ').map((word, index, array) => {
          if (index === 0 || index === array.length - 1 || !smallWords.test(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
          return word;
      }).join(' '));
  }

  return (
    <>
    <div className="px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Case Converter</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Easily convert text between different letter cases.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6 space-y-4">
              <div className="relative">
                  <Textarea
                    placeholder="Type or paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="h-64 text-base"
                  />
                   {text && (
                       <div className="absolute top-2 right-2 flex gap-1">
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={handleCopy}
                           title="Copy to clipboard"
                         >
                           {hasCopied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                         </Button>
                          <Button
                           variant="ghost"
                           size="icon"
                           onClick={handleClear}
                           title="Clear text"
                         >
                            <Trash2 className="h-5 w-5" />
                         </Button>
                       </div>
                   )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  <Button onClick={toSentenceCase}>Sentence case</Button>
                  <Button onClick={toLowerCase}>lower case</Button>
                  <Button onClick={toUpperCase}>UPPER CASE</Button>
                  <Button onClick={toCapitalizedCase}>Capitalized Case</Button>
                  <Button onClick={toTitleCase}>Title Case</Button>
              </div>
          </CardContent>
        </Card>
        <ToolDescription />
        <FAQ />
      </div>
    </div>
    <AllTools />
    </>
  );
}
