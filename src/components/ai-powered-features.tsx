import React from 'react';
import { Sparkles, Zap, Target, CheckCircle } from 'lucide-react';

interface AIPoweredFeaturesProps {
  features?: string[];
}

const defaultFeatures = [
  "Intelligent layout optimization",
  "Automatic image orientation", 
  "Smart page sizing",
  "Quality preservation"
];

export function AIPoweredFeatures({ features = defaultFeatures }: AIPoweredFeaturesProps) {
  return (
    <div className="rounded-lg p-6 border border-border bg-card dark:bg-gradient-to-br dark:from-primary/15 dark:to-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">AI-Powered Features</h3>
      </div>
      
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}