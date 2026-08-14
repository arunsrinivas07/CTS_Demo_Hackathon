import React from 'react';

const levels = [
  {
    key: 'LOW',
    label: 'Low',
    className: 'bg-emerald-500',
  },
  {
    key: 'MEDIUM',
    label: 'Medium',
    className: 'bg-amber-500',
  },
  {
    key: 'HIGH',
    label: 'High',
    className: 'bg-orange-500',
  },
  {
    key: 'CRITICAL',
    label: 'Critical',
    className: 'bg-red-600',
  },
];

export default function RiskDistribution({
  title,
  data,
  loading = false,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

      <div className="mb-5">

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

        <p className="text-[10px] text-slate-400 mt-1">
          Distribution by risk level
        </p>

      </div>

      {loading ? (

        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-20 mb-2" />
              <div className="h-2 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>

      ) : !data ? (

        <div className="py-8 text-center">

          <p className="text-xs font-semibold text-slate-500">
            No data available
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            Risk distribution has not been provided by the backend.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {levels.map((level) => {

            const value = data[level.key] ?? 0;

            return (
              <div key={level.key}>

                <div className="flex justify-between items-center mb-1.5">

                  <span className="text-xs font-semibold text-slate-600">
                    {level.label}
                  </span>

                  <span className="text-xs font-bold text-slate-800">
                    {value}
                  </span>

                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full ${level.className}`}
                    style={{
                      width: `${Math.min(Number(value), 100)}%`,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}