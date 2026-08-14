import React from 'react';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import GaugeCard from '../components/Gaugecard';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import ClaimsOverviewCard from '../components/ClaimsOverviewCard';
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar
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

  // Explainable AI (XAI) attribution breakdown
  const xaiBreakdown = [
    { label: 'Claim Amount vs. Baseline', change: 42, width: 80, color: '#DC2626' },
    { label: 'Provider Claim Volume', change: 18, width: 45, color: '#F59E0B' },
    { label: 'Historical Reliability', change: -12, width: 30, color: '#10B981' },
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

        {/* Gauge 1: Fraud Rate */}
        <div className="lg:col-span-4">
          <GaugeCard
            title="Fraud Rate"
            value={68}
            subtitle="On track for 80% target"
            colorFrom="#6EE7B7"
            colorTo="#059669"
            footer={
              <button
                type="button"
                className="w-full text-center text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-colors"
              >
                Show details
              </button>
            }
          />
        </div>

        {/* Gauge 2: Explainable AI (XAI) Breakdown */}
        <div className="lg:col-span-4">
          <GaugeCard
            title="Explainable AI (XAI) Breakdown"
            value={68}
            colorFrom="#FCA5A5"
            colorTo="#B91C1C"
            footer={
              <div className="space-y-3 mt-1">
                {xaiBreakdown.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">{row.label}</span>
                      <span
                        className="font-semibold"
                        style={{ color: row.change < 0 ? '#059669' : '#DC2626' }}
                      >
                        {row.change > 0 ? '+' : ''}{row.change}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.width}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        </div>

        {/* Claims Overview — replaces the old "Ask HealthGuard AI" card.
            Same grid slot (lg:col-span-4), fully functional: click any row
            to expand a dropdown with type-level detail. */}
        <div className="lg:col-span-4">
          <ClaimsOverviewCard onViewType={() => setActiveTab('claims')} />
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