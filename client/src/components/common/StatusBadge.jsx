import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10';
      case 'Shortlisted':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';
      case 'Interview':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/10';
      case 'Offer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const getDotStyle = () => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500';
      case 'Shortlisted':
        return 'bg-amber-500';
      case 'Interview':
        return 'bg-purple-500 animate-pulse';
      case 'Offer':
        return 'bg-emerald-500';
      case 'Rejected':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ring-1 ring-inset ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`}></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
