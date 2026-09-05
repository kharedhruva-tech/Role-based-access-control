import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'cyan', subtitle }) {
  const colorStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-gray-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">{title}</div>
          <div className="text-2xl font-bold font-mono text-gray-100 mt-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
        <div className={`p-3 rounded-lg border ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
