import React from 'react';

export default function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="w-full flex-1 min-h-[220px]">
        {children}
      </div>
    </div>
  );
}
