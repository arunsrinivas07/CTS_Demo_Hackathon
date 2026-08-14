import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
} from 'lucide-react';

export default function HealthStatusCard({
  name,
  description,
  status,
}) {
  const normalized = String(status || '').toLowerCase();

  const config = {
    healthy: {
      label: 'Healthy',
      icon: CheckCircle2,
      classes: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },

    warning: {
      label: 'Warning',
      icon: AlertTriangle,
      classes: 'text-amber-600 bg-amber-50 border-amber-200',
    },

    unavailable: {
      label: 'Unavailable',
      icon: XCircle,
      classes: 'text-red-600 bg-red-50 border-red-200',
    },
  };

  const current = config[normalized] || {
    label: 'Unavailable',
    icon: Activity,
    classes: 'text-slate-500 bg-slate-50 border-slate-200',
  };

  const Icon = current.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-sm font-bold text-slate-900">
            {name}
          </h3>

          {description && (
            <p className="text-[10px] text-slate-400 mt-1">
              {description}
            </p>
          )}

        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[9px] font-bold ${current.classes}`}
        >
          <Icon className="w-3 h-3" />
          {current.label}
        </div>

      </div>

    </div>
  );
}