import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { Key, Shield } from 'lucide-react';

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getPermissions().then((res) => {
      if (res.success) setPermissions(res.data.permissions);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
          <Key className="w-5 h-5 text-cyan-400" />
          GRANULAR SYSTEM PERMISSIONS REGISTRY
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Catalog of atomic action capabilities evaluated by the API Gateway authorization engine
        </p>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg font-mono text-xs">
        <table className="w-full text-left">
          <thead className="text-gray-400 bg-[#0B0F19] border-b border-[#1F2937]">
            <tr>
              <th className="py-3 px-4">Permission Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {permissions.map((p) => (
              <tr key={p._id} className="hover:bg-[#0B0F19]/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-cyan-400">{p.name}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px]">
                    {p.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-300">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
