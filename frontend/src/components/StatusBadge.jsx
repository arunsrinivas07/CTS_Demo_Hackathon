import React from 'react';

export default function StatusBadge({ status }) {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  
  switch ((status || '').toLowerCase()) {
    case 'escalated':
      style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      break;
    case 'under review':
      style = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
      break;
    case 'open':
      style = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
      break;
    case 'resolved':
    case 'safe':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
      break;
    case 'dismissed':
      style = 'bg-slate-100 text-slate-500 border-slate-200';
      break;
    default:
      style = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs border ${style}`}>
      {status || 'Open'}
    </span>
  );
}
