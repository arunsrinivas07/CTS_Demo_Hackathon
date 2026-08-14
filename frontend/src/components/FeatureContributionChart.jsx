import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FeatureContributionChart({ data, isDemo = true }) {
  const chartData = data || [
    { feature: "Total Reimbursement", contribution: 31, display: "$14,250.00" },
    { feature: "Claims Per Beneficiary", contribution: 24, display: "6.8 claims/pt" },
    { feature: "IP Claim Count", contribution: 18, display: "28 claims" },
    { feature: "IP Total Reimbursement", contribution: 14, display: "$62,000.00" },
    { feature: "OP Claim Count", contribution: 9, display: "42 claims" },
    { feature: "Reimbursement Per Beneficiary", contribution: 4, display: "$2,100.00" }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-800">Model Feature Contribution</h4>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          {isDemo ? "Illustrative Feature Contribution" : "SHAP Feature Attributions"}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <XAxis type="number" unit="%" domain={[0, 40]} tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              width={130}
            />
            <Tooltip
              formatter={(value, name, item) => [`${value}% Contribution (${item.payload.display})`, 'Influence']}
              contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
              itemStyle={{ color: '#38BDF8' }}
            />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#2563EB' : index === 1 ? '#06B6D4' : '#3B82F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-400 mt-2 italic text-center">
        Higher percentage indicates stronger positive attribution towards classification as Potential Fraud.
      </p>
    </div>
  );
}
