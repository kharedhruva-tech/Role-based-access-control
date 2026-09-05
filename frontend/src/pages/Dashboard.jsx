import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import StatCard from '../components/dashboard/StatCard';
import { TrafficBarChart, RolePieChart } from '../components/dashboard/SecurityChart';
import { StatusBadge, RoleBadge } from '../components/common/Badge';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldAlert,
  Zap,
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentAudits, setRecentAudits] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [mRes, aRes, sRes] = await Promise.all([
        adminService.getSecurityMetrics().catch(() => ({ data: {} })),
        adminService.getAuditLogs({ limit: 8 }).catch(() => ({ data: { logs: [] } })),
        adminService.getSecurityEvents({ limit: 5 }).catch(() => ({ data: { events: [] } })),
      ]);

      if (mRes?.data) setMetrics(mRes.data);
      if (aRes?.data?.logs) setRecentAudits(aRes.data.logs);
      if (sRes?.data?.events) setSecurityEvents(sRes.data.events);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); // 15s auto refresh
    return () => clearInterval(interval);
  }, []);

  const summary = metrics?.summary || {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    authFailures: 0,
    authzFailures: 0,
    rateLimitViolations: 0,
    totalUsers: 0,
    activeUsers: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            SECURITY MONITORING OPERATIONS CENTER
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time API Gateway Telemetry, Authentication Metrics & RBAC Enforcement Stream
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE MONITORING
            {lastUpdated && <span className="text-gray-500">UPDATED {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-[#1F2937] hover:border-gray-700 text-xs font-mono text-cyan-400 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH METRICS</span>
        </button>
      </div>

      {/* Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gateway Traffic"
          value={summary.totalRequests}
          icon={Activity}
          color="cyan"
          subtitle="Processed Requests"
        />
        <StatCard
          title="Successful Responses"
          value={summary.successfulRequests}
          icon={CheckCircle2}
          color="emerald"
          subtitle="HTTP 200 / 201 Success"
        />
        <StatCard
          title="401 Auth Failures"
          value={summary.authFailures}
          icon={Lock}
          color="amber"
          subtitle="Unauthenticated Calls"
        />
        <StatCard
          title="403 Forbidden Denials"
          value={summary.authzFailures}
          icon={ShieldAlert}
          color="red"
          subtitle="RBAC Permission Blocked"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="429 Rate Limit Hits"
          value={summary.rateLimitViolations}
          icon={Zap}
          color="purple"
          subtitle="Throttled IP Limits"
        />
        <StatCard
          title="Active System Users"
          value={`${summary.activeUsers} / ${summary.totalUsers}`}
          icon={Users}
          color="cyan"
          subtitle="Registered Identities"
        />
        <StatCard
          title="Total Failed Requests"
          value={summary.failedRequests}
          icon={AlertCircle}
          color="red"
          subtitle="HTTP 4xx & 5xx Errors"
        />
        <StatCard
          title="Gateway Uptime"
          value="99.98%"
          icon={Clock}
          color="emerald"
          subtitle="Port 5000 Active"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono text-gray-200">API GATEWAY TRAFFIC THROUGHPUT</h2>
              <p className="text-xs text-gray-400">Requests & HTTP status code distribution over time</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span className="inline-block w-2.5 h-2.5 rounded bg-cyan-500"></span> 2xx
              <span className="inline-block w-2.5 h-2.5 rounded bg-amber-500"></span> 401
              <span className="inline-block w-2.5 h-2.5 rounded bg-red-500"></span> 403
              <span className="inline-block w-2.5 h-2.5 rounded bg-purple-500"></span> 429
            </div>
          </div>
          <TrafficBarChart data={metrics?.hourlyTraffic || []} />
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold font-mono text-gray-200">USER ROLE DISTRIBUTION</h2>
            <p className="text-xs text-gray-400">Breakdown of identities assigned across RBAC roles</p>
          </div>
          <RolePieChart data={metrics?.usersByRole || []} />
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#1F2937]">
            <div className="flex items-center gap-1.5 text-red-400">👑 Admin</div>
            <div className="flex items-center gap-1.5 text-purple-400">💼 Manager</div>
            <div className="flex items-center gap-1.5 text-cyan-400">👨‍💻 Employee</div>
            <div className="flex items-center gap-1.5 text-emerald-400">👁️ Guest</div>
          </div>
        </div>
      </div>

      {/* Live Stream Logs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Events */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-gray-200">RECENT AUDIT TRAIL LOGS</h2>
            <span className="text-xs font-mono text-gray-500">LIVE FEED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="text-gray-400 border-b border-[#1F2937]">
                <tr>
                  <th className="py-2 px-1">Action</th>
                  <th className="py-2 px-1">Role</th>
                  <th className="py-2 px-1">Method</th>
                  <th className="py-2 px-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {recentAudits.map((log) => (
                  <tr key={log._id || log.requestId} className="hover:bg-[#0B0F19]/50 transition-colors">
                    <td className="py-2.5 px-1 font-semibold text-gray-200">{log.action}</td>
                    <td className="py-2.5 px-1"><RoleBadge role={log.userRole} /></td>
                    <td className="py-2.5 px-1 text-cyan-400">{log.httpMethod}</td>
                    <td className="py-2.5 px-1"><StatusBadge statusCode={log.statusCode} /></td>
                  </tr>
                ))}
                {recentAudits.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No audit logs captured yet. Perform API requests to trigger telemetry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Incident Alerts */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              SECURITY INCIDENT ALERTS
            </h2>
            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              ACTIVE DEFENSE
            </span>
          </div>

          <div className="space-y-2">
            {securityEvents.map((evt) => (
              <div
                key={evt._id}
                className="p-3 bg-[#0B0F19] border border-red-500/20 rounded-lg text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400">{evt.eventType}</span>
                  <span className="text-gray-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-300">{evt.description}</div>
                <div className="text-gray-500 text-[10px]">
                  Source IP: {evt.sourceIp} | Endpoint: {evt.endpoint}
                </div>
              </div>
            ))}
            {securityEvents.length === 0 && (
              <div className="p-6 text-center text-gray-500 font-mono text-xs">
                No active security alerts recorded. Systems running within normal operational boundaries.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
