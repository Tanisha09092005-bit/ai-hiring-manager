import React, { useState, useRef, useEffect } from 'react';
import { ResumeAnalysis, ChatMessage, JobContext } from '../types';
import { Send, User, Bot, AlertTriangle, CheckCircle, Target, TrendingUp, XCircle, MoreHorizontal, Linkedin, LogOut } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface InterviewViewProps {
  analysis: ResumeAnalysis;
  initialMessage: string;
  context: JobContext;
  onEnd: () => void;
}

const InterviewView: React.FC<InterviewViewProps> = ({ analysis, initialMessage, context, onEnd }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add the AI's opening line
    setMessages([{
      id: '1',
      role: 'model',
      text: initialMessage || "Hello. I've reviewed your resume. Let's get started."
    }]);
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await geminiService.sendMessage(userMsg.text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShare = () => {
    // Use the specific Vercel URL for sharing
    const appUrl = "https://ai-hiring-manager.vercel.app/";
    
    const text = `I just challenged the AI Hiring Manager Simulator! 🤖💼\n\nTarget Role: ${context.role}\nTarget Company: ${context.company}\n\nMy Score: ${analysis.score}/100\nVerdict: ${analysis.passProbability} Probability of Passing\n\nCan you beat my score? Try it here: ${appUrl}\n\n#AI #TechInterview #CareerGrowth #GeminiAPI`;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark">
      
      {/* LEFT PANEL: Analysis Dashboard */}
      <div className="w-[400px] border-r border-gray-800 bg-brand-card/50 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Candidate Evaluation</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-4xl font-bold text-white">{analysis.score}<span className="text-gray-600 text-lg">/100</span></p>
              <p className="text-sm text-gray-400">Resume Match Score</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
              analysis.passProbability === 'High' ? 'bg-green-500/10 border-green-500 text-green-500' :
              analysis.passProbability === 'Medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
              'bg-red-500/10 border-red-500 text-red-500'
            }`}>
              {analysis.passProbability.toUpperCase()} PROBABILITY
            </div>
          </div>

          <div className="bg-brand-dark rounded-lg p-4 border border-gray-800 mb-6">
            <p className="text-sm text-gray-300 italic">"{analysis.summary}"</p>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-3 bg-[#0077b5] hover:bg-[#006396] text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Linkedin className="w-5 h-5" />
            Share Result on LinkedIn
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Red Flags */}
          <div>
            <h3 className="text-brand-danger flex items-center gap-2 font-bold mb-3 text-sm">
              <AlertTriangle className="w-4 h-4" /> REJECTION RISKS
            </h3>
            <ul className="space-y-2">
              {analysis.redFlags.map((flag, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-brand-success flex items-center gap-2 font-bold mb-3 text-sm">
              <CheckCircle className="w-4 h-4" /> KEY STRENGTHS
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((item, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                   <TrendingUp className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                   {item}
                </li>
              ))}
            </ul>
          </div>

           {/* Interview Focus */}
           <div>
            <h3 className="text-brand-accent flex items-center gap-2 font-bold mb-3 text-sm">
              <Target className="w-4 h-4" /> INTERVIEW FOCUS
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.interviewFocus.map((item, i) => (
                <span key={i} className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-xs rounded border border-brand-accent/20">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Chat Interface */}
      <div className="flex-1 flex flex-col bg-brand-dark relative">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-brand-dark/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="font-mono text-sm text-gray-300">LIVE INTERVIEW SESSION</span>
          </div>
          <button 
            onClick={onEnd}
            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            End Interview
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start max-w-3xl'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-gray-300" />
                </div>
              )}
              
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-brand-accent text-white rounded-br-none max-w-xl' 
                  : 'bg-brand-card border border-gray-700 text-gray-200 rounded-bl-none'
              }`}>
                <div className="prose prose-invert prose-sm">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-4 max-w-3xl">
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-gray-300" />
                </div>
                <div className="bg-brand-card border border-gray-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <MoreHorizontal className="w-5 h-5 text-gray-500 animate-pulse" />
                  <span className="text-xs text-gray-500 uppercase font-bold">Listening...</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-brand-dark border-t border-gray-800">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="w-full bg-brand-card border border-gray-700 rounded-xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent shadow-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-3 p-2 bg-brand-accent hover:bg-blue-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:bg-gray-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewView;