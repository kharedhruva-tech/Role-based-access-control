import React from 'react';
import { Settings as SettingsIcon, Server, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl font-mono">
      <div>
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          SYSTEM & API GATEWAY SECURITY PARAMETERS
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Active security rules, rate limit thresholds & proxy configuration state
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] p-5 rounded-xl space-y-3">
        <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
          <Sun className="w-4 h-4" /> APPEARANCE
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${theme === 'light' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300' : 'border-[#1F2937] text-gray-400 hover:text-gray-200'}`}
          >
            <Sun className="w-4 h-4" /> LIGHT MODE
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${theme === 'dark' ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300' : 'border-[#1F2937] text-gray-400 hover:text-gray-200'}`}
          >
            <Moon className="w-4 h-4" /> DARK MODE
          </button>
        </div>
        <p className="text-xs text-gray-500">Your appearance preference is saved automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-[#1F2937] p-5 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <Server className="w-4 h-4" /> API GATEWAY CONFIGURATION
          </h2>
          <div className="text-xs space-y-2 text-gray-300">
            <div className="flex justify-between py-1 border-b border-[#1F2937]">
              <span className="text-gray-500">Gateway Port:</span>
              <span>5000</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1F2937]">
              <span className="text-gray-500">Backend Proxy Target:</span>
              <span>http://localhost:5001</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1F2937]">
              <span className="text-gray-500">Cors Policy Origins:</span>
              <span>http://localhost:5173</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Correlation ID Header:</span>
              <span>X-Correlation-ID</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] p-5 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> RATE LIMITING THRESHOLDS
          </h2>
          <div className="text-xs space-y-2 text-gray-300">
            <div className="flex justify-between py-1 border-b border-[#1F2937]">
              <span className="text-gray-500">General API Rate Limit:</span>
              <span>100 requests / 15 mins</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1F2937]">
              <span className="text-gray-500">Authentication Limit:</span>
              <span>10 requests / 15 mins</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1F2937]">
              <span className="text-gray-500">Account Lockout Rule:</span>
              <span>5 failed logins = 15m lock</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Violation Action:</span>
              <span>HTTP 429 & Audit Logged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
