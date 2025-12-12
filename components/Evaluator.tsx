import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Play, AlertCircle, CheckCircle, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Evaluator: React.FC = () => {
  const [code, setCode] = useState(`# Paste your solution code here
import pandas as pd
import numpy as np

def preprocess(df):
    # TODO: Implement features
    return df
`);
  const [problem, setProblem] = useState('Predict customer churn based on usage patterns.');
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = async () => {
    if (!code.trim()) return;
    
    setIsEvaluating(true);
    setEvaluation(null);
    
    try {
      const result = await geminiService.evaluateSubmission(code, problem);
      setEvaluation(result);
    } catch (error) {
      setEvaluation("**Error:** Failed to evaluate code. Please check API Key.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex h-full p-6 gap-6 overflow-hidden">
        {/* Input Section */}
        <div className="w-1/2 flex flex-col gap-4">
            <div className="bg-kaggle-card border border-kaggle-border rounded-xl p-4 flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-400">Problem Context</label>
                <input 
                    className="bg-kaggle-dark border border-kaggle-border rounded-lg p-2 text-white focus:outline-none focus:border-kaggle-blue"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                />
            </div>
            
            <div className="flex-1 bg-kaggle-card border border-kaggle-border rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-kaggle-border flex justify-between items-center bg-kaggle-dark/50">
                    <span className="text-sm font-mono text-gray-400 flex items-center gap-2">
                        <Code className="w-4 h-4" /> solution.py
                    </span>
                    <button
                        onClick={handleEvaluate}
                        disabled={isEvaluating}
                        className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isEvaluating ? 'Judging...' : (
                            <>
                                <Play className="w-3 h-3 fill-current" />
                                Run Evaluation
                            </>
                        )}
                    </button>
                </div>
                <textarea 
                    className="flex-1 bg-[#0d1117] p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none"
                    spellCheck={false}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </div>
        </div>

        {/* Output Section */}
        <div className="w-1/2 bg-kaggle-card border border-kaggle-border rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-kaggle-border bg-kaggle-dark/30">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-kaggle-blue" />
                    Gemini Evaluation Report
                </h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                {isEvaluating ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-pulse">
                        <Code className="w-12 h-12 mb-4 opacity-50" />
                        <p>Analyzing logic structure...</p>
                        <p className="text-xs mt-2">Running gemini-3-pro-preview</p>
                    </div>
                ) : evaluation ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{evaluation}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                        <p>Submit code to receive a comprehensive review</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Evaluator;
