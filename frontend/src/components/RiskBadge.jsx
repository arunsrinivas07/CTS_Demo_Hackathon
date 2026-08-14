import React from 'react';

export default function RiskBadge({ level, score }) {
  const normalized = (level || '').toUpperCase();

  let styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (normalized === 'CRITICAL') {
    styles = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
    dotColor = 'bg-rose-600 animate-pulse';
  } else if (normalized === 'HIGH') {
    styles = 'bg-red-50 text-red-700 border-red-200 font-semibold';
    dotColor = 'bg-red-500';
  } else if (normalized === 'MEDIUM') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'LOW') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    dotColor = 'bg-emerald-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{normalized || 'LOW'}</span>
      {score !== undefined && <span className="opacity-75">({score}%)</span>}
    </span>
  );
}
