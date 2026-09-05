import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { StatusBadge, RoleBadge } from '../components/common/Badge';
import { FileText, Search, Filter, RefreshCw } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ status: statusFilter, limit: 100 });
      if (res.success) setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      (l.userId?.username && l.userId.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            SYSTEM AUDIT TRAIL LOGS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Immutable audit record of all API transactions, authentication attempts & RBAC actions
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-[#1F2937] text-xs font-mono text-cyan-400 rounded-lg hover:border-gray-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RELOAD LOGS</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111827] border border-[#1F2937] p-3 rounded-xl font-mono text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs by action, endpoint, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-lg pl-9 pr-3 py-1.5 text-gray-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B0F19] border border-[#1F2937] text-gray-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="">ALL AUDIT STATUSES</option>
            <option value="SUCCESS">SUCCESS (2xx)</option>
            <option value="DENIED">DENIED (401/403)</option>
            <option value="RATE_LIMITED">RATE_LIMITED (429)</option>
            <option value="FAILED">FAILED (5xx)</option>
          </select>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg font-mono text-xs">
        <table className="w-full text-left">
          <thead className="text-gray-400 bg-[#0B0F19] border-b border-[#1F2937]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Correlation Request ID</th>
              <th className="py-3 px-4">Identity / Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Endpoint</th>
              <th className="py-3 px-4">Status Code</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {filteredLogs.map((log) => (
              <tr key={log._id} className="hover:bg-[#0B0F19]/50 transition-colors">
                <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-cyan-400 font-mono text-[11px] truncate max-w-[140px]">
                  {log.requestId}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-gray-200">{log.userId?.username || 'ANONYMOUS'}</div>
                  <RoleBadge role={log.userRole} />
                </td>
                <td className="py-3 px-4 font-bold text-gray-200">{log.action}</td>
                <td className="py-3 px-4 text-gray-300">
                  <span className="text-cyan-400 font-bold mr-1.5">{log.httpMethod}</span>
                  {log.endpoint}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge statusCode={log.statusCode} />
                </td>
                <td className="py-3 px-4 text-gray-400">{log.ipAddress}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No matching audit trail logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
