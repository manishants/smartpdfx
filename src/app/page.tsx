"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { tools } from "@/lib/data";
import Image from "next/image";
import { ArrowDownUp, FileSignature, Scissors, FileJson, RotateCcw, Copy, Check, Heart, Grid, X, Sparkles, Zap, Star, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AllTools } from "@/components/all-tools";
import { Badge } from "@/components/ui/badge";
function DonateDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [upiCopied, setUpiCopied] = useState(false);
  const [paypalCopied, setPaypalCopied] = useState(false);
  const copyToClipboard = (text: string, setter: (value: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };
  
  const upiId = "manishants@ybl";
  const paypalId = "manishants@gmail.com";
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Support SmartPDFx
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your contributions help keep this service free. Thank you! ✨
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center gap-4">
             <div className="p-3 bg-white/90 rounded-2xl border border-white/20 shadow-lg">
                <Image
                  src="/donation_qr_smartpdfx.webp"
                  alt="Scan to pay"
                  width={200}
                  height={200}
                  className="rounded-xl"
                  data-ai-hint="qr code"
                />
            </div>
             <p className="text-sm font-medium text-muted-foreground">Scan QR Code to Pay with any UPI App</p>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="upiId" className="font-semibold">UPI ID</Label>
             <div className="flex items-center gap-2">
              <Input id="upiId" value={upiId} readOnly className="bg-white/5 border-white/10" />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(upiId, setUpiCopied)} className="hover:bg-white/10">
                {upiCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="paypalId" className="font-semibold">PayPal</Label>
             <div className="flex items-center gap-2">
              <Input id="paypalId" value={paypalId} readOnly className="bg-white/5 border-white/10" />
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(paypalId, setPaypalCopied)} className="hover:bg-white/10">
                 {paypalCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
}
function FeatureCard({ icon: Icon, title, description, color }: { 
  icon: any; 
  title: string; 
  description: string; 
  color: string;
}) {
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
export default function Home() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process files in seconds with our optimized algorithms",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Advanced AI technology for superior results",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Professional-grade output for all your needs",
      color: "from-blue-500 to-cyan-500"
    }
  ];
  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
        </div>
        {/* Floating Icons */}
        <div className="absolute inset-0 -z-10">
            <ArrowDownUp className="absolute top-[10%] left-[5%] h-8 w-8 text-primary/20 rotate-12 animate-pulse" />
            <FileSignature className="absolute top-[20%] right-[10%] h-10 w-10 text-blue-400/20 -rotate-6 animate-bounce" />
            <Scissors className="absolute bottom-[15%] left-[20%] h-7 w-7 text-fuchsia-400/20 rotate-3 animate-pulse" />
            <FileJson className="absolute bottom-[25%] right-[25%] h-9 w-9 text-indigo-400/20 rotate-12 animate-bounce" />
            <RotateCcw className="absolute top-[60%] right-[15%] h-8 w-8 text-primary/20 -rotate-12 animate-pulse" />
            <Sparkles className="absolute top-[70%] left-[10%] h-6 w-6 text-fuchsia-400/20 rotate-6 animate-bounce" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 lg:gap-16 items-center relative z-10">
            <div className={`flex flex-col justify-center space-y-8 text-center lg:text-left items-center lg:items-start transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary border-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered Tools
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
                  <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                    Transform Files with
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SmartPDFx
                  </span>
                </h1>
                
                <p className="max-w-[600px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                  The most advanced online toolkit for PDFs, images, and documents. 
                  <span className="text-primary font-medium"> Compress, convert, edit, and enhance</span> with 
                  cutting-edge AI technology.
                </p>
                {/* Stats */}
                <div className="flex flex-wrap gap-8 justify-center lg:justify-start text-center">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      <AnimatedCounter end={50} />+
                    </div>
                    <div className="text-sm text-muted-foreground">Tools Available</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      <AnimatedCounter end={1000000} />+
                    </div>
                    <div className="text-sm text-muted-foreground">Files Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      100%
                    </div>
                    <div className="text-sm text-muted-foreground">Free to Use</div>
                  </div>
                </div>
              </div>
              
               <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group" asChild>
                    <Link href="#tools">
                      <Play className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      Start Creating
                    </Link>
                  </Button>
                  
                  <Button size="lg" variant="outline" onClick={() => setIsDonateOpen(true)} className="border-primary/20 hover:bg-primary/5 group">
                    <Heart className="mr-2 h-5 w-5 fill-current text-red-500 group-hover:scale-110 transition-transform" />
                    Support Us
                  </Button>
              </div>
            </div>
            
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-3xl" />
                <Image
                  alt="SmartPDFx Hero"
                  className="relative mx-auto aspect-video overflow-hidden rounded-3xl object-cover w-full shadow-2xl border border-white/10"
                  data-ai-hint="digital tools files"
                  height="400"
                  src="/hero_section_smartpdfx.webp"
                  width="600"
                />
              </div>
            </div>
          </div>
      </section>
      {/* Features Section */}
      <section className="w-full py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">SmartPDFx</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of file processing with our advanced AI-powered tools
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className={`transition-all duration-500 delay-${index * 100}`}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <AllTools />
      <DonateDialog isOpen={isDonateOpen} onOpenChange={setIsDonateOpen} />
    </>
  );
}
