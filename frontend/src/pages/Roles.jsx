import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Check, Trash2, Edit2, Shield } from 'lucide-react';
import { RoleBadge } from '../components/common/Badge';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissionIds: [] });
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      if (rRes.success) setRoles(rRes.data.roles);
      if (pRes.success) setPermissions(pRes.data.permissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (role = null) => {
    setError('');
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissionIds: role.permissions.map((p) => p._id),
      });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', permissionIds: [] });
    }
    setShowModal(true);
  };

  const handleTogglePermission = (pId) => {
    setFormData((prev) => {
      const exists = prev.permissionIds.includes(pId);
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((id) => id !== pId)
          : [...prev.permissionIds, pId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingRole) {
        await adminService.updateRole(editingRole._id, formData);
      } else {
        await adminService.createRole(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this custom role?')) return;
    try {
      await adminService.deleteRole(roleId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Role deletion failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            ROLE-BASED ACCESS CONTROL (RBAC) ARCHITECTURE
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure security roles, hierarchy levels & permission matrix bindings
          </p>
        </div>

        {hasPermission('role:create') && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs font-mono rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE CUSTOM ROLE</span>
          </button>
        )}
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role._id}
            className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RoleBadge role={role.name} />
                  {role.isSystemRole && (
                    <span className="text-[10px] font-mono text-gray-500 bg-[#0B0F19] px-2 py-0.5 rounded border border-[#1F2937]">
                      SYSTEM DEFINED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasPermission('role:update') && (
                    <button
                      onClick={() => handleOpenModal(role)}
                      className="p-1 text-gray-400 hover:text-cyan-400"
                      title="Edit Permissions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {hasPermission('role:delete') && !role.isSystemRole && (
                    <button
                      onClick={() => handleDelete(role._id)}
                      className="p-1 text-gray-400 hover:text-red-400"
                      title="Delete Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-2">{role.description}</p>

              <div className="mt-4">
                <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Assigned Permissions ({role.permissions ? role.permissions.length : 0}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.map((p) => (
                      <span
                        key={p._id || p}
                        className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded"
                      >
                        {p.name || p}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-gray-500 italic">No permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating/Editing Role */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-4 font-mono">
            <h2 className="text-lg font-bold text-gray-100">
              {editingRole ? `EDIT ROLE PERMISSIONS: ${editingRole.name}` : 'CREATE CUSTOM SECURITY ROLE'}
            </h2>
            {error && <div className="text-xs text-red-400 p-2 bg-red-500/10 rounded border border-red-500/30">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">ROLE NAME</label>
                <input
                  type="text"
                  required
                  disabled={editingRole?.isSystemRole}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] p-2 rounded text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">DESCRIPTION</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] p-2 rounded text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">GRANULAR PERMISSION MATRIX</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 bg-[#0B0F19] border border-[#1F2937] rounded-lg">
                  {permissions.map((p) => {
                    const isChecked = formData.permissionIds.includes(p._id);
                    return (
                      <label
                        key={p._id}
                        onClick={() => handleTogglePermission(p._id)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-all text-xs ${
                          isChecked
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            : 'bg-[#111827] border-[#1F2937] text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked ? 'bg-cyan-500 border-cyan-400 text-gray-950' : 'border-gray-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-gray-200"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-gray-950 font-bold text-xs rounded hover:bg-cyan-400"
                >
                  SAVE ROLE CONFIGURATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
