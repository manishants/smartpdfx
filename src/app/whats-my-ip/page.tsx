
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clipboard, ClipboardCheck, AppWindow } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AllTools } from '@/components/all-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ToolCustomSectionRenderer from '@/components/tool-custom-section';
import ToolHowtoRenderer from '@/components/tool-howto-renderer';

const ToolDescription = () => (
    <div className="mt-12">
        <Card className="p-6 md:p-8">
            <CardTitle className="text-2xl font-bold mb-4">Instantly Find Your Public IP Address</CardTitle>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Your public IP address is your unique identifier on the internet. This simple tool instantly fetches and displays your current IP address, making it easy to check your connection details for networking, security, or remote access purposes.
                </p>
                <p>
                    The moment you load this page, our tool queries a reliable service to find out the public IP address assigned to your network by your Internet Service Provider (ISP). It's fast, accurate, and requires no action from you.
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
                <AccordionTrigger>What is an IP address?</AccordionTrigger>
                <AccordionContent>
                    An IP (Internet Protocol) address is a unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication. Your public IP address is how you are identified on the internet, similar to a physical mailing address.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is it safe to show my IP address?</AccordionTrigger>
                <AccordionContent>
                    Your public IP address does not reveal sensitive personal information like your name, exact location (it usually points to your city or region), or personal details. Every website you visit can see your IP address. This tool simply displays that publicly available information back to you for your own knowledge.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>What is the difference between a public and private IP address?</AccordionTrigger>
                <AccordionContent>
                    A public IP address is the address assigned by your ISP and is visible to the entire internet. A private IP address is assigned by your local router to devices on your home or office network (e.g., 192.168.1.100). This tool shows your public IP address.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger>Can my IP address change?</AccordionTrigger>
                <AccordionContent>
                    Yes, most residential internet connections use dynamic IP addresses, which means your ISP may assign you a new IP address periodically. Businesses often have static IP addresses that do not change.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>Why would I need to know my IP address?</AccordionTrigger>
                <AccordionContent>
                    Knowing your IP address is useful for various reasons, such as setting up remote desktop connections, configuring port forwarding for gaming or home servers, troubleshooting network issues, or checking if your VPN is working correctly.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default function WhatsMyIpPage() {
  const [ip, setIp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setIp(data.ip);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch IP:", error);
        setIp("Could not fetch IP address");
        setIsLoading(false);
      });
  }, []);

  const handleCopy = () => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setHasCopied(true);
    toast({ title: "IP Address copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  return (
    <>
    <div className="px-4 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold font-headline">What's My IP Address?</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your public IP address is displayed below.
        </p>
      </header>
      
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <AppWindow className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4">Your Public IP Address</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isLoading ? (
                <Skeleton className="h-12 w-64 mx-auto" />
            ) : (
                <div className="relative p-4 border rounded-md bg-muted">
                    <p className="text-3xl font-mono font-bold tracking-wider">{ip}</p>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                        >
                        {hasCopied ? <ClipboardCheck className="h-6 w-6 text-green-500" /> : <Clipboard className="h-6 w-6" />}
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
        <ToolDescription />
        <FAQ />
        <ToolHowtoRenderer slug="whats-my-ip" />
        <ToolCustomSectionRenderer slug="whats-my-ip" />
      </div>
    </div>
    <AllTools />
    </>
  );
}
