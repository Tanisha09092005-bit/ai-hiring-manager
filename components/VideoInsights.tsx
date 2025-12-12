import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { VideoAnalysisResult } from '../types';
import { Upload, Video, Search, FileVideo, Loader2, PlayCircle, Eye, Activity, AlignLeft } from 'lucide-react';

const VideoInsights: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("For this demo, please use video files smaller than 20MB to avoid browser memory issues.");
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setResult(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    try {
      const base64Data = await fileToBase64(videoFile);
      const data = await geminiService.analyzeVideo(base64Data, videoFile.type);
      setResult(data);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze video. Please check API key and file format.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="flex h-full p-6 gap-6 overflow-hidden">
      {/* Left Column: Upload & Player */}
      <div className="w-1/3 flex flex-col gap-6">
        <div className="bg-kaggle-card border border-kaggle-border rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-kaggle-blue" />
            Input Source
          </h3>
          
          <input 
            type="file" 
            accept="video/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="hidden" 
          />

          {!videoUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-kaggle-border rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-kaggle-blue hover:bg-kaggle-dark/50 transition-all group"
            >
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-kaggle-blue mb-2 transition-colors" />
              <p className="text-sm text-gray-400 font-medium">Click to upload video</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WEBM (Max 20MB)</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-kaggle-border">
              <video src={videoUrl} controls className="w-full h-full object-contain" />
              <button 
                onClick={() => { setVideoUrl(null); setVideoFile(null); setResult(null); }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-red-500/80 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                Change
              </button>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!videoFile || isAnalyzing}
            className="w-full py-3 bg-kaggle-blue hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-kaggle-blue text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Multimodal Input...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Generate Insights
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-kaggle-card/50 border border-kaggle-border rounded-xl p-4 text-sm text-gray-400">
           <p className="mb-2"><strong className="text-white">How it works:</strong></p>
           <ul className="list-disc pl-4 space-y-1">
             <li>Video is processed by <span className="font-mono text-kaggle-blue">gemini-2.5-flash</span>.</li>
             <li>Visual frames are analyzed for objects & actions.</li>
             <li>Audio track is transcribed verbatim.</li>
             <li>Reasoning engine synthesizes a summary.</li>
           </ul>
        </div>
      </div>

      {/* Right Column: Knowledge Base */}
      <div className="flex-1 flex flex-col bg-kaggle-card border border-kaggle-border rounded-xl overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-kaggle-border bg-kaggle-dark/30 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-purple-400" />
            Knowledge Base
          </h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Filter insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!result}
              className="w-full bg-kaggle-dark border border-kaggle-border rounded-lg py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-kaggle-blue"
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <Activity className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Waiting for analysis...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Summary */}
              {matchesSearch(result.summary) && (
                <div className="space-y-2">
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" /> Summary
                  </h4>
                  <p className="text-gray-200 leading-relaxed bg-kaggle-dark/50 p-4 rounded-lg border border-kaggle-border">
                    {result.summary}
                  </p>
                </div>
              )}

              {/* Objects & Actions Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Detected Objects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.objects.filter(matchesSearch).length > 0 ? (
                      result.objects.filter(matchesSearch).map((obj, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm">
                          {obj}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">No matching objects found.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                   <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Actions
                  </h4>
                  <ul className="space-y-2">
                    {result.actions.filter(matchesSearch).length > 0 ? (
                      result.actions.filter(matchesSearch).map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                          {action}
                        </li>
                      ))
                    ) : (
                      <span className="text-gray-500 italic text-sm">No matching actions found.</span>
                    )}
                  </ul>
                </div>
              </div>

              {/* Transcript */}
              {matchesSearch(result.transcript) && (
                <div className="space-y-2 pt-4 border-t border-kaggle-border">
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" /> Full Transcript
                  </h4>
                  <div className="bg-kaggle-dark/30 p-4 rounded-lg border border-kaggle-border max-h-60 overflow-y-auto text-sm text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
                    {result.transcript || "No speech detected in this video."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInsights;
