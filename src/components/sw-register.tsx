"use client";

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Avoid double registrations during HMR in dev
      const url = '/sw.js';
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (!reg) return navigator.serviceWorker.register(url);
          return reg.update();
        })
        .catch(() => {
          // Silently ignore registration errors; SW is a progressive enhancement
        });
    }
  }, []);

  return null;
}