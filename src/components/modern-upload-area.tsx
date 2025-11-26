"use client";

import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { GoogleToolBelowUploadAd } from "@/components/google-tool-below-upload-ad";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, Clipboard, Camera, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';

interface ModernUploadAreaProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  isLoading?: boolean;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  multiple?: boolean;
  maxSize?: number;
  children?: ReactNode;
}

export function ModernUploadArea({
  onFileSelect,
  accept,
  isLoading = false,
  icon,
  title = "Drop files here",
  subtitle = "or click to select files",
  className,
  multiple = false,
  maxSize = 50 * 1024 * 1024, // 50MB default
  children
}: ModernUploadAreaProps) {
  const { toast } = useToast();
  const pasteRef = useRef<HTMLTextAreaElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [showPasteTip, setShowPasteTip] = useState(false);
  const [driveDialogOpen, setDriveDialogOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const acceptsImage = useMemo(() => {
    if (!accept) return false;
    return accept.includes('image');
  }, [accept]);

  const isAcceptedType = useCallback((type: string) => {
    if (!accept) return true;
    // Simple accept handling: exact match or wildcard like image/*
    const parts = accept.split(',').map(s => s.trim());
    for (const p of parts) {
      if (p.endsWith('/*')) {
        const prefix = p.slice(0, -1);
        if (type.startsWith(prefix)) return true;
      } else if (type === p) {
        return true;
      }
    }
    return false;
  }, [accept]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Call handler once per file to support multi-select while
      // keeping the single-file callback signature.
      for (const f of acceptedFiles) {
        if (f.size > maxSize) {
          toast({ title: "File too large", description: `Maximum size is ${(maxSize/(1024*1024)).toFixed(0)}MB`, variant: "destructive" });
          continue;
        }
        if (!isAcceptedType(f.type)) {
          toast({ title: "File type not supported", description: `Selected type ${f.type} does not match ${accept}`, variant: "destructive" });
          continue;
        }
        onFileSelect(f);
      }
    }
  }, [onFileSelect, maxSize, isAcceptedType, toast, accept]);

  const importFromUrl = useCallback(async (url: string) => {
    const file = await urlToFile(url);
    if (file.size > maxSize) {
      toast({ title: "File too large", description: `Maximum size is ${(maxSize/(1024*1024)).toFixed(0)}MB`, variant: "destructive" });
      return;
    }
    if (!isAcceptedType(file.type)) {
      toast({ title: "File type not supported", description: `Fetched type ${file.type} does not match ${accept}`, variant: "destructive" });
      return;
    }
    onFileSelect(file);
  }, [maxSize, toast, isAcceptedType, accept, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxSize,
    disabled: isLoading
  });

  return (
    <div className={cn("w-full", className)}>
      <Card 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          isLoading && "cursor-not-allowed opacity-50"
        )}
      >
        <CardContent className="p-8 md:p-12">
          <input {...getInputProps()} />
          
          {/** If children provided, render them; otherwise show default UI */}
          {children ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              {/* Icon with gradient ring */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-xl animate-pulse" />
                <div className={cn(
                  "relative p-6 rounded-full border transition-colors",
                  isDragActive && !isDragReject ? "border-primary bg-primary/10" : "border-border/50 bg-background/80",
                  isDragReject && "border-destructive bg-destructive/10"
                )}>
                  {isLoading ? (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  ) : icon ? (
                    <div className="text-primary">
                      {icon}
                    </div>
                  ) : (
                    <UploadCloud className="h-12 w-12 text-primary" />
                  )}
                </div>
              </div>
              
              {/* Text */}
              <div className="space-y-2">
                <h3 className={cn(
                  "text-lg font-semibold transition-colors",
                  isDragActive && !isDragReject && "text-primary",
                  isDragReject && "text-destructive"
                )}>
                  {isDragActive && !isDragReject ? "Drop files here" : 
                   isDragReject ? "File type not supported" : 
                   title}
                </h3>
                
                {!isDragActive && !isLoading && (
                  <p className="text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {/* Button */}
              {!isDragActive && !isLoading && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                  disabled={isLoading}
                >
                  Select Files
                </Button>
              )}
              
              {/* Loading state */}
              {isLoading && (
                <p className="text-sm text-muted-foreground">
                  Processing...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional upload options */}
      {!isLoading && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white hover:opacity-90 shadow-sm hover:shadow-md border-0"
            onClick={() => setDriveDialogOpen(true)}
          >
            <Cloud className="h-4 w-4" /> From Google Drive
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-sm hover:shadow-md border-0"
            onClick={() => {
              setShowPasteTip(true);
              pasteRef.current?.focus();
            }}
          >
            <Clipboard className="h-4 w-4" /> Paste
          </Button>
          {acceptsImage && (
            <>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple={multiple}
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  for (const f of files) {
                    if (f.size > maxSize) {
                      toast({ title: "File too large", description: `Maximum size is ${(maxSize/(1024*1024)).toFixed(0)}MB`, variant: "destructive" });
                      continue;
                    }
                    if (!isAcceptedType(f.type)) {
                      toast({ title: "File type not supported", description: `Selected type ${f.type} does not match ${accept}`, variant: "destructive" });
                      continue;
                    }
                    onFileSelect(f);
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" /> Camera
              </Button>
            </>
          )}
        </div>
      )}

      {/* Hidden paste target */}
      <textarea
        ref={pasteRef}
        className={cn("sr-only")}
        onPaste={async (e) => {
          setShowPasteTip(false);
          const items = e.clipboardData?.items ? Array.from(e.clipboardData.items) : [];
          const files: File[] = [];
          for (const it of items) {
            if (it.kind === 'file') {
              const f = it.getAsFile();
              if (f) files.push(f);
            }
          }
          if (files.length > 0) {
            for (const f of files) {
              if (f.size > maxSize) {
                toast({ title: "File too large", description: `Maximum size is ${(maxSize/(1024*1024)).toFixed(0)}MB`, variant: "destructive" });
                continue;
              }
              if (!isAcceptedType(f.type)) {
                toast({ title: "File type not supported", description: `Selected type ${f.type} does not match ${accept}`, variant: "destructive" });
                continue;
              }
              onFileSelect(f);
            }
            return;
          }

          const text = e.clipboardData?.getData('text/plain');
          if (text && /^https?:\/\//i.test(text)) {
            try {
              await importFromUrl(text);
            } catch (err: any) {
              toast({ title: "Paste failed", description: err?.message || "Could not import from pasted URL.", variant: "destructive" });
            }
          } else {
            toast({ title: "Nothing to import", description: "Paste an image/file or a public URL.", variant: "destructive" });
          }
        }}
      />

      {showPasteTip && (
        <p className="mt-2 text-xs text-muted-foreground">Press Ctrl+V/⌘V to paste an image, file, or URL.</p>
      )}

      {/* Google Drive Link Dialog */}
      <Dialog open={driveDialogOpen} onOpenChange={setDriveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from Google Drive</DialogTitle>
            <DialogDescription>
              Paste a public Google Drive file link. We will try to download it directly in your browser.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDriveDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!driveLink) return;
                  setIsImporting(true);
                  try {
                    const id = extractDriveId(driveLink);
                    if (!id) {
                      throw new Error('Could not parse Google Drive link. Please paste a file URL.');
                    }
                    const url = `https://drive.google.com/uc?id=${id}&export=download`;
                    await importFromUrl(url);
                    setDriveDialogOpen(false);
                    setDriveLink("");
                  } catch (err: any) {
                    toast({ title: "Drive import failed", description: err?.message || "Link may not be public or is blocked by CORS.", variant: "destructive" });
                  } finally {
                    setIsImporting(false);
                  }
                }}
                disabled={isImporting}
              >
                {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad: renders consistently below upload area across all tool pages */}
      <GoogleToolBelowUploadAd />
    </div>
  );
}

async function urlToFile(url: string, fileName?: string): Promise<File> {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status}`);
  }
  const blob = await res.blob();
  const inferredName = fileName || inferFileNameFromUrl(url) || 'downloaded-file';
  const type = blob.type || inferMimeFromName(inferredName) || 'application/octet-stream';
  return new File([blob], inferredName, { type });
}


function inferFileNameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const last = pathname.split('/').filter(Boolean).pop();
    return last || null;
  } catch {
    return null;
  }
}

function inferMimeFromName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
}

function extractDriveId(link: string): string | null {
  try {
    // /file/d/<id>/view
    const m1 = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1 && m1[1]) return m1[1];
    // uc?id=<id>
    const m2 = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2 && m2[1]) return m2[1];
    return null;
  } catch {
    return null;
  }
}