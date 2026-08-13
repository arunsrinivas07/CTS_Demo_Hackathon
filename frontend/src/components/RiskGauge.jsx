import React from 'react';

export default function RiskGauge({ percentage = 89, riskLevel = 'HIGH', size = 160 }) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#DC2626'; // High
  let textColor = 'text-red-600';
  let bgFill = 'bg-red-50/50';

  if (riskLevel === 'LOW') {
    strokeColor = '#16A34A';
    textColor = 'text-emerald-600';
    bgFill = 'bg-emerald-50/50';
  } else if (riskLevel === 'MEDIUM') {
    strokeColor = '#F59E0B';
    textColor = 'text-amber-600';
    bgFill = 'bg-amber-50/50';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative flex items-center justify-center rounded-full p-2 ${bgFill}`}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold ${textColor} tracking-tight`}>
            {percentage}%
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Fraud Risk
          </span>
        </div>
      </div>
    </div>
  );
}
