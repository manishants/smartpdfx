"use client";

import { useState } from 'react';

export default function BackgroundBlurPage() {
    const [stage, setStage] = useState<'upload' | 'processing' | 'result'>('upload');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Background Blur Tool
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Blur the background of your images with AI
                        </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <p>Current stage: {stage}</p>
                        <button 
                            onClick={() => setStage('processing')}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Test Button
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}