import React from 'react';
import RiskBadge from '../components/RiskBadge';
import RiskGauge from '../components/RiskGauge';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { 
  Building2, ArrowLeft, ShieldAlert, Activity, DollarSign, 
  FileSpreadsheet, Sparkles, ExternalLink 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

export default function ProviderDetails({ provider, onBack, onSelectClaim }) {
  const p = provider || {
    provider_id: "PRV51003",
    provider_name: "Metro General Health System",
    npi: "1942083921",
    total_claims: 248,
    avg_claim_amount: 5745.96,
    total_reimbursement: 1425000.00,
    anomaly_rate: 0.185,
    risk_score: 91,
    risk_level: "HIGH",
    fraud_probability: 0.91
  };

  const monthlyTrend = [
    { month: 'Jan', reimb: 95, claims: 18 },
    { month: 'Feb', reimb: 110, claims: 21 },
    { month: 'Mar', reimb: 105, claims: 20 },
    { month: 'Apr', reimb: 130, claims: 25 },
    { month: 'May', reimb: 160, claims: 30 },
    { month: 'Jun', reimb: 210, claims: 38 },
    { month: 'Jul', reimb: 290, claims: 45 },
    { month: 'Aug', reimb: 325, claims: 49 },
  ];

  const ipOpDistribution = [
    { name: 'Inpatient (IP)', value: 45, color: '#2563EB' },
    { name: 'Outpatient (OP)', value: 55, color: '#06B6D4' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="text-xs font-bold text-brand-blue hover:text-brand-darkBlue flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Provider Intelligence Directory</span>
      </button>

      {/* Provider Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-navy-900 text-white shrink-0 shadow">
            <Building2 className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">{p.provider_name}</h2>
              <RiskBadge level={p.risk_level} score={p.risk_score} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Provider ID: <strong className="text-brand-blue">{p.provider_id}</strong> • NPI: <strong className="text-slate-800">{p.npi}</strong>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
              <span>Total Reimbursement: <strong className="text-slate-900 font-mono">${(p.total_reimbursement || 0).toLocaleString()}</strong></span>
              <span>Total Claims: <strong className="text-slate-900">{p.total_claims}</strong></span>
              <span>Avg Claim: <strong className="text-slate-900 font-mono">${(p.avg_claim_amount || 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model A Evaluation</span>
            <span className="text-sm font-extrabold text-red-600 font-mono">{p.fraud_probability * 100}% Fraud Risk</span>
            <span className="text-[10px] text-slate-500 block font-mono">Gradient Boosting (0.50)</span>
          </div>
          <RiskGauge percentage={Math.round((p.fraud_probability || 0.91) * 100)} riskLevel={p.risk_level} size={100} />
        </div>
      </div>

      {/* Behavioral Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartCard title="Reimbursement & Claim Volume Trend ($K)" subtitle="Monthly billing trajectory showing escalation spikes">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="K" />
                <Tooltip formatter={(val) => [`$${val}K`, 'Reimbursement']} contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF' }} />
                <Line type="monotone" dataKey="reimb" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard title="Inpatient vs Outpatient Ratio" subtitle="Claim distribution across care settings">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={ipOpDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4}>
                  {ipOpDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"/> Inpatient (45%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"/> Outpatient (55%)</span>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Behavioral Anomaly Risk Drivers */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow space-y-4">
        <h3 className="text-sm font-bold text-navy-900">Flagged Behavioral Anomaly Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'High Reimbursement Outlier', desc: 'Average claim amount ($5,745.96) is 3.2x higher than regional specialty peers.' },
            { title: 'Beneficiary Claim Density', desc: 'Averaging 6.8 claims per unique beneficiary within a 90-day window.' },
            { title: 'Inpatient Claim Share Variance', desc: 'Inpatient billing represents 45% of total revenue vs 18% peer benchmark.' },
            { title: 'Procedure Code Duplication', desc: 'Repeated high-tier evaluation & management CPT codes billed to identical beneficiaries.' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600 font-bold text-xs">
                !
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
