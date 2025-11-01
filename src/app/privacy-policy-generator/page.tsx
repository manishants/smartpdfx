
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clipboard, ClipboardCheck, ShieldQuestion } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToolSections } from '@/components/tool-sections';
import { useToolSections } from '@/hooks/use-tool-sections';

const FAQ = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>Is this generated privacy policy legally binding?</AccordionTrigger>
                <AccordionContent>
                    This tool generates a basic, general-purpose privacy policy template. While it covers common points, it is for informational purposes only and is not a substitute for legal advice. Laws regarding privacy policies vary by jurisdiction and depend on the specifics of your business. We strongly recommend consulting with a qualified lawyer to ensure your privacy policy is complete and compliant with all applicable laws.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Do I need to change anything in the generated text?</AccordionTrigger>
                <AccordionContent>
                    Yes. The generated text is a template. You should carefully read through it and replace placeholder text like "[Your Website/Company Name]" and "[Your Contact Information]" with your actual details. You may also need to add or remove clauses depending on how your website or app collects and uses data (e.g., if you use analytics, advertising, or collect personal information).
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function PrivacyPolicyGeneratorPage() {
  const { sections } = useToolSections('Privacy Policy Generation');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [policy, setPolicy] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!policy) return;
    navigator.clipboard.writeText(policy);
    setHasCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const generatePolicy = () => {
      if (!companyName || !websiteUrl || !contactEmail) {
          toast({ title: "Missing Information", description: "Please fill out all fields to generate the policy.", variant: "destructive"});
          return;
      }
    
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
    const policyText = `
Privacy Policy for ${companyName}

Last updated: ${currentDate}

This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.

Interpretation and Definitions
================================
The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.

For the purposes of this Privacy Policy:
* Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to ${companyName}.
* Website refers to ${websiteUrl}.
* Service refers to the Website.
* You means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.

Collecting and Using Your Personal Data
=======================================
We do not collect any personal data from our users. Your use of our services is anonymous.

Uploaded Files
--------------
Files that you upload to our services are processed on our servers and are automatically deleted within one hour of processing. We do not view, copy, or store your files.

Contact Us
==========
If you have any questions about this Privacy Policy, You can contact us:
* By email: ${contactEmail}
    `;
    setPolicy(policyText.trim());
  };

  return (
    <>
    <div className="px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">Privacy Policy Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Create a simple, basic privacy policy for your website or app.
        </p>
      </header>
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Enter Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company / Website Name</Label>
                        <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input id="websiteUrl" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <Button onClick={generatePolicy} size="lg">
                        <ShieldQuestion className="mr-2"/> Generate Policy
                    </Button>
                </div>
            </CardContent>
        </Card>

        {policy && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Generated Privacy Policy</CardTitle>
                    <CardDescription>Review the generated text below. This is a template and not legal advice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                      <Textarea
                        value={policy}
                        readOnly
                        className="h-96 text-sm bg-muted/50"
                        />
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
                  </div>
              </CardContent>
            </Card>
        )}
        
      <ToolSections 
        toolName="Privacy Policy Generation" 
        sections={sections} 
      />
        
        <FAQ />
      </div>
    </div>
    <AllTools />
    </>
  );
}
