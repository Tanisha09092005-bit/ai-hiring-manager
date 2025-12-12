import React, { useState } from 'react';
import UploadView from './components/UploadView';
import InterviewView from './components/InterviewView';
import { JobContext, ResumeAnalysis } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'upload' | 'interview'>('upload');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [jobContext, setJobContext] = useState<JobContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async (context: JobContext) => {
    setIsLoading(true);
    setJobContext(context);
    try {
      // 1. Analyze Resume
      const result = await geminiService.analyzeResume(context);
      setAnalysis(result);
      
      // 2. Start Interview Session
      geminiService.startInterview(context, result);
      
      // 3. Get Opening Line
      const opening = await geminiService.sendMessage("The candidate has sat down. Start the interview now.");
      setInitialMessage(opening);
      
      setView('interview');
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to analyze resume. Please check the API Key or try a different file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setJobContext(null);
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans">
      {view === 'upload' && (
        <UploadView onStart={handleStart} isLoading={isLoading} />
      )}
      {view === 'interview' && analysis && jobContext && (
        <InterviewView 
          analysis={analysis} 
          initialMessage={initialMessage} 
          context={jobContext}
          onEnd={handleReset}
        />
      )}
    </div>
  );
};

export default App;