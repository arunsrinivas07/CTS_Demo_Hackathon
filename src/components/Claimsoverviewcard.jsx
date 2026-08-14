import React, { useState } from 'react';
import { Building2, Stethoscope, Briefcase, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * ClaimsOverviewCard
 * A compact, click-to-expand breakdown of claims by type.
 * Drop-in replacement for the "Ask HealthGuard AI" panel — same grid slot
 * (lg:col-span-4), same visual weight, but shows real portfolio data and
 * lets the investigator drill in without leaving the dashboard.
 */

const CLAIM_TYPES = [
  {
    key: 'carrier',
    label: 'Carrier Claims',
    value: 5432,
    icon: Building2,
    accent: '#2563EB',
    accentBg: '#EFF6FF',
    change: '+3.1%',
    changeType: 'positive',
    description: 'Professional claims filed directly by carriers and physicians for standard services.',
    stats: [
      { label: 'Avg. claim amount', value: '$1,240' },
      { label: 'Flagged high-risk', value: '62 claims' },
    ],
  },
  {
    key: 'inpatient',
    label: 'Inpatient Claims',
    value: 2184,
    icon: Stethoscope,
    accent: '#059669',
    accentBg: '#ECFDF5',
    change: '+1.8%',
    changeType: 'positive',
    description: 'Claims tied to hospital admissions and overnight stays.',
    stats: [
      { label: 'Avg. claim amount', value: '$8,950' },
      { label: 'Flagged high-risk', value: '121 claims' },
    ],
  },
  {
    key: 'outpatient',
    label: 'Outpatient Claims',
    value: 4866,
    icon: Briefcase,
    accent: '#7C3AED',
    accentBg: '#F5F3FF',
    change: '-0.6%',
    changeType: 'negative',
    description: 'Same-day procedures, diagnostics, and outpatient visits.',
    stats: [
      { label: 'Avg. claim amount', value: '$2,310' },
      { label: 'Flagged high-risk', value: '89 claims' },
    ],
  },
];

export default function ClaimsOverviewCard({ onViewType }) {
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const total = CLAIM_TYPES.reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-900">Claims Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Breakdown by claim type</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
          {total.toLocaleString()} total
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {CLAIM_TYPES.map((type) => {
          const Icon = type.icon;
          const isOpen = openKey === type.key;
          const TrendIcon = type.changeType === 'positive' ? ArrowUpRight : ArrowDownRight;

          return (
            <div
              key={type.key}
              className={`rounded-xl border transition-colors ${
                isOpen ? 'border-slate-200 bg-slate-50/60' : 'border-transparent'
              }`}
            >
              {/* Row header — click target */}
              <button
                type="button"
                onClick={() => toggle(type.key)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: type.accentBg }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: type.accent, width: 18, height: 18 }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 leading-tight">{type.label}</p>
                  <p className="text-lg font-extrabold text-slate-900 leading-tight tabular-nums">
                    {type.value.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="flex items-center gap-0.5 text-[11px] font-semibold"
                    style={{ color: type.changeType === 'positive' ? '#059669' : '#DC2626' }}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {type.change}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown detail — animated with CSS grid rows, no layout jump */}
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="px-2.5 pb-3 pt-0.5">
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                      {type.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                      {type.stats.map((s) => (
                        <div key={s.label} className="bg-white border border-slate-100 rounded-lg px-2.5 py-2">
                          <p className="text-[10px] text-slate-400">{s.label}</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewType?.(type.key);
                      }}
                      className="text-[11px] font-semibold flex items-center gap-1 hover:underline"
                      style={{ color: type.accent }}
                    >
                      View {type.label.toLowerCase()}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}