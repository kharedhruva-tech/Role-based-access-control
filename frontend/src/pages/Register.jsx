import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(username, email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight font-mono">CREATE IDENTITY</h1>
          <p className="text-sm text-gray-400 mt-1">Register new user account (Default Role: Employee)</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5">USERNAME</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full bg-[#0B0F19] border border-[#1F2937] focus:border-cyan-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@security.local"
                className="w-full bg-[#0B0F19] border border-[#1F2937] focus:border-cyan-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B0F19] border border-[#1F2937] focus:border-cyan-500 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            {loading ? 'REGISTERING USER...' : 'CREATE ACCOUNT & GENERATE JWT'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
}
