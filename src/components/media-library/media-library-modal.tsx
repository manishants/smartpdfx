"use client";

import { useState } from 'react';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MediaLibrary } from './media-library';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  alt?: string;
}

interface MediaLibraryModalProps {
  onSelect: (file: MediaFile) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  trigger?: React.ReactNode;
  title?: string;
}

export function MediaLibraryModal({
  onSelect,
  multiple = false,
  accept = "image/*",
  maxSize = 5,
  trigger,
  title = "Media Library"
}: MediaLibraryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (file: MediaFile) => {
    onSelect(file);
    if (!multiple) {
      setIsOpen(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <Image className="h-4 w-4" />
      Add Image
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <MediaLibrary
            onSelect={handleSelect}
            multiple={multiple}
            accept={accept}
            maxSize={maxSize}
          />
        </div>
        {multiple && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy integration
export function useMediaLibrary() {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);

  const openMediaLibrary = (onSelect: (file: MediaFile) => void, options?: {
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
  }) => {
    // This would typically open the media library modal
    // For now, we'll return the modal component
    return {
      onSelect,
      ...options
    };
  };

  return {
    selectedFiles,
    setSelectedFiles,
    openMediaLibrary
  };
}