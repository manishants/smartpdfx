
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clipboard, ClipboardCheck, Pilcrow } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToolSections } from '@/components/tool-sections';
import { useToolSections } from '@/hooks/use-tool-sections';

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Your Go-To Lorem Ipsum Generator</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Quickly generate placeholder text for your designs, mockups, or documents. Our Lorem Ipsum generator provides a simple way to create text in paragraphs, sentences, or individual words. This classic "dummy text" has been the standard in the printing and typesetting industry for centuries.
                </p>
                <p>
                    Simply choose how much text you need, select the format (paragraphs, sentences, or words), and click "Generate". The text is instantly created and ready for you to copy and use in your projects.
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
                <AccordionTrigger>What is Lorem Ipsum?</AccordionTrigger>
                <AccordionContent>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard dummy text ever since the 1500s. It is used as placeholder text to demonstrate the visual form of a document or a typeface without relying on meaningful content.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Why should I use placeholder text?</AccordionTrigger>
                <AccordionContent>
                    Using placeholder text allows designers and developers to focus on the layout and visual hierarchy of a design without being distracted by the actual content. It helps in creating a realistic preview of how the final design will look once the real content is added.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is the generated text random?</AccordionTrigger>
                <AccordionContent>
                    The text is based on a classic Lorem Ipsum passage, so it is not completely random. The tool repeats or truncates this standard passage to generate the number of words, sentences, or paragraphs you request.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger>Does the generated text mean anything?</AccordionTrigger>
                <AccordionContent>
                    No, Lorem Ipsum is not intended to have any meaning. It is derived from a Latin text but is scrambled and altered to the point that it is nonsensical, which is ideal for placeholder text as it prevents readers from being distracted by the content.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>Is there a limit to how much text I can generate?</AccordionTrigger>
                <AccordionContent>
                    While there is no strict limit, we recommend generating a reasonable amount of text (e.g., up to a few hundred paragraphs or a few thousand words) for optimal performance. The tool works entirely within your browser.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export default function LoremIpsumGeneratorPage() {
  const { sections } = useToolSections('Lorem Ipsum Generation');
  const [text, setText] = useState('');
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number | ''>(5);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const generateText = () => {
    if (!count || count <= 0) {
      toast({ title: "Invalid number", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }
    
    let result = '';
    const words = loremIpsumText.split(' ');
    const sentences = loremIpsumText.split(/(?<=[.!?])\s+/);

    switch(type) {
      case 'paragraphs':
        result = Array(count).fill(loremIpsumText).join('\n\n');
        break;
      case 'sentences':
        let s = [];
        for (let i = 0; i < count; i++) {
          s.push(sentences[i % sentences.length]);
        }
        result = s.join(' ');
        break;
      case 'words':
        let w = [];
        for (let i = 0; i < count; i++) {
          w.push(words[i % words.length]);
        }
        result = w.join(' ');
        break;
    }
    setText(result);
  };

  return (
    <>
    <div className="px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Lorem Ipsum Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate placeholder text for your designs.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Generator Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Generate</Label>
                        <div className="flex items-center space-x-2">
                            <Input 
                                type="number" 
                                value={count} 
                                onChange={(e) => setCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))} 
                                min="1"
                            />
                            <RadioGroup value={type} onValueChange={(v) => setType(v as any)} className="flex">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="paragraphs" id="r1" />
                                    <Label htmlFor="r1">Paragraphs</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sentences" id="r2" />
                                    <Label htmlFor="r2">Sentences</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="words" id="r3" />
                                    <Label htmlFor="r3">Words</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <Button onClick={generateText} size="lg">
                        <Pilcrow className="mr-2"/> Generate
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Generated Text</CardTitle>
                <CardDescription>Your placeholder text appears below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                  <Textarea
                    placeholder="Generated text will appear here..."
                    value={text}
                    readOnly
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
                       </div>
                   )}
              </div>
          </CardContent>
        </Card>
        
        <ToolSections 
          toolName="Lorem Ipsum Generation" 
          sections={sections} 
        />
        
        <ToolDescription />
        <FAQ />
      </div>
    </div>
    <AllTools />
    </>
  );
}
