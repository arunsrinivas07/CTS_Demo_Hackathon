import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import { Building2, AlertTriangle, Activity, TrendingUp, Search, ExternalLink } from 'lucide-react';

export default function ProviderIntelligence({ providers, onSelectProvider }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredProviders = providers.filter(p => {
    const matchesRisk = riskFilter === 'ALL' || p.risk_level === riskFilter;
    const matchesSearch = 
      p.provider_name.toLowerCase().includes(search.toLowerCase()) ||
      p.provider_id.toLowerCase().includes(search.toLowerCase()) ||
      p.npi.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const columns = [
    {
      header: 'Provider Name',
      accessor: 'provider_name',
      cell: (r) => (
        <div>
          <p className="font-bold text-slate-800">{r.provider_name}</p>
          <p className="text-[10px] text-slate-400 font-mono">NPI: {r.npi}</p>
        </div>
      )
    },
    {
      header: 'Provider ID',
      accessor: 'provider_id',
      cell: (r) => <span className="font-mono text-brand-blue font-bold">{r.provider_id}</span>
    },
    {
      header: 'Total Claims',
      accessor: 'total_claims',
      cell: (r) => <span className="font-semibold text-slate-700">{r.total_claims}</span>
    },
    {
      header: 'Avg Claim Amount',
      accessor: 'avg_claim_amount',
      cell: (r) => <span className="font-mono text-slate-800 font-bold">${r.avg_claim_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    },
    {
      header: 'Anomaly Rate',
      accessor: 'anomaly_rate',
      cell: (r) => (
        <span className={`font-mono font-bold text-xs ${r.anomaly_rate > 0.1 ? 'text-red-600' : 'text-slate-600'}`}>
          {(r.anomaly_rate * 100).toFixed(1)}%
        </span>
      )
    },
    {
      header: 'Risk Score',
      accessor: 'risk_level',
      cell: (r) => <RiskBadge level={r.risk_level} score={r.risk_score} />
    },
    {
      header: 'Actions',
      cell: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectProvider(r);
          }}
          className="bg-brand-blue hover:bg-brand-darkBlue text-white font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">Provider Intelligence</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Behavioral analysis and anomaly patterns across Medicare provider network
        </p>
      </div>

      {/* Top Network KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Network Providers"
          value="5,410"
          subtitle="Provider features v2 dataset"
          icon={Building2}
          badgeText="Evaluated"
        />
        <KpiCard
          title="High-Risk Providers"
          value="42"
          subtitle="Fraud score >= 70%"
          trend="8.1% Network Rate"
          trendType="negative"
          icon={AlertTriangle}
        />
        <KpiCard
          title="Avg Claims per Provider"
          value="48.2"
          subtitle="Inpatient & Outpatient total"
          icon={Activity}
        />
        <KpiCard
          title="Network Anomaly Rate"
          value="9.35%"
          subtitle="Potential fraud share"
          trend="Gradient Boosting"
          trendType="neutral"
          icon={TrendingUp}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Provider Name, ID, or NPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Risk Filter:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Directory Data Grid */}
      <DataTable
        columns={columns}
        data={filteredProviders}
        onRowClick={(prov) => onSelectProvider(prov)}
      />
    </div>
  );
}
