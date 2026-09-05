import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Key,
  FileText,
  AlertTriangle,
  User,
  Settings,
  MapPinned,
} from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { hasPermission } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, perm: null },
    { label: 'Users Management', path: '/users', icon: Users, perm: 'user:read' },
    { label: 'Roles Architecture', path: '/roles', icon: ShieldCheck, perm: 'role:read' },
    { label: 'Permissions Registry', path: '/permissions', icon: Key, perm: 'role:read' },
    { label: 'Audit Trail Logs', path: '/audit-logs', icon: FileText, perm: 'audit:read' },
    { label: 'Security Alerts', path: '/security-events', icon: AlertTriangle, perm: 'security:read' },
    { label: 'Incident Source Map', path: '/incident-map', icon: MapPinned, role: 'Admin' },
    { label: 'User Profile', path: '/profile', icon: User, perm: null },
    { label: 'System Settings', path: '/settings', icon: Settings, perm: null },
  ];

  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111827] border-r border-[#1F2937] p-4 flex flex-col justify-between transform transition-transform lg:static lg:min-h-[calc(100vh-4rem)] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">
          Security Controls
        </div>
        {navItems.map((item) => {
          if ((item.perm && !hasPermission(item.perm)) || (item.role && !hasPermission('security:read'))) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F2937]/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#1F2937] text-xs">
        <div className="text-gray-400 font-medium">Gateway Rate Limiter</div>
        <div className="mt-1 flex items-center justify-between text-gray-500 font-mono">
          <span>Max Requests:</span>
          <span className="text-cyan-400">100 / 15m</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between text-gray-500 font-mono">
          <span>Auth Max:</span>
          <span className="text-amber-400">10 / 15m</span>
        </div>
      </div>
      </aside>
    </>
  );
}
