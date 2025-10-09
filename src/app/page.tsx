"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { tools } from "@/lib/data";
import Image from "next/image";
import { ArrowDownUp, FileSignature, Scissors, FileJson, RotateCcw, Copy, Check, Heart, Grid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AllTools } from "@/components/all-tools";

function DonateDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [upiCopied, setUpiCopied] = useState(false);
  const [paypalCopied, setPaypalCopied] = useState(false);

  const copyToClipboard = (text: string, setter: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };
  
  const upiId = "your-upi-id@okhdfcbank";
  const paypalId = "your-paypal-email@example.com";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Support SmartPDFx</DialogTitle>
          <DialogDescription className="text-center">
            Your contributions help keep this service free. Thank you!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center gap-4">
             <div className="p-2 bg-white rounded-lg border">
                <Image
                  src="https://placehold.co/200x200.png"
                  alt="Scan to pay"
                  width={200}
                  height={200}
                  data-ai-hint="qr code"
                />
            </div>
             <p className="text-sm font-medium text-muted-foreground">Scan QR Code to Pay with any UPI App</p>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="upiId" className="font-semibold">UPI ID</Label>
             <div className="flex items-center gap-2">
              <Input id="upiId" value={upiId} readOnly />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(upiId, setUpiCopied)}>
                {upiCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="paypalId" className="font-semibold">PayPal</Label>
             <div className="flex items-center gap-2">
              <Input id="paypalId" value={paypalId} readOnly />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(paypalId, setPaypalCopied)}>
                 {paypalCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function Home() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <>
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute inset-0 -z-10">
            <ArrowDownUp className="absolute top-[10%] left-[5%] h-8 w-8 text-primary/30 rotate-12" />
            <FileSignature className="absolute top-[20%] right-[10%] h-10 w-10 text-blue-400/30 -rotate-6" />
            <Scissors className="absolute bottom-[15%] left-[20%] h-7 w-7 text-fuchsia-400/30 rotate-3" />
            <FileJson className="absolute bottom-[25%] right-[25%] h-9 w-9 text-indigo-400/30 rotate-12" />
            <RotateCcw className="absolute top-[60%] right-[15%] h-8 w-8 text-primary/30 -rotate-12" />
            <ArrowDownUp className="absolute top-[70%] left-[10%] h-6 w-6 text-fuchsia-400/30 rotate-6" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6 text-center lg:text-left items-center lg:items-start">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter max-w-xl text-foreground">
                  Free Compress, Convert & Customize Files Online with SmartPDFx
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Edit PDFs, Mask Aadhaar, Remove Backgrounds, Convert, Compress, Sign & Edit – Smarter
                </p>
              </div>
               <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => setIsDonateOpen(true)}>
                    <Heart className="mr-2 h-5 w-5 fill-current" />
                    Donate
                  </Button>
                   <Button size="lg" variant="outline" asChild>
                     <Link href="#tools">
                      <Grid className="mr-2 h-5 w-5"/>
                       Explore All Tools
                     </Link>
                  </Button>
              </div>
            </div>
            <Image
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover w-full"
              data-ai-hint="digital tools files"
              height="310"
              src="https://placehold.co/550x310.png"
              width="550"
            />
          </div>
      </section>

      <AllTools />
      <DonateDialog isOpen={isDonateOpen} onOpenChange={setIsDonateOpen} />
    </>
  );
}
