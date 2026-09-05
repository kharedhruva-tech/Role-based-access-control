import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { Users as UsersIcon, UserPlus, Trash2, Edit, CheckCircle, XCircle, Search } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', roleId: '' });
  const [error, setError] = useState('');

  const { hasPermission, user: currentUser } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getRoles(),
      ]);
      if (uRes.success) setUsers(uRes.data.users);
      if (rRes.success) {
        setRoles(rRes.data.roles);
        if (rRes.data.roles.length > 0) {
          setFormData((prev) => ({ ...prev, roleId: rRes.data.roles[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminService.createUser(formData);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({ username: '', email: '', password: '', roleId: roles[0]?._id || '' });
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create user account');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete operation denied by RBAC gatekeeper');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-cyan-400" />
            USER IDENTITY MANAGEMENT
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage system identities, authentication credentials & RBAC role bindings
          </p>
        </div>

        {hasPermission('user:create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs font-mono rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>CREATE USER IDENTITY</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-[#111827] border border-[#1F2937] p-3 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-xs text-left font-mono">
          <thead className="text-gray-400 bg-[#0B0F19] border-b border-[#1F2937]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role Binding</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-[#0B0F19]/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-gray-200">{u.username}</div>
                  <div className="text-gray-400 text-[11px]">{u.email}</div>
                </td>
                <td className="py-3.5 px-4">
                  <RoleBadge role={u.role ? u.role.name : 'Unassigned'} />
                </td>
                <td className="py-3.5 px-4">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <XCircle className="w-3 h-3" /> DISABLED
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-gray-400">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {hasPermission('user:delete') && (
                    <button
                      onClick={() => handleDelete(u._id)}
                      disabled={u._id === currentUser?.id}
                      title={u._id === currentUser?.id ? 'Cannot delete self' : 'Delete user'}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating User */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4 font-mono">
            <h2 className="text-lg font-bold text-gray-100">CREATE NEW USER IDENTITY</h2>
            {error && <div className="text-xs text-red-400 p-2 bg-red-500/10 rounded border border-red-500/30">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">USERNAME</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] p-2 rounded text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] p-2 rounded text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] p-2 rounded text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">ASSIGNED RBAC ROLE</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] p-2 rounded text-xs text-gray-200"
                >
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} - {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-gray-200"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-gray-950 font-bold text-xs rounded hover:bg-cyan-400"
                >
                  CONFIRM & CREATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
