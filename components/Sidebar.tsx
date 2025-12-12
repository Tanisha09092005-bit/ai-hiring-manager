import React from 'react';
import { View } from '../types';
import { LayoutDashboard, MessageSquareCode, Code2, ImagePlus, Trophy, Video } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { view: View.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
    { view: View.MENTOR, label: 'AI Mentor', icon: MessageSquareCode },
    { view: View.EVALUATOR, label: 'Code Review', icon: Code2 },
    { view: View.AUGMENTOR, label: 'Data Augmentor', icon: ImagePlus },
    { view: View.VIDEO_INSIGHTS, label: 'Video Insights', icon: Video },
  ];

  return (
    <div className="w-64 bg-kaggle-card border-r border-kaggle-border flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-kaggle-border flex items-center gap-3">
        <div className="bg-kaggle-blue p-2 rounded-lg">
           <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="font-bold text-lg text-white leading-tight">Gemini 3</h1>
            <p className="text-xs text-gray-400">Competition Hub</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-kaggle-blue/10 text-kaggle-blue border border-kaggle-blue/20'
                  : 'text-gray-400 hover:bg-kaggle-dark hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-kaggle-border">
        <div className="bg-kaggle-dark p-3 rounded-lg border border-kaggle-border">
            <p className="text-xs text-gray-500 mb-1">Competition Ends In</p>
            <p className="text-sm font-mono text-white">12d 04h 22m</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
