import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Mentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: "Hello! I'm your Gemini 3 Mentor. I can help you with data preprocessing strategies, model architecture design, or debugging your pipeline. What's your challenge today?",
        timestamp: new Date(),
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = geminiService.sendMessageStream(userMsg.text);
      
      let fullResponse = '';
      const responseId = (Date.now() + 1).toString();
      
      // Add placeholder for streaming message
      setMessages(prev => [...prev, {
        id: responseId,
        role: 'model',
        text: '',
        timestamp: new Date(),
        isThinking: true
      }]);

      for await (const chunk of stream) {
        if (chunk) {
            fullResponse += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === responseId 
                ? { ...msg, text: fullResponse, isThinking: false } 
                : msg
            ));
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered a connection error. Please check your API key and network.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-kaggle-dark">
        {/* Chat Header */}
        <div className="p-6 border-b border-kaggle-border flex justify-between items-center bg-kaggle-card/50">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-kaggle-blue" />
                    Gemini 3 Mentor
                </h2>
                <p className="text-sm text-gray-400">Powered by gemini-3-pro-preview (Thinking Enabled)</p>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-kaggle-blue flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-2xl p-5 ${
                        msg.role === 'user' 
                        ? 'bg-kaggle-blue text-white rounded-br-none' 
                        : 'bg-kaggle-card border border-kaggle-border text-gray-100 rounded-bl-none'
                    }`}>
                        {msg.isThinking && !msg.text ? (
                             <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Reasoning...</span>
                             </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        )}
                        <span className="text-[10px] opacity-50 mt-2 block text-right">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>

                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-kaggle-border bg-kaggle-card">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about model architectures, feature selection, or debugging..."
                    className="w-full bg-kaggle-dark border border-kaggle-border rounded-xl py-4 pl-5 pr-14 text-white focus:outline-none focus:border-kaggle-blue focus:ring-1 focus:ring-kaggle-blue transition-all shadow-inner"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-3 p-2 bg-kaggle-blue hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-kaggle-blue text-white rounded-lg transition-colors"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>
        </div>
    </div>
  );
};

export default Mentor;
