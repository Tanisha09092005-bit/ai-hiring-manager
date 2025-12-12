import React from 'react';
import { LeaderboardEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Users, Award, TrendingUp } from 'lucide-react';

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, team: "NeuralNinjas", score: 0.9842, entries: 45, lastSubmission: "2h ago" },
  { rank: 2, team: "GradientDescent", score: 0.9811, entries: 32, lastSubmission: "5m ago" },
  { rank: 3, team: "Overfitters", score: 0.9795, entries: 128, lastSubmission: "1d ago" },
  { rank: 4, team: "GeminiFan", score: 0.9750, entries: 12, lastSubmission: "4h ago" },
  { rank: 5, team: "DataWizard", score: 0.9722, entries: 67, lastSubmission: "12h ago" },
];

const mockChartData = [
    { name: 'Mon', submissions: 120 },
    { name: 'Tue', submissions: 150 },
    { name: 'Wed', submissions: 180 },
    { name: 'Thu', submissions: 220 },
    { name: 'Fri', submissions: 280 },
    { name: 'Sat', submissions: 350 },
    { name: 'Sun', submissions: 410 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Competition Overview</h2>
        <p className="text-gray-400 max-w-2xl">
          Welcome to the Gemini 3 Deep Learning Challenge. Use the tools provided to build next-generation models using the latest Gemini API capabilities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Teams', value: '1,248', icon: Users, color: 'text-blue-400' },
          { label: 'Top Score', value: '0.9842', icon: Trophy, color: 'text-yellow-400' },
          { label: 'Total Submissions', value: '14.5k', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Prize Pool', value: '$100,000', icon: Award, color: 'text-purple-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-kaggle-card border border-kaggle-border p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Leaderboard */}
        <div className="bg-kaggle-card border border-kaggle-border rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Live Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-kaggle-dark/50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Rank</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3 rounded-r-lg">Entries</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((entry) => (
                  <tr key={entry.rank} className="border-b border-kaggle-border/50 hover:bg-kaggle-dark/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-white">#{entry.rank}</td>
                    <td className="px-4 py-4">{entry.team}</td>
                    <td className="px-4 py-4 text-kaggle-blue font-mono font-bold">{entry.score}</td>
                    <td className="px-4 py-4">{entry.entries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-kaggle-card border border-kaggle-border rounded-xl p-6 flex flex-col">
           <h3 className="text-xl font-bold text-white mb-6">Submission Activity</h3>
           <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={mockChartData}>
                 <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2126', borderColor: '#30333b', color: '#fff' }}
                    cursor={{ fill: '#30333b' }}
                 />
                 <Bar dataKey="submissions" radius={[4, 4, 0, 0]}>
                    {mockChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === mockChartData.length - 1 ? '#20BEFF' : '#374151'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
