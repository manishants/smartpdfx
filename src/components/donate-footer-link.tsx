"use client";

import DonateDialog from "@/components/donate-dialog";
import { useState } from "react";

export function DonateFooterLink() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
      >
        Donate
      </button>
      <DonateDialog isOpen={open} onOpenChange={setOpen} title="Buy a Cup of Coffee for me" qrUrl="/qr.jpg" />
    </>
  );
}