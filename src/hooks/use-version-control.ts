"use client";

import { useState, useCallback, useRef } from 'react';

interface VersionState<T> {
  data: T;
  timestamp: number;
  description?: string;
}

interface UseVersionControlOptions {
  maxVersions?: number;
  debounceMs?: number;
}

export function useVersionControl<T = string>(
  initialData?: T,
  options: UseVersionControlOptions = {}
) {
  const { maxVersions = 50, debounceMs = 1000 } = options;
  
  const [versions, setVersions] = useState<VersionState<T>[]>(() => {
    if (initialData !== undefined) {
      return [{ data: initialData, timestamp: Date.now(), description: 'Initial state' }];
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout>();

  const currentData = versions[currentIndex]?.data || initialData;

  const saveVersion = useCallback((newData: T, description?: string) => {
    // Clear any pending debounced save
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setVersions(prev => {
        // Remove any versions after current index (when user made changes after undo)
        const newVersions = prev.slice(0, currentIndex + 1);
        
        // Add new version
        newVersions.push({
          data: newData,
          timestamp: Date.now(),
          description: description || `Change at ${new Date().toLocaleTimeString()}`
        });

        // Limit number of versions
        if (newVersions.length > maxVersions) {
          newVersions.shift();
          setCurrentIndex(prev => Math.max(0, prev - 1));
        } else {
          setCurrentIndex(newVersions.length - 1);
        }

        return newVersions;
      });
    }, debounceMs);
  }, [currentIndex, maxVersions, debounceMs]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < versions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentIndex, versions.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < versions.length - 1;

  const getVersionHistory = useCallback(() => {
    return versions.map((version, index) => ({
      ...version,
      isCurrent: index === currentIndex
    }));
  }, [versions, currentIndex]);

  const jumpToVersion = useCallback((index: number) => {
    if (index >= 0 && index < versions.length) {
      setCurrentIndex(index);
      return true;
    }
    return false;
  }, [versions.length]);

  const clearHistory = useCallback(() => {
    setVersions([{ data: currentData, timestamp: Date.now(), description: 'Reset' }]);
    setCurrentIndex(0);
  }, [currentData]);

  return {
    currentData,
    saveVersion,
    undo,
    redo,
    canUndo,
    canRedo,
    getVersionHistory,
    jumpToVersion,
    clearHistory,
    versionsCount: versions.length,
    currentIndex
  };
}

export default useVersionControl;