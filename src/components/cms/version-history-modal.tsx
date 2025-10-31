'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  History,
  RotateCcw,
  Clock,
  User,
  FileText,
  Eye,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryItem {
  data: any;
  timestamp: number;
  description?: string;
  isCurrent: boolean;
}

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: VersionHistoryItem[];
  onRestore: (index: number) => void;
  onPreview?: (data: any) => void;
  onClearHistory?: () => void;
  currentIndex: number;
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  versions,
  onRestore,
  onPreview,
  onClearHistory,
  currentIndex
}: VersionHistoryModalProps) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = (data: any) => {
    setPreviewData(data);
    setShowPreview(true);
    if (onPreview) {
      onPreview(data);
    }
  };

  const handleRestore = (index: number) => {
    onRestore(index);
    onOpenChange(false);
  };

  const getVersionTitle = (version: VersionHistoryItem) => {
    if (version.description) return version.description;
    
    const date = new Date(version.timestamp);
    return `Version from ${date.toLocaleString()}`;
  };

  const getVersionChanges = (current: any, previous: any) => {
    if (!previous) return 'Initial version';
    
    const changes = [];
    if (current.title !== previous.title) changes.push('Title');
    if (current.content !== previous.content) changes.push('Content');
    if (current.excerpt !== previous.excerpt) changes.push('Excerpt');
    if (JSON.stringify(current.seo) !== JSON.stringify(previous.seo)) changes.push('SEO');
    
    return changes.length > 0 ? `Changed: ${changes.join(', ')}` : 'No changes detected';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of your content. You have {versions.length} versions saved.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Version List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Versions</h3>
              {onClearHistory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearHistory}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-colors ${
                      version.isCurrent
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {getVersionTitle(version)}
                          </h4>
                          {version.isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Admin
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {getVersionChanges(
                            version.data,
                            index < versions.length - 1 ? versions[index + 1].data : null
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(version.data)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(index)}
                          className="flex-1"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            
            {previewData ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {previewData.title || 'Untitled'}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Excerpt</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {previewData.excerpt || 'No excerpt'}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Content Preview</Label>
                    <div className="text-sm text-muted-foreground mt-1 max-h-32 overflow-hidden">
                      {previewData.content ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: previewData.content.substring(0, 300) + '...' 
                        }} />
                      ) : (
                        'No content'
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">SEO Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={
                          (previewData.seo?.score || 0) >= 80 ? 'default' :
                          (previewData.seo?.score || 0) >= 60 ? 'secondary' : 'destructive'
                        }
                      >
                        {previewData.seo?.score || 0}/100
                      </Badge>
                    </div>
                  </div>

                  {previewData.categories && previewData.categories.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium">Categories</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {previewData.categories.map((category: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {previewData.tags && previewData.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {previewData.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}