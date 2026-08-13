import React from 'react';

export default function KpiCard({ title, value, subtitle, trend, trendType = 'neutral', icon: Icon, badgeText }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-shadow card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-50 text-brand-blue border border-slate-100">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-extrabold text-navy-900 tracking-tight">{value}</span>
        {badgeText && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-lightBlue text-brand-blue border border-blue-100">
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={`font-semibold ${
              trendType === 'positive' ? 'text-emerald-600' :
              trendType === 'negative' ? 'text-red-600' : 'text-slate-600'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
