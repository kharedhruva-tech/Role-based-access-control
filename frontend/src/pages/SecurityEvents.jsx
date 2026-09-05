import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';

const isPrivateIp = (ip) => !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');

export default function SecurityEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSecurityEvents({ limit: 50 });
      if (res.success) setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'LOW':
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            SECURITY INCIDENT & THREAT ALERTS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time security events captured by Gateway Rate Limiters & Authorization Enforcers
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-[#1F2937] text-xs font-mono text-cyan-400 rounded-lg hover:border-gray-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RELOAD ALERTS</span>
        </button>
      </div>

      <div className="space-y-3 font-mono">
        {events.map((evt) => (
          <button
            type="button"
            key={evt._id}
            onClick={() => setSelectedEvent(evt)}
            className="bg-[#111827] border border-[#1F2937] hover:border-gray-700 rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(evt.severity)}`}>
                  {evt.severity}
                </span>
                <span className="font-bold text-red-400 text-sm">{evt.eventType}</span>
                <span className="text-xs text-gray-500">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-200">{evt.description}</p>
              <div className="text-[11px] text-gray-500">
                Source IP: <span className="text-cyan-400">{evt.sourceIp}</span> | Endpoint: <span className="text-cyan-400">{evt.endpoint}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] px-2 py-1 bg-[#0B0F19] text-gray-400 border border-[#1F2937] rounded">
                GATEWAY ENFORCED
              </span>
            </div>
          </button>
        ))}

        {events.length === 0 && (
          <div className="p-8 text-center bg-[#111827] border border-[#1F2937] rounded-xl text-gray-500 text-xs">
            No active threat alerts recorded. The API Gateway is currently operating without security violations.
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="bg-[#111827] border border-cyan-500/30 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-cyan-300">ALERT DETAILS</h2>
              <p className="text-xs text-gray-500 mt-1">Full security event record available to Admin</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="px-2 py-1 text-xs font-mono text-gray-400 border border-[#1F2937] rounded hover:text-gray-200"
            >
              CLOSE
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div><span className="text-gray-500">Event:</span> <span className="text-red-400">{selectedEvent.eventType}</span></div>
            <div><span className="text-gray-500">Severity:</span> <span className="text-amber-400">{selectedEvent.severity}</span></div>
            <div><span className="text-gray-500">Resolved:</span> <span className="text-cyan-300">{selectedEvent.resolved ? 'YES' : 'NO'}</span></div>
            <div>
              <span className="text-gray-500">Source IP:</span>{' '}
              {isPrivateIp(selectedEvent.sourceIp) ? (
                <span className="text-amber-400">{selectedEvent.sourceIp} (internal)</span>
              ) : (
                <a
                  href={`https://ipinfo.io/${encodeURIComponent(selectedEvent.sourceIp)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:text-cyan-100 underline"
                >
                  {selectedEvent.sourceIp}
                </a>
              )}
            </div>
            <div><span className="text-gray-500">Endpoint:</span> <span className="text-cyan-300 break-all">{selectedEvent.endpoint}</span></div>
            <div><span className="text-gray-500">Time:</span> <span className="text-gray-300">{new Date(selectedEvent.timestamp).toLocaleString()}</span></div>
          </div>
          <div>
            <div className="text-xs font-mono text-gray-500 mb-2">DESCRIPTION</div>
            <p className="text-sm text-gray-200">{selectedEvent.description}</p>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-[#1F2937] bg-[#0B0F19] p-3 text-[10px] text-gray-400">
            {JSON.stringify(selectedEvent.details || {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
