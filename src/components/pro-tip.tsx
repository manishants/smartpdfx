import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ProTipProps {
  tip?: string;
}

const defaultTip = "For best results, upload images in the order you want them to appear in the PDF. Our AI will optimize the layout while maintaining your preferred sequence.";

export function ProTip({ tip = defaultTip }: ProTipProps) {
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-purple-500/20 rounded-lg">
          <Lightbulb className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-purple-300 mb-2">Pro Tip</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}