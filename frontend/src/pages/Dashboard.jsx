import React from 'react';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard({ claims, providers, onSelectClaim, onOpenAiModal, setActiveTab }) {
  // Exposure trend data
  const exposureData = [
    { date: 'Aug 01', exposure: 120 },
    { date: 'Aug 03', exposure: 180 },
    { date: 'Aug 05', exposure: 140 },
    { date: 'Aug 07', exposure: 290 },
    { date: 'Aug 09', exposure: 310 },
    { date: 'Aug 11', exposure: 420 },
    { date: 'Aug 13', exposure: 480 },
  ];

  // Alerts by day
  const alertsData = [
    { day: 'Mon', critical: 3, high: 8, med: 12 },
    { day: 'Tue', critical: 5, high: 11, med: 9 },
    { day: 'Wed', critical: 2, high: 6, med: 14 },
    { day: 'Thu', critical: 8, high: 15, med: 18 },
    { day: 'Fri', critical: 4, high: 9, med: 11 },
    { day: 'Sat', critical: 1, high: 3, med: 5 },
    { day: 'Sun', critical: 2, high: 4, med: 6 },
  ];

  // Risk distribution
  const riskDistData = [
    { name: 'High Risk', value: 34, color: '#DC2626' },
    { name: 'Medium Risk', value: 48, color: '#F59E0B' },
    { name: 'Low Risk', value: 18, color: '#16A34A' },
  ];

  // Claims Type Donut
  const claimsTypeData = [
    { name: 'Inpatient Claims', value: 42, color: '#2563EB' },
    { name: 'Outpatient Claims', value: 58, color: '#06B6D4' },
  ];

  // Columns for Recent Claims table
  const columns = [
    { 
      header: 'Claim ID', 
      accessor: 'claim_id',
      cell: (r) => <span className="font-bold font-mono text-brand-blue">{r.claim_id}</span>
    },
    { 
      header: 'Provider', 
      accessor: 'provider_name',
      cell: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.provider_name}</p>
          <p className="text-[10px] text-slate-400 font-mono">{r.provider_id}</p>
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: 'amount',
      cell: (r) => <span className="font-bold text-slate-900">${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    },
    { 
      header: 'Fraud Risk', 
      accessor: 'risk_level',
      cell: (r) => <RiskBadge level={r.risk_level} score={r.fraud_percentage} />
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Action',
      cell: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectClaim(r);
          }}
          className="text-brand-blue hover:text-brand-darkBlue font-semibold text-xs flex items-center gap-1"
        >
          <span>Investigate</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice - Enhanced */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-800 to-navy-900 text-white rounded-2xl p-6 border-2 border-slate-700 shadow-xl relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 animate-gradient"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-brand-blue shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-3 mb-2">
                Model A Operational Monitoring
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-mono animate-pulse">
                  Gradient Boosting Active
                </span>
              </h3>
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                HistGradientBoostingClassifier scoring Medicare providers with 95.56% accuracy & 81.93% precision.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('model-performance')}
            className="bg-gradient-to-r from-cyan-500 to-brand-blue hover:from-cyan-600 hover:to-brand-darkBlue text-white font-bold text-sm px-5 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg shrink-0"
          >
            View Model Specs & Validation
          </button>
        </div>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Claims Analyzed"
          value="5,410"
          subtitle="Provider records dataset"
          icon={FileSpreadsheet}
          badgeText="100% Covered"
        />
        <KpiCard
          title="High-Risk Claims"
          value="506"
          subtitle="Potential fraud flagged"
          trend="+4.2% vs last month"
          trendType="negative"
          icon={AlertTriangle}
        />
        <KpiCard
          title="High-Risk Providers"
          value="42"
          subtitle="Surgical & rehab focus"
          trend="8.1% of network"
          trendType="neutral"
          icon={Building2}
        />
        <KpiCard
          title="Potential Fraud Rate"
          value="9.35%"
          subtitle="Exact Model Target dist."
          badgeText="Model Target"
          icon={TrendingUp}
        />
        <KpiCard
          title="Estimated Exposure"
          value="$4.85M"
          subtitle="High-risk claim volume"
          trend="$1.2M recoverable"
          trendType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Exposure Trend */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Estimated Financial Exposure Trend ($K)"
            subtitle="Cumulative high-risk reimbursement volume over time"
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={exposureData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="K" />
                <Tooltip
                  formatter={(val) => [`$${val}K`, 'Estimated Exposure']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="exposure" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorExposure)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Chart 2: Alerts by Day */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Investigation Alerts by Day"
            subtitle="Weekly breakdown of prioritized risk signals"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={alertsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF' }} />
                <Bar dataKey="critical" stackId="a" fill="#991B1B" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#DC2626" name="High Risk" />
                <Bar dataKey="med" stackId="a" fill="#F59E0B" name="Medium Risk" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Chart 3 & 4: Distributions */}
        <div className="lg:col-span-4">
          <ChartCard title="Risk Distribution" subtitle="Active cases categorized by ML risk bands">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Cases']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"/> High (34%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"/> Med (48%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"/> Low (18%)</span>
            </div>
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard title="Claims Distribution" subtitle="Inpatient vs Outpatient claim volume ratio">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={claimsTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4}>
                  {claimsTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"/> Inpatient (42%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"/> Outpatient (58%)</span>
            </div>
          </ChartCard>
        </div>

        {/* AI Assistant Quick Card - Enhanced */}
        <div className="lg:col-span-4 bg-gradient-to-br from-brand-blue via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 animate-gradient"></div>
          </div>
          
          <div className="z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-cyan-300">Ask HealthGuard AI</span>
            </div>
            <h4 className="text-xl font-extrabold mb-3">Need immediate case insights?</h4>
            <p className="text-sm text-slate-200 leading-relaxed mb-5">
              Query our Copilot for natural-language explanations of model attributions and provider behavior anomalies.
            </p>
          </div>
          <button
            onClick={onOpenAiModal}
            className="w-full bg-white hover:bg-slate-100 text-navy-900 font-bold text-sm py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 z-10"
          >
            Launch Copilot Drawer
          </button>
        </div>

      </div>

      {/* Recent Claims Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy-900">Recent High-Risk Signals</h3>
            <p className="text-xs text-slate-500">Claims requiring immediate investigator triage</p>
          </div>
          <button
            onClick={() => setActiveTab('claims')}
            className="text-brand-blue hover:text-brand-darkBlue text-xs font-bold flex items-center gap-1"
          >
            <span>View All Claims Console</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <DataTable
          columns={columns}
          data={claims}
          onRowClick={(claim) => onSelectClaim(claim)}
        />
      </div>
    </div>
  );
}
