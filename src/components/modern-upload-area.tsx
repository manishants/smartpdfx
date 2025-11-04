"use client";

import { ReactNode, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { GoogleToolBelowUploadAd } from "@/components/google-tool-below-upload-ad";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  maxSize = 50 * 1024 * 1024 // 50MB default
}: ModernUploadAreaProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Call handler once per file to support multi-select while
      // keeping the single-file callback signature.
      for (const f of acceptedFiles) {
        onFileSelect(f);
      }
    }
  }, [onFileSelect]);

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
          
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {/* Icon */}
            <div className={cn(
              "p-4 rounded-full transition-colors",
              isDragActive && !isDragReject ? "bg-primary/10" : "bg-muted/50",
              isDragReject && "bg-destructive/10"
            )}>
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : icon ? (
                <div className="text-muted-foreground">
                  {icon}
                </div>
              ) : (
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              )}
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
        </CardContent>
      </Card>
      {/* Ad: renders consistently below upload area across all tool pages */}
      <GoogleToolBelowUploadAd />
    </div>
  );
}