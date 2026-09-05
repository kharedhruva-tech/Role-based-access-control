import React from 'react';

export const RoleBadge = ({ role }) => {
  let colorClass = 'bg-gray-800 text-gray-300 border-gray-700';

  switch (role) {
    case 'Admin':
      colorClass = 'bg-red-500/10 text-red-400 border-red-500/30';
      break;
    case 'Manager':
      colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      break;
    case 'Employee':
      colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      break;
    case 'Guest':
      colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${colorClass}`}>
      {role}
    </span>
  );
};

export const StatusBadge = ({ statusCode }) => {
  let colorClass = 'bg-gray-800 text-gray-300 border-gray-700';

  if (statusCode >= 200 && statusCode < 300) {
    colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (statusCode === 401) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (statusCode === 403) {
    colorClass = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (statusCode === 429) {
    colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  } else if (statusCode >= 500) {
    colorClass = 'bg-rose-500/10 text-rose-500 border-rose-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${colorClass}`}>
      {statusCode}
    </span>
  );
};
