import React from 'react';

export default function AdminKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = 'bg-blue-50 text-blue-600',
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-[10px] uppercase tracking-wide font-bold text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {value ?? '—'}
          </p>

          {subtitle && (
            <p className="text-[10px] text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

      </div>

    </div>
  );
}