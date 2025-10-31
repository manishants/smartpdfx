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
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI-Powered Features</h3>
      </div>
      
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}