import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { ImagePlus, Download, Sparkles, AlertTriangle } from 'lucide-react';

const Augmentor: React.FC = () => {
  const [prompt, setPrompt] = useState('An MRI scan of a healthy human brain, top-down view, high contrast');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
        const url = await geminiService.generateSyntheticImage(prompt);
        if (url) {
            setHistory(prev => [{
                url,
                prompt,
                timestamp: new Date()
            }, ...prev]);
        }
    } catch (err) {
        console.error("Generation failed");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4">
             <h2 className="text-3xl font-bold text-white mb-2">Synthetic Data Augmentor</h2>
             <p className="text-gray-400">Generate high-quality synthetic images for training datasets using <span className="text-kaggle-blue font-mono">gemini-3-pro-image-preview</span>.</p>
        </div>

        {/* Generator Controls */}
        <div className="px-8 pb-8">
            <form onSubmit={handleGenerate} className="flex gap-4">
                <div className="flex-1 relative">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-kaggle-card border border-kaggle-border rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-kaggle-blue shadow-lg"
                        placeholder="Describe the training sample you need..."
                    />
                    <Sparkles className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                </div>
                <button 
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-kaggle-blue hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-kaggle-blue text-white font-medium px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                    {isGenerating ? 'Generating...' : (
                        <>
                            <ImagePlus className="w-5 h-5" />
                            Generate
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
            {history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-kaggle-border rounded-xl text-gray-500">
                    <ImagePlus className="w-12 h-12 mb-4 opacity-50" />
                    <p>No synthetic data generated yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((img, idx) => (
                        <div key={idx} className="group bg-kaggle-card border border-kaggle-border rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
                            <div className="aspect-square relative bg-kaggle-dark">
                                <img src={img.url} alt="Generated" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a href={img.url} download={`synthetic_${idx}.png`} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors">
                                        <Download className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-300 line-clamp-2" title={img.prompt}>{img.prompt}</p>
                                <p className="text-xs text-gray-500 mt-2">{img.timestamp.toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Warning Footer */}
        <div className="px-8 py-4 bg-yellow-900/20 border-t border-yellow-900/50 flex items-center justify-center text-yellow-500 text-sm gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Synthetic data should be validated before including in production training sets.</span>
        </div>
    </div>
  );
};

export default Augmentor;
