"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number; // milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
  onError
}: UseAutoSaveOptions<T>) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);
  const savePromiseRef = useRef<Promise<void> | null>(null);

  const performSave = useCallback(async () => {
    if (isSaving || !hasUnsavedChanges) return;

    try {
      setIsSaving(true);
      const savePromise = onSave(data);
      savePromiseRef.current = savePromise;
      
      await savePromise;
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      toast({
        title: "Auto-saved",
        description: "Your changes have been automatically saved.",
        duration: 2000,
      });
    } catch (error) {
      const err = error as Error;
      console.error('Auto-save failed:', err);
      
      if (onError) {
        onError(err);
      } else {
        toast({
          title: "Auto-save failed",
          description: err.message || "Failed to save changes automatically.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsSaving(false);
      savePromiseRef.current = null;
    }
  }, [data, isSaving, hasUnsavedChanges, onSave, onError, toast]);

  // Detect changes in data
  useEffect(() => {
    const dataChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    if (dataChanged) {
      setHasUnsavedChanges(true);
      lastDataRef.current = data;
    }
  }, [data]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        performSave();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasUnsavedChanges, isSaving, performSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSaving) {
        // Try to save synchronously
        if (savePromiseRef.current) {
          event.preventDefault();
          event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSaving]);

  const forceSave = useCallback(async () => {
    if (hasUnsavedChanges) {
      await performSave();
    }
  }, [hasUnsavedChanges, performSave]);

  const getTimeSinceLastSave = useCallback(() => {
    if (!lastSaved) return null;
    return Date.now() - lastSaved.getTime();
  }, [lastSaved]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    forceSave,
    getTimeSinceLastSave
  };
}

export default useAutoSave;