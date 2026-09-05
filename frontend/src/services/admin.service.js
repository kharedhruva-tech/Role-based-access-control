import api from './api';

export const adminService = {
  // Users
  getUsers: async () => (await api.get('/users')).data,
  getUserById: async (id) => (await api.get(`/users/${id}`)).data,
  createUser: async (data) => (await api.post('/users', data)).data,
  updateUser: async (id, data) => (await api.put(`/users/${id}`, data)).data,
  deleteUser: async (id) => (await api.delete(`/users/${id}`)).data,

  // Roles & Permissions
  getRoles: async () => (await api.get('/roles')).data,
  createRole: async (data) => (await api.post('/roles', data)).data,
  updateRole: async (id, data) => (await api.put(`/roles/${id}`, data)).data,
  deleteRole: async (id) => (await api.delete(`/roles/${id}`)).data,
  getPermissions: async () => (await api.get('/permissions')).data,

  // Audit Logs & Security Metrics
  getAuditLogs: async (params = {}) => (await api.get('/audit-logs', { params })).data,
  getSecurityEvents: async (params = {}) => (await api.get('/security/events', { params })).data,
  getSecurityMetrics: async () => (await api.get('/security/metrics')).data,
};
