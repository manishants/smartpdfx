"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  targetId?: string;
  height?: number;
  className?: string;
};

export function ReadingProgress({ targetId = "article-body", height = 4, className = "mt-2" }: Props) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);

    const compute = () => {
      const totalScroll = (() => {
        if (!target) {
          const doc = document.documentElement;
          return doc.scrollHeight - window.innerHeight;
        }
        const rect = target.getBoundingClientRect();
        const startY = rect.top + window.scrollY;
        const endY = startY + target.offsetHeight - window.innerHeight;
        return Math.max(endY - startY, 1);
      })();

      const currentScroll = (() => {
        if (!target) return window.scrollY;
        const rect = target.getBoundingClientRect();
        const startY = rect.top + window.scrollY;
        return Math.max(window.scrollY - startY, 0);
      })();

      const p = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      setProgress(p);
    };

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };

    const onResize = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize as any);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetId]);

  return (
    <div className={className} aria-label="Reading progress">
      <div
        className="w-full bg-muted rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="bg-primary h-full transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}