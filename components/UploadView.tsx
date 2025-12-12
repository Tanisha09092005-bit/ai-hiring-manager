import React, { useState, useRef } from 'react';
import { Upload, Briefcase, Building, Loader2, FileText, CheckCircle } from 'lucide-react';
import { JobContext } from '../types';

interface UploadViewProps {
  onStart: (context: JobContext) => void;
  isLoading: boolean;
}

const UploadView: React.FC<UploadViewProps> = ({ onStart, isLoading }) => {
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [company, setCompany] = useState('Google');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      onStart({
        role,
        company,
        resumeBase64: base64Data,
        resumeMimeType: file.type
      });
    };
  };

  return (
    <div className="max-w-xl mx-auto pt-20 px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">AI Hiring Manager</h1>
        <p className="text-gray-400">
          Simulate a high-stakes interview. Upload your resume and see if you can pass the bar.
        </p>
      </div>

      <div className="bg-brand-card border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4" /> Target Company
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-brand-dark border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="e.g. Google, OpenAI, Netflix"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Target Role
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-brand-dark border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="e.g. Senior Backend Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Resume (PDF)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                file ? 'border-brand-success/50 bg-brand-success/5' : 'border-gray-700 hover:border-brand-accent hover:bg-brand-dark'
              }`}
            >
              {file ? (
                <>
                  <CheckCircle className="w-10 h-10 text-brand-success mb-3" />
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-gray-300 font-medium">Click to Upload Resume</p>
                  <p className="text-xs text-gray-500 mt-1">PDF Recommended</p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full bg-brand-accent hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Start Interview Simulation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadView;
