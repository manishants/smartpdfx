"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DonateDialog from "@/components/donate-dialog";
import { NewsletterForm } from "@/components/newsletter-form";
import { Heart, Mail } from "lucide-react";

export default function ToolsDonateSubscribe() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-24">
      <Card className="border border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>Support & Subscribe</CardTitle>
          <CardDescription>Help keep tools free and get updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={() => setOpen(true)} className="w-full bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 mr-2" /> Donate
            </Button>
            <p className="text-xs text-muted-foreground">Small contributions go a long way.</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" /> Subscribe to updates
            </div>
            <NewsletterForm category="General" />
          </div>
        </CardContent>
      </Card>
      <DonateDialog isOpen={open} onOpenChange={setOpen} qrUrl="/qr.jpg" />
    </div>
  );
}