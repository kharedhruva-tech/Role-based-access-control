import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, permission, role }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-cyan-400">Verifying Gateway JWT Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if ((permission && !hasPermission(permission)) || (role && user.role !== role)) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-[#111827] border border-red-500/30 rounded-xl shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 mb-4 border border-red-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-red-400 font-mono">403 FORBIDDEN - ACCESS DENIED</h2>
        <p className="mt-2 text-sm text-gray-400">
          Your active security role <span className="text-cyan-400 font-semibold">{user.role}</span> is not allowed to view this protected resource:
        </p>
        <div className="mt-4 p-3 bg-[#0B0F19] rounded-lg border border-[#1F2937] inline-block text-xs font-mono text-red-400">
          Required Access: {role ? `${role} role` : permission}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          This security restriction is strictly enforced at both API Gateway (Port 5000) and Server-side authorization layers.
        </p>
      </div>
    );
  }

  return children;
}
