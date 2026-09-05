import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function TrafficBarChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { hour: '00:00', total: 12, authFailures: 1, forbidden: 0, rateLimited: 0 },
    { hour: '04:00', total: 8, authFailures: 0, forbidden: 1, rateLimited: 0 },
    { hour: '08:00', total: 45, authFailures: 2, forbidden: 3, rateLimited: 1 },
    { hour: '12:00', total: 95, authFailures: 5, forbidden: 2, rateLimited: 2 },
    { hour: '16:00', total: 60, authFailures: 3, forbidden: 1, rateLimited: 0 },
    { hour: '20:00', total: 30, authFailures: 1, forbidden: 0, rateLimited: 0 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="hour" stroke="#6B7280" fontSize={11} tickLine={false} />
          <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F3F4F6', borderRadius: '8px' }}
          />
          <Bar dataKey="total" fill="#06B6D4" name="Total Requests" radius={[4, 4, 0, 0]} />
          <Bar dataKey="authFailures" fill="#F59E0B" name="401 Unauthorized" radius={[4, 4, 0, 0]} />
          <Bar dataKey="forbidden" fill="#EF4444" name="403 Forbidden" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rateLimited" fill="#8B5CF6" name="429 Rate Limited" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RolePieChart({ data = [] }) {
  const COLORS = ['#EF4444', '#8B5CF6', '#06B6D4', '#10B981'];

  const chartData = data.length > 0
    ? data.map((d) => ({ name: d._id || d.name, value: d.count || d.value }))
    : [
        { name: 'Admin', value: 1 },
        { name: 'Manager', value: 2 },
        { name: 'Employee', value: 5 },
        { name: 'Guest', value: 3 },
      ];

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F3F4F6', borderRadius: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
