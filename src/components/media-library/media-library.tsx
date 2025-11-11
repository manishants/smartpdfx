"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Search, Grid, List, Trash2, Download, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  alt?: string;
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}

export function MediaLibrary({ 
  onSelect, 
  multiple = false, 
  accept = "image/*", 
  maxSize = 5 
}: MediaLibraryProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing project images from API
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/cms/media/list');
        if (resp.ok) {
          const json = await resp.json();
          const libraryFiles = Array.isArray(json.files) ? json.files.map((f: any) => ({
            ...f,
            uploadedAt: new Date(f.uploadedAt)
          })) : [];
          setFiles(prev => [...libraryFiles, ...prev]);
        }
      } catch {}
    })();
  }, []);

  const handleFileUpload = useCallback(async (uploadedFiles: FileList) => {
    setIsUploading(true);
    
    try {
      const newFiles: MediaFile[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds ${maxSize}MB limit`,
            variant: "destructive"
          });
          continue;
        }
        // Try to persist to local filesystem via API
        let url = '';
        let serverAlt: string | undefined;
        let savedName: string | undefined;
        try {
          const fd = new FormData();
          fd.append('file', file);
          const base = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
          fd.append('slug', base);
          const resp = await fetch('/api/cms/blog/upload', { method: 'POST', body: fd });
          if (resp.ok) {
            const json = await resp.json();
            url = json.url || '';
            serverAlt = json.alt || undefined;
            savedName = json.name || undefined;
          }
        } catch {}
        // Fallback to object URL for preview if upload fails
        if (!url) {
          url = URL.createObjectURL(file);
        }
        
        const toAlt = (nameOrUrl: string) => {
          const base = (nameOrUrl.split('/').pop() || nameOrUrl).replace(/\.[^.]+$/, '');
          return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
        };

        const finalName = savedName || file.name;
        const mediaFile: MediaFile = {
          id: `file-${Date.now()}-${i}`,
          name: finalName,
          url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          alt: serverAlt || toAlt(finalName)
        };
        
        newFiles.push(mediaFile);
      }
      
      setFiles(prev => [...newFiles, ...prev]);
      
      toast({
        title: "Upload successful",
        description: `${newFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.alt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles(prev => 
        prev.includes(file.id) 
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      );
    } else {
      setSelectedFiles([file.id]);
      if (onSelect) {
        onSelect(file);
      }
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    toast({
      title: "File deleted",
      description: "File has been removed from the library"
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "File URL has been copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200",
              isUploading 
                ? "border-yellow-300 bg-yellow-50" 
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {isUploading ? "Uploading..." : "Upload Media Files"}
            </h3>
            <p className="text-slate-500 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            <p className="text-xs text-slate-400 mt-2">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Grid/List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No files uploaded</h3>
            <p className="text-slate-500">Upload your first media file to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
            : "space-y-2"
        )}>
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedFiles.includes(file.id) && "ring-2 ring-yellow-500 shadow-md",
                viewMode === 'list' && "p-2"
              )}
              onClick={() => handleFileSelect(file)}
            >
              {viewMode === 'grid' ? (
                <CardContent className="p-3">
                  <div className="aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(file);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(file);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {previewFile.type.startsWith('image/') && (
                <div className="max-h-96 overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={previewFile.url}
                    alt={previewFile.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Size:</span> {formatFileSize(previewFile.size)}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {previewFile.type}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {previewFile.uploadedAt.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">URL:</span> 
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(previewFile.url)}
                    className="ml-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}