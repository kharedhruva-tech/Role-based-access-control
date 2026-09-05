import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './Badge';
import { Menu, Shield, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#111827]/80 backdrop-blur-md border-b border-[#1F2937] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg tracking-wide">
          <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">CYBERGATEWAY</span>
          <span className="hidden sm:inline text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
            v1.0.0-GATEWAY
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="hidden sm:inline">GATEWAY ACTIVE (PORT 5000)</span>
          <span className="sm:hidden">ACTIVE</span>
        </div>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-[#1F2937]">
            <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-200 leading-none">{user.username}</div>
                <div className="mt-1">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
