"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { getPublicKeyId } from "@/lib/razorpay";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type DonateDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  upiId?: string;
  qrUrl?: string;
  title?: string;
};

export default function DonateDialog({ isOpen, onOpenChange, upiId, qrUrl, title }: DonateDialogProps) {
  const [upiCopied, setUpiCopied] = useState(false);
  const [amount, setAmount] = useState<string>("199");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const scriptLoaded = useRef<boolean>(false);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const fallbackUpi = "manishants@ybl";
  const heading = title || "Buy a Cup of Coffee for me";

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        scriptLoaded.current = true;
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (isOpen) loadRazorpayScript();
  }, [isOpen, loadRazorpayScript]);

  const startRazorpayCheckout = async () => {
    setError("");
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, currency: "INR", notes: { purpose: "donation" } }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson?.order?.id) {
        throw new Error(orderJson?.error || "Failed to create order");
      }

      const key = getPublicKeyId();
      if (!key) {
        throw new Error("Razorpay key is not configured");
      }

      const options = {
        key,
        amount: orderJson.order.amount,
        currency: orderJson.order.currency,
        name: "SmartPDFx",
        description: "Buy a Cup of Coffee for me",
        order_id: orderJson.order.id,
        theme: { color: "#3b82f6" },
        handler: async (resp: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resp),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson?.success) {
              onOpenChange(false);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (e: any) {
            setError(e?.message || "Verification error.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        notes: { source: "donation_dialog" },
      };

      if (!scriptLoaded.current) {
        const ok = await loadRazorpayScript();
        if (!ok) throw new Error("Failed to load Razorpay checkout script");
      }
      // eslint-disable-next-line new-cap
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
          {/* Amount + Razorpay */}
          <div className="space-y-2">
            <Label htmlFor="donationAmount" className="font-semibold">Amount (INR)</Label>
            <div className="flex items-center gap-2">
              <Input id="donationAmount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-white/5 border-white/10" />
              <Button onClick={startRazorpayCheckout} disabled={loading} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white">
                {loading ? 'Processing…' : 'Buy a Cup of Coffee for me'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          {/* PayPal removed per request */}
        </div>
      </DialogContent>
    </Dialog>
  );
}