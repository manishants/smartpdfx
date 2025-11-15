"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

type DonateDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  upiId?: string;
  qrUrl?: string;
  title?: string;
};

export default function DonateDialog({ isOpen, onOpenChange, upiId, qrUrl, title }: DonateDialogProps) {
  const [upiCopied, setUpiCopied] = useState(false);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const fallbackUpi = "manishants@ybl";
  const heading = title || "Support SmartPDFx";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {heading}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your contributions help keep this service free. Thank you! ✨
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* QR Code */}
          {qrUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-white/90 rounded-2xl border border-white/20 shadow-lg">
                <Image src={qrUrl} alt="Scan to pay" width={200} height={200} className="rounded-xl" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Scan QR Code to pay with any UPI app</p>
            </div>
          )}

          {/* UPI ID */}
          <div className="space-y-2">
            <Label htmlFor="upiId" className="font-semibold">UPI ID</Label>
            <div className="flex items-center gap-2">
              <Input id="upiId" value={upiId || fallbackUpi} readOnly className="bg-white/5 border-white/10" />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(upiId || fallbackUpi, setUpiCopied)} className="hover:bg-white/10">
                {upiCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {/* PayPal removed per request */}
        </div>
      </DialogContent>
    </Dialog>
  );
}