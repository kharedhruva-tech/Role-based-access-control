import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { User, Key, Shield, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken');

  return (
    <div className="space-y-6 max-w-4xl font-mono">
      <div>
        <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          ACTIVE USER PROFILE & JWT INSPECTOR
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          View your session identity, assigned RBAC permissions, and active JWT claim payload
        </p>
      </div>

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#1F2937] p-5 rounded-xl shadow-lg space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-2xl mx-auto">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-100">{user.username}</h2>
              <p className="text-xs text-gray-400">{user.email}</p>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
            <div className="pt-3 border-t border-[#1F2937] text-xs text-gray-500 text-center">
              Account ID: {user.id}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#111827] border border-[#1F2937] p-5 rounded-xl shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              ASSIGNED GRANULAR PERMISSIONS ({user.permissions?.length || 0})
            </h2>

            <div className="flex flex-wrap gap-2">
              {user.permissions && user.permissions.length > 0 ? (
                user.permissions.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic">No direct permissions assigned</span>
              )}
            </div>

            <div className="pt-4 border-t border-[#1F2937]">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-amber-400" />
                ACTIVE JWT ACCESS TOKEN (RAW)
              </h3>
              <div className="p-3 bg-[#0B0F19] border border-[#1F2937] rounded-lg text-[10px] text-amber-400/80 break-all select-all">
                {token || 'No active token found in localStorage'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
