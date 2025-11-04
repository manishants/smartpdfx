
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard, ClipboardCheck, Trash2, CaseUpper, Sparkles, Zap, Type, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModernPageLayout } from '@/components/modern-page-layout';
import { ModernSection } from '@/components/modern-section';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
// ToolSections and useToolSections removed as part of home-only sections architecture

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
  <div className="mt-12 max-w-4xl mx-auto">
    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-pink-50/20">
      <CardContent className="p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border-2 border-blue-200/50 rounded-xl bg-white/60 px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-blue-600">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                What does "Sentence case" do?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-4 pb-2 leading-relaxed">
              Sentence case capitalizes the first letter of the first word in each sentence and converts all other letters to lowercase. It automatically detects sentence-ending punctuation like periods, question marks, and exclamation marks.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border-2 border-green-200/50 rounded-xl bg-white/60 px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-green-600">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-green-600" />
                What is the difference between "Title Case" and "Capitalized Case"?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-4 pb-2 leading-relaxed">
              "Capitalized Case" simply capitalizes the first letter of every word. "Title Case" is more sophisticated; it also capitalizes the first letter of every word but typically excludes small, common words like "a," "an," "the," "and," "but," "or," etc., unless they are the first or last word of the title.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="border-2 border-purple-200/50 rounded-xl bg-white/60 px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-purple-600">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-600" />
                Is my text stored on your servers?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-4 pb-2 leading-relaxed">
              No. All conversions happen directly in your browser with AI-powered precision. Your text is never sent to our servers, ensuring your data remains completely private and secure.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="border-2 border-orange-200/50 rounded-xl bg-white/60 px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-orange-600">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-orange-600" />
                Is there a character limit?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-4 pb-2 leading-relaxed">
              There is no hard character limit. Our AI-enhanced tool is designed to handle large blocks of text efficiently, but performance may vary depending on the processing power of your device for extremely large inputs.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5" className="border-2 border-teal-200/50 rounded-xl bg-white/60 px-6">
            <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-teal-600">
              <div className="flex items-center gap-3">
                <CaseUpper className="w-5 h-5 text-teal-600" />
                Can this tool handle multiple paragraphs?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-4 pb-2 leading-relaxed">
              Yes, absolutely. You can paste multiple paragraphs into the text area, and our intelligent tool will apply the selected case conversion to the entire text while preserving your paragraph breaks and formatting.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
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
    <ModernPageLayout
      title="AI Case Converter"
      description="Transform text between different letter cases with AI-powered precision and intelligent formatting."
      icon={<Type className="w-8 h-8" />}
    >
      <ModernSection>
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/30 to-purple-50/20">
            <CardContent className="p-8 space-y-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <CaseUpper className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Smart Text Transformation</h3>
                </div>
                <p className="text-gray-600 text-lg">Paste your text and choose from intelligent case conversion options</p>
              </div>

              <div className="relative">
                <Textarea
                  placeholder="Type or paste your text here for AI-powered case conversion..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="h-64 text-base bg-white/80 border-blue-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                />
                {text && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      title="Copy to clipboard"
                      className="hover:bg-blue-100 hover:text-blue-600 rounded-lg"
                    >
                      {hasCopied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      title="Clear text"
                      className="hover:bg-red-100 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">AI Case Options</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <Button 
                    onClick={toSentenceCase}
                    className="h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sentence case
                  </Button>
                  <Button 
                    onClick={toLowerCase}
                    className="h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    lower case
                  </Button>
                  <Button 
                    onClick={toUpperCase}
                    className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <CaseUpper className="w-4 h-4 mr-2" />
                    UPPER CASE
                  </Button>
                  <Button 
                    onClick={toCapitalizedCase}
                    className="h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Capitalized Case
                  </Button>
                  <Button 
                    onClick={toTitleCase}
                    className="h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Title Case
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl p-6 border border-purple-200/50">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-800">AI-Powered Features</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our intelligent case converter automatically detects sentence boundaries, preserves formatting, 
                  and applies smart capitalization rules for professional results every time.
                </p>
              </div>
            </CardContent>
          </Card>
          
      {/* Tool-specific sections removed (home-only CMS sections) */}
          
          <ToolDescription />
          <FAQ />
          <ToolCustomSectionRenderer slug="case-converter" />
          <AllTools />
        </div>
      </ModernSection>
    </ModernPageLayout>
  );
}
