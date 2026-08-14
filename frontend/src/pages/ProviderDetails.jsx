import React, { useMemo } from 'react';
import RiskBadge from '../components/RiskBadge';
import RiskGauge from '../components/RiskGauge';
import ChartCard from '../components/ChartCard';

import {
  ArrowLeft,
  Building2,
  ShieldAlert,
  Activity,
  DollarSign,
  FileText,
  Users,
  Code2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  BrainCircuit,
  History,
  Target,
  TrendingUp,
  TrendingDown,
  CircleAlert,
  ChevronRight,
  ClipboardCheck,
  Sparkles,
  Scale,
  Stethoscope,
  FileSearch,
  BadgeAlert
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';


export default function ProviderDetails({
  provider,
  onBack,
  onSelectClaim
}) {

  /*
   * ------------------------------------------------------------------
   * PROVIDER DATA
   * ------------------------------------------------------------------
   *
   * These are fallback values for the UI prototype.
   *
   * Later these values can come directly from FastAPI.
   */

  const p = provider || {
    provider_id: 'PRV51003',
    provider_name: 'Metro General Health System',
    npi: '1942083921',
    provider_type: 'General Hospital',
    specialty: 'General Medicine',
    region: 'Northeast',

    total_claims: 248,
    flagged_claims: 37,
    high_risk_claims: 18,

    avg_claim_amount: 5745.96,
    total_reimbursement: 1425000,

    anomaly_rate: 0.185,
    risk_score: 91,
    risk_level: 'HIGH',

    fraud_probability: 0.91,

    unique_beneficiaries: 142,
    high_frequency_beneficiaries: 17,

    inpatient_share: 45,
    outpatient_share: 55,

    peer_avg_claim: 1790,
    peer_inpatient_share: 27,
    peer_claims_per_beneficiary: 2.4,

    claims_per_beneficiary: 6.8,

    recent_claim_growth: 34,
    reimbursement_growth: 28
  };


  /*
   * ------------------------------------------------------------------
   * BEHAVIORAL TREND
   * ------------------------------------------------------------------
   */

  const monthlyTrend = [
    {
      month: 'Jan',
      reimbursement: 95,
      claims: 18,
      risk: 34
    },
    {
      month: 'Feb',
      reimbursement: 110,
      claims: 21,
      risk: 37
    },
    {
      month: 'Mar',
      reimbursement: 105,
      claims: 20,
      risk: 36
    },
    {
      month: 'Apr',
      reimbursement: 130,
      claims: 25,
      risk: 43
    },
    {
      month: 'May',
      reimbursement: 160,
      claims: 30,
      risk: 51
    },
    {
      month: 'Jun',
      reimbursement: 210,
      claims: 38,
      risk: 66
    },
    {
      month: 'Jul',
      reimbursement: 290,
      claims: 45,
      risk: 81
    },
    {
      month: 'Aug',
      reimbursement: 325,
      claims: 49,
      risk: 91
    }
  ];


  /*
   * ------------------------------------------------------------------
   * PEER BENCHMARK
   * ------------------------------------------------------------------
   */

  const peerBenchmark = [
    {
      metric: 'Average Claim',
      provider: 5746,
      peer: 1790
    },
    {
      metric: 'Claims / Beneficiary',
      provider: 6.8,
      peer: 2.4
    },
    {
      metric: 'Inpatient Share',
      provider: 45,
      peer: 27
    },
    {
      metric: 'Avg Reimbursement / Beneficiary',
      provider: 2100,
      peer: 940
    }
  ];


  /*
   * ------------------------------------------------------------------
   * CARE SETTING
   * ------------------------------------------------------------------
   */

  const ipOpDistribution = [
    {
      name: 'Inpatient',
      value: p.inpatient_share || 45,
      color: '#2563EB'
    },
    {
      name: 'Outpatient',
      value: p.outpatient_share || 55,
      color: '#06B6D4'
    }
  ];


  /*
   * ------------------------------------------------------------------
   * RISK DRIVERS
   * ------------------------------------------------------------------
   */

  const riskDrivers = [
    {
      rank: 1,
      title: 'High reimbursement intensity',
      shortTitle: 'Reimbursement outlier',
      value: '$5,745.96',
      impact: '+28%',
      description:
        'Average claim amount is substantially above the peer benchmark.',
      severity: 'HIGH',
      icon: DollarSign
    },
    {
      rank: 2,
      title: 'High beneficiary claim density',
      shortTitle: 'Beneficiary frequency',
      value: '6.8 claims / beneficiary',
      impact: '+22%',
      description:
        'Claim frequency per beneficiary is materially higher than the peer baseline.',
      severity: 'HIGH',
      icon: Users
    },
    {
      rank: 3,
      title: 'Inpatient concentration',
      shortTitle: 'Inpatient share',
      value: '45%',
      impact: '+16%',
      description:
        'The provider has a higher inpatient concentration than comparable providers.',
      severity: 'MEDIUM',
      icon: Stethoscope
    },
    {
      rank: 4,
      title: 'Procedure-code variance',
      shortTitle: 'Coding pattern',
      value: 'Elevated',
      impact: '+12%',
      description:
        'Repeated high-value procedure combinations require additional review.',
      severity: 'MEDIUM',
      icon: Code2
    }
  ];


  /*
   * ------------------------------------------------------------------
   * PRIORITY CLAIMS
   * ------------------------------------------------------------------
   */

  const priorityClaims = [
    {
      claim_id: 'CLM-904812',
      beneficiary: 'BEN-10482',
      amount: 14250,
      risk: 91,
      level: 'HIGH',
      driver: 'High reimbursement',
      status: 'Escalated'
    },
    {
      claim_id: 'CLM-904813',
      beneficiary: 'BEN-10921',
      amount: 8900,
      risk: 78,
      level: 'HIGH',
      driver: 'Beneficiary frequency',
      status: 'Under Review'
    },
    {
      claim_id: 'CLM-904814',
      beneficiary: 'BEN-11342',
      amount: 3450,
      risk: 58,
      level: 'MEDIUM',
      driver: 'Inpatient concentration',
      status: 'Open'
    },
    {
      claim_id: 'CLM-904815',
      beneficiary: 'BEN-11783',
      amount: 2100,
      risk: 52,
      level: 'MEDIUM',
      driver: 'Coding pattern',
      status: 'Open'
    }
  ];


  /*
   * ------------------------------------------------------------------
   * BENEFICIARY PATTERNS
   * ------------------------------------------------------------------
   */

  const beneficiaries = [
    {
      id: 'BEN-10482',
      claims: 8,
      reimbursement: 32400,
      risk: 'HIGH'
    },
    {
      id: 'BEN-10921',
      claims: 7,
      reimbursement: 28750,
      risk: 'HIGH'
    },
    {
      id: 'BEN-11342',
      claims: 6,
      reimbursement: 24800,
      risk: 'HIGH'
    },
    {
      id: 'BEN-11783',
      claims: 6,
      reimbursement: 21900,
      risk: 'MEDIUM'
    }
  ];


  /*
   * ------------------------------------------------------------------
   * PROCEDURE / CODING
   * ------------------------------------------------------------------
   */

  const procedures = [
    {
      code: 'CPT-99214',
      description: 'Established patient evaluation',
      claims: 42,
      peer: 18,
      variance: '+133%'
    },
    {
      code: 'CPT-99213',
      description: 'Established patient evaluation',
      claims: 37,
      peer: 21,
      variance: '+76%'
    },
    {
      code: 'CPT-XXXX',
      description: 'High-complexity procedure',
      claims: 19,
      peer: 7,
      variance: '+171%'
    }
  ];


  /*
   * ------------------------------------------------------------------
   * HISTORICAL INVESTIGATIONS
   * ------------------------------------------------------------------
   *
   * Later this section can be populated by historical-case RAG.
   */

  const historicalCases = [
    {
      id: 'INV-2025-0142',
      date: '14 Nov 2025',
      outcome: 'Confirmed Fraud',
      similarity: 91,
      summary:
        'Similar reimbursement intensity, beneficiary density and inpatient concentration.'
    },
    {
      id: 'INV-2024-0871',
      date: '08 Aug 2024',
      outcome: 'No Fraud Confirmed',
      similarity: 76,
      summary:
        'Similar billing volume, but supporting documentation was sufficient.'
    }
  ];


  /*
   * ------------------------------------------------------------------
   * DERIVED METRICS
   * ------------------------------------------------------------------
   */

  const highRiskPercentage = useMemo(() => {
    if (!p.total_claims) return 0;

    return (
      ((p.high_risk_claims || 0) / p.total_claims) *
      100
    ).toFixed(1);
  }, [p]);


  const reimbursementVariance = useMemo(() => {
    if (!p.peer_avg_claim) return 0;

    return (
      ((p.avg_claim_amount - p.peer_avg_claim) /
        p.peer_avg_claim) *
      100
    ).toFixed(0);
  }, [p]);


  /*
   * ------------------------------------------------------------------
   * SMALL REUSABLE UI HELPERS
   * ------------------------------------------------------------------
   */

  const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
    badge
  }) => (
    <div className="flex items-start justify-between gap-4 mb-5">

      <div className="flex items-start gap-3">

        <div className="p-2 rounded-lg bg-blue-50 text-brand-blue">
          <Icon className="w-4 h-4" />
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-navy-900">
            {title}
          </h3>

          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

      </div>

      {badge && (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {badge}
        </span>
      )}

    </div>
  );


  const Metric = ({
    label,
    value,
    sub,
    icon: Icon,
    danger
  }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-4">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        {Icon && (
          <Icon
            className={`w-4 h-4 ${
              danger
                ? 'text-red-500'
                : 'text-slate-400'
            }`}
          />
        )}

      </div>

      <p
        className={`text-xl font-extrabold mt-2 ${
          danger
            ? 'text-red-600'
            : 'text-slate-900'
        }`}
      >
        {value}
      </p>

      {sub && (
        <p className="text-[10px] text-slate-500 mt-1">
          {sub}
        </p>
      )}

    </div>
  );


  return (
    <div className="space-y-6 pb-16">

      {/* ============================================================
          BACK NAVIGATION
      ============================================================ */}

      <button
        onClick={onBack}
        className="text-xs font-bold text-brand-blue hover:text-brand-darkBlue flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Provider Intelligence Directory
      </button>


      {/* ============================================================
          PROVIDER HERO
      ============================================================ */}

      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">

        <div className="p-6">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            {/* Provider Identity */}

            <div className="flex items-start gap-4">

              <div className="w-14 h-14 rounded-2xl bg-navy-900 flex items-center justify-center shadow-lg shrink-0">
                <Building2 className="w-7 h-7 text-cyan-400" />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-xl md:text-2xl font-extrabold text-navy-900 tracking-tight">
                    {p.provider_name}
                  </h1>

                  <RiskBadge
                    level={p.risk_level}
                    score={p.risk_score}
                  />

                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] font-mono text-slate-500">

                  <span>
                    Provider ID:
                    <strong className="text-brand-blue ml-1">
                      {p.provider_id}
                    </strong>
                  </span>

                  <span>
                    NPI:
                    <strong className="text-slate-700 ml-1">
                      {p.npi}
                    </strong>
                  </span>

                  <span>
                    Specialty:
                    <strong className="text-slate-700 ml-1">
                      {p.specialty || 'General Medicine'}
                    </strong>
                  </span>

                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">

                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                    {p.provider_type || 'Healthcare Provider'}
                  </span>

                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                    {p.region || 'Regional Network'}
                  </span>

                  <span className="px-2.5 py-1 rounded-md bg-red-50 text-[10px] font-bold text-red-600">
                    Investigation Priority: HIGH
                  </span>

                </div>

              </div>

            </div>


            {/* Risk Score */}

            <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[270px]">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Provider Risk Assessment
                </p>

                <p className="text-2xl font-extrabold text-red-600 mt-1">
                  {p.risk_score}%
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  {p.risk_level === 'HIGH'
                    ? 'High-risk provider'
                    : 'Requires review'}
                </p>

                <p className="text-[10px] font-mono text-slate-400 mt-2">
                  Model output • threshold 0.50
                </p>

              </div>

              <RiskGauge
                percentage={Math.round(
                  p.risk_score || 0
                )}
                riskLevel={p.risk_level}
                size={96}
              />

            </div>

          </div>

        </div>


        {/* Hero Metrics */}

        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-100">

          <Metric
            label="Total Claims"
            value={p.total_claims}
            sub={`${p.flagged_claims || 37} flagged`}
            icon={FileText}
          />

          <Metric
            label="Total Reimbursement"
            value={`$${(
              p.total_reimbursement || 0
            ).toLocaleString()}`}
            sub="Claims analyzed"
            icon={DollarSign}
          />

          <Metric
            label="Average Claim"
            value={`$${(
              p.avg_claim_amount || 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}`}
            sub={`+${reimbursementVariance}% vs peers`}
            icon={TrendingUp}
            danger
          />

          <Metric
            label="High-Risk Claims"
            value={p.high_risk_claims || 18}
            sub={`${highRiskPercentage}% of total claims`}
            icon={ShieldAlert}
            danger
          />

        </div>

      </div>


      {/* ============================================================
          WHY FLAGGED
      ============================================================ */}

      <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

        <SectionHeader
          icon={ShieldAlert}
          title="Why This Provider Is Flagged"
          subtitle="Primary behavioral signals contributing to the provider risk assessment."
          badge="HIGH PRIORITY"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {riskDrivers.map((driver) => {

            const Icon = driver.icon;

            return (
              <div
                key={driver.rank}
                className="relative border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-2">

                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span className="text-[10px] font-extrabold text-slate-400">
                      #{driver.rank}
                    </span>

                  </div>

                  <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-md">
                    {driver.impact}
                  </span>

                </div>

                <h4 className="text-xs font-extrabold text-slate-800 mt-3">
                  {driver.title}
                </h4>

                <p className="text-lg font-extrabold text-slate-900 mt-2">
                  {driver.value}
                </p>

                <p className="text-[10px] leading-relaxed text-slate-500 mt-2">
                  {driver.description}
                </p>

              </div>
            );
          })}

        </div>

      </section>


      {/* ============================================================
          TREND + CARE SETTING
      ============================================================ */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <div className="xl:col-span-8">

          <ChartCard
            title="Provider Behavioral Trend"
            subtitle="Monthly reimbursement growth and claim activity"
          >

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <LineChart
                data={monthlyTrend}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 0
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 10,
                    fill: '#64748B'
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  yAxisId="left"
                  tick={{
                    fontSize: 10,
                    fill: '#64748B'
                  }}
                  axisLine={false}
                  tickLine={false}
                  unit="K"
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{
                    fontSize: 10,
                    fill: '#64748B'
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="reimbursement"
                  name="Reimbursement"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#2563EB'
                  }}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="risk"
                  name="Risk Score"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{
                    r: 3,
                    fill: '#EF4444'
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

            <div className="flex flex-wrap gap-5 mt-2 text-[10px] font-semibold text-slate-500">

              <span className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-blue-600" />
                Reimbursement ($K)
              </span>

              <span className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-red-500 border-dashed" />
                Risk trend
              </span>

            </div>

          </ChartCard>

        </div>


        <div className="xl:col-span-4">

          <ChartCard
            title="Care Setting Distribution"
            subtitle="Inpatient vs outpatient claim share"
          >

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <PieChart>

                <Pie
                  data={ipOpDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                >

                  {ipOpDistribution.map(
                    (entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.color}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    'Share'
                  ]}
                />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '10px'
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">

              <div className="flex items-center justify-between">

                <span className="text-[10px] text-slate-500">
                  Peer inpatient share
                </span>

                <strong className="text-xs text-red-600">
                  {p.peer_inpatient_share || 27}%
                </strong>

              </div>

              <div className="flex items-center gap-2 mt-2">

                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${p.inpatient_share || 45}%`
                    }}
                  />

                </div>

                <span className="text-[10px] font-bold text-slate-700">
                  {p.inpatient_share || 45}%
                </span>

              </div>

            </div>

          </ChartCard>

        </div>

      </div>


      {/* ============================================================
          PEER BENCHMARK
      ============================================================ */}

      <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

        <SectionHeader
          icon={Scale}
          title="Peer Benchmark Analysis"
          subtitle="Provider behavior compared with comparable network providers."
          badge="CONTEXT"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div>

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <BarChart
                data={peerBenchmark}
                layout="vertical"
                margin={{
                  left: 20,
                  right: 20,
                  top: 5,
                  bottom: 5
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  type="number"
                  tick={{
                    fontSize: 9,
                    fill: '#64748B'
                  }}
                />

                <YAxis
                  dataKey="metric"
                  type="category"
                  width={125}
                  tick={{
                    fontSize: 9,
                    fill: '#475569'
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '10px'
                  }}
                />

                <Bar
                  dataKey="provider"
                  name="Provider"
                  fill="#2563EB"
                  radius={[0, 5, 5, 0]}
                />

                <Bar
                  dataKey="peer"
                  name="Peer Average"
                  fill="#CBD5E1"
                  radius={[0, 5, 5, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          <div className="space-y-3">

            {[
              {
                label: 'Average Claim Amount',
                provider: '$5,746',
                peer: '$1,790',
                variance: '+221%',
                bad: true
              },
              {
                label: 'Claims / Beneficiary',
                provider: '6.8',
                peer: '2.4',
                variance: '+183%',
                bad: true
              },
              {
                label: 'Inpatient Share',
                provider: '45%',
                peer: '27%',
                variance: '+67%',
                bad: true
              },
              {
                label: 'Avg Reimbursement / Beneficiary',
                provider: '$2,100',
                peer: '$940',
                variance: '+123%',
                bad: true
              }
            ].map((item) => (

              <div
                key={item.label}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200"
              >

                <div>

                  <p className="text-[11px] font-bold text-slate-700">
                    {item.label}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Provider {item.provider} • Peer {item.peer}
                  </p>

                </div>

                <span className="shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-md bg-red-50 text-red-600">
                  {item.variance}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ============================================================
          BEHAVIORAL ANOMALIES
      ============================================================ */}

      <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

        <SectionHeader
          icon={Activity}
          title="Behavioral Anomaly Analysis"
          subtitle="Patterns requiring investigator attention."
          badge="4 SIGNALS"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="p-4 rounded-xl border border-red-100 bg-red-50/40">

            <div className="flex gap-3">

              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-slate-800">
                  Reimbursement Outlier
                </h4>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Average claim amount is approximately
                  3.2× the observed peer benchmark.
                </p>

                <span className="inline-block mt-2 text-[10px] font-bold text-red-600">
                  HIGH PRIORITY
                </span>

              </div>

            </div>

          </div>


          <div className="p-4 rounded-xl border border-red-100 bg-red-50/40">

            <div className="flex gap-3">

              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-slate-800">
                  Beneficiary Claim Density
                </h4>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Average claim frequency is
                  {p.claims_per_beneficiary || 6.8}
                  claims per beneficiary versus a
                  peer baseline of
                  {p.peer_claims_per_beneficiary || 2.4}.
                </p>

                <span className="inline-block mt-2 text-[10px] font-bold text-red-600">
                  HIGH PRIORITY
                </span>

              </div>

            </div>

          </div>


          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">

            <div className="flex gap-3">

              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-slate-800">
                  Inpatient Concentration
                </h4>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Inpatient activity represents
                  {p.inpatient_share || 45}%
                  compared with a peer benchmark of
                  {p.peer_inpatient_share || 27}%.
                </p>

                <span className="inline-block mt-2 text-[10px] font-bold text-amber-600">
                  REVIEW
                </span>

              </div>

            </div>

          </div>


          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">

            <div className="flex gap-3">

              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-slate-800">
                  Procedure-Code Duplication
                </h4>

                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Repeated high-value procedure combinations
                  appear across multiple beneficiary records.
                </p>

                <span className="inline-block mt-2 text-[10px] font-bold text-amber-600">
                  REVIEW
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ============================================================
          BENEFICIARY + PROCEDURE ANALYSIS
      ============================================================ */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Beneficiaries */}

        <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

          <SectionHeader
            icon={Users}
            title="High-Frequency Beneficiary Patterns"
            subtitle={`${p.high_frequency_beneficiaries || 17} beneficiaries require closer review.`}
            badge="BENEFICIARY ANALYSIS"
          />

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-slate-100">

                  <th className="text-[10px] font-bold text-slate-400 uppercase py-2">
                    Beneficiary
                  </th>

                  <th className="text-[10px] font-bold text-slate-400 uppercase py-2">
                    Claims
                  </th>

                  <th className="text-[10px] font-bold text-slate-400 uppercase py-2">
                    Reimbursement
                  </th>

                  <th className="text-[10px] font-bold text-slate-400 uppercase py-2">
                    Risk
                  </th>

                </tr>

              </thead>

              <tbody>

                {beneficiaries.map((b) => (

                  <tr
                    key={b.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >

                    <td className="py-3">

                      <span className="font-mono text-[10px] font-bold text-brand-blue">
                        {b.id}
                      </span>

                    </td>

                    <td className="py-3 text-xs font-bold text-slate-700">
                      {b.claims}
                    </td>

                    <td className="py-3 text-xs font-mono font-bold text-slate-700">
                      ${b.reimbursement.toLocaleString()}
                    </td>

                    <td className="py-3">

                      <RiskBadge
                        level={b.risk}
                        score={b.risk === 'HIGH' ? 80 : 55}
                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* Procedures */}

        <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

          <SectionHeader
            icon={Code2}
            title="Procedure & Coding Analysis"
            subtitle="Procedure patterns with elevated frequency compared with peers."
            badge="CODING REVIEW"
          />

          <div className="space-y-3">

            {procedures.map((procedure) => (

              <div
                key={procedure.code}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="font-mono text-xs font-extrabold text-brand-blue">
                        {procedure.code}
                      </span>

                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-bold">
                        {procedure.variance}
                      </span>

                    </div>

                    <p className="text-[10px] text-slate-500 mt-1">
                      {procedure.description}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-extrabold text-slate-800">
                      {procedure.claims}
                    </p>

                    <p className="text-[9px] text-slate-400">
                      peer {procedure.peer}
                    </p>

                  </div>

                </div>

                <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (procedure.claims /
                          Math.max(
                            procedure.claims,
                            procedure.peer * 3
                          )) *
                          100
                      )}%`
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>


      {/* ============================================================
          PRIORITY CLAIMS
      ============================================================ */}

      <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

        <SectionHeader
          icon={Target}
          title="Priority Claims for Investigation"
          subtitle="Claims ranked by risk and the strength of their primary anomaly signals."
          badge="START HERE"
        />

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px]">

            <thead>

              <tr className="border-b border-slate-100">

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Priority
                </th>

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Claim
                </th>

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Beneficiary
                </th>

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Amount
                </th>

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Risk
                </th>

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Primary Driver
                </th>

                <th className="text-left text-[10px] font-bold text-slate-400 uppercase py-3">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {priorityClaims.map((claim, index) => (

                <tr
                  key={claim.claim_id}
                  className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors"
                >

                  <td className="py-3">

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        index === 0
                          ? 'bg-red-100 text-red-600'
                          : index === 1
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </div>

                  </td>

                  <td className="py-3">

                    <span className="font-mono text-xs font-bold text-brand-blue">
                      {claim.claim_id}
                    </span>

                  </td>

                  <td className="py-3">

                    <span className="font-mono text-[10px] text-slate-600">
                      {claim.beneficiary}
                    </span>

                  </td>

                  <td className="py-3">

                    <span className="font-mono text-xs font-bold text-slate-800">
                      ${claim.amount.toLocaleString()}
                    </span>

                  </td>

                  <td className="py-3">

                    <RiskBadge
                      level={claim.level}
                      score={claim.risk}
                    />

                  </td>

                  <td className="py-3">

                    <span className="text-[10px] font-semibold text-slate-600">
                      {claim.driver}
                    </span>

                  </td>

                  <td className="py-3">

                    <button
                      onClick={() =>
                        onSelectClaim?.(claim)
                      }
                      className="text-[10px] font-bold text-brand-blue hover:text-brand-darkBlue flex items-center gap-1"
                    >
                      Investigate
                      <ChevronRight className="w-3 h-3" />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>


      {/* ============================================================
          HISTORICAL INVESTIGATION / RAG
      ============================================================ */}

      <section className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">

        <SectionHeader
          icon={History}
          title="Historical Investigation Context"
          subtitle="Previous investigations and similar cases that may provide investigative context."
          badge="RAG CONTEXT"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {historicalCases.map((caseItem) => (

            <div
              key={caseItem.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 transition-colors"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="font-mono text-xs font-extrabold text-brand-blue">
                      {caseItem.id}
                    </span>

                    <span
                      className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                        caseItem.outcome === 'Confirmed Fraud'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {caseItem.outcome}
                    </span>

                  </div>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Investigated {caseItem.date}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-[9px] font-bold uppercase text-slate-400">
                    Similarity
                  </p>

                  <p className="text-lg font-extrabold text-slate-800">
                    {caseItem.similarity}%
                  </p>

                </div>

              </div>

              <p className="text-[11px] leading-relaxed text-slate-600 mt-4">
                {caseItem.summary}
              </p>

              <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400">

                <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />

                <span>
                  Retrieved as historical investigative context
                </span>

              </div>

            </div>

          ))}

        </div>

        <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-100 flex items-start gap-3">

          <BrainCircuit className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />

          <p className="text-[10px] leading-relaxed text-purple-800">
            Historical matches provide supporting context for the
            investigator. Similarity to a previous case does not,
            by itself, establish fraud in the current provider.
          </p>

        </div>

      </section>


      {/* ============================================================
          INVESTIGATION GUIDANCE
      ============================================================ */}

      <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-6 shadow-sm">

        <div className="flex items-start gap-4">

          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-3">

              <h3 className="text-sm font-extrabold text-navy-900">
                Investigator Guidance
              </h3>

              <span className="text-[9px] font-extrabold px-2 py-1 rounded-full bg-red-100 text-red-600">
                HIGH PRIORITY
              </span>

            </div>

            <p className="text-[11px] text-slate-600 mt-2 max-w-4xl leading-relaxed">
              Multiple independent behavioral indicators are
              elevated relative to the provider peer group.
              The highest-value investigation targets are the
              reimbursement outliers, high-frequency beneficiaries,
              and repeated procedure patterns.
            </p>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

              {[
                {
                  icon: FileSearch,
                  text: 'Review the highest-risk claims first.'
                },
                {
                  icon: Users,
                  text: 'Examine beneficiaries with unusually high claim frequency.'
                },
                {
                  icon: Code2,
                  text: 'Review repeated or unusual procedure-code combinations.'
                },
                {
                  icon: History,
                  text: 'Compare the provider with relevant historical investigations.'
                }
              ].map((item, index) => {

                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white/80 border border-blue-100 rounded-lg p-3"
                  >

                    <Icon className="w-4 h-4 text-blue-600 shrink-0" />

                    <span className="text-[10px] font-semibold text-slate-700">
                      {item.text}
                    </span>

                  </div>
                );
              })}

            </div>


            <div className="mt-5 pt-4 border-t border-blue-100 flex items-start gap-2">

              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />

              <p className="text-[10px] text-slate-500 leading-relaxed">
                This analysis is decision-support information.
                A high model score or historical similarity is not
                a final determination of fraud and should be
                validated through appropriate investigation.
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}