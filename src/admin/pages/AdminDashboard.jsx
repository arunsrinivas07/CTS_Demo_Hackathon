import React from 'react';
import {
  FileSearch,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Siren,
  Users,
  Server,
  Database,
  Cpu,
} from 'lucide-react';

export default function AdminDashboard({
  stats,
  loading = false,
}) {
  /*
   * Default values are used for now so that the Admin dashboard
   * works even when the backend statistics are not connected.
   *
   * Later we can connect these values to your existing backend.
   */

  const dashboardStats = {
    totalClaims: stats?.totalClaims ?? 5410,
    highRiskClaims: stats?.highRiskClaims ?? 506,
    criticalRiskClaims: stats?.criticalRiskClaims ?? 42,
    fraudAlerts: stats?.fraudAlerts ?? 128,
    anomalousClaims: stats?.anomalousClaims ?? 96,

    investigators: stats?.investigators ?? 12,
    activeCases: stats?.activeCases ?? 38,
    systemHealth: stats?.systemHealth ?? 98,
  };

  const kpis = [
    {
      title: 'Total Claims',
      value: dashboardStats.totalClaims,
      subtitle: 'Claims analyzed by system',
      icon: FileSearch,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'High Risk Claims',
      value: dashboardStats.highRiskClaims,
      subtitle: 'Claims classified as high risk',
      icon: AlertTriangle,
      iconClass: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Critical Risk',
      value: dashboardStats.criticalRiskClaims,
      subtitle: 'Require immediate attention',
      icon: Siren,
      iconClass: 'bg-red-50 text-red-600',
    },
    {
      title: 'Fraud Alerts',
      value: dashboardStats.fraudAlerts,
      subtitle: 'Fraud-related signals',
      icon: ShieldAlert,
      iconClass: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Anomalies',
      value: dashboardStats.anomalousClaims,
      subtitle: 'Claims with anomaly signals',
      icon: Activity,
      iconClass: 'bg-violet-50 text-violet-600',
    },
  ];

  const riskData = [
    {
      label: 'Low',
      value: 42,
      percentage: 42,
      className: 'bg-emerald-500',
    },
    {
      label: 'Medium',
      value: 31,
      percentage: 31,
      className: 'bg-amber-500',
    },
    {
      label: 'High',
      value: 19,
      percentage: 19,
      className: 'bg-orange-500',
    },
    {
      label: 'Critical',
      value: 8,
      percentage: 8,
      className: 'bg-red-600',
    },
  ];

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          System Overview
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Administrative overview of claims, fraud detection and system activity
        </p>
      </div>


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        {kpis.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-wide font-bold text-slate-500">
                    {item.title}
                  </p>

                  <p className="text-2xl font-extrabold text-slate-900 mt-3">
                    {loading ? '...' : item.value.toLocaleString()}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    {item.subtitle}
                  </p>

                </div>

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

              </div>

            </div>
          );
        })}

      </div>


      {/* =====================================================
          MAIN ADMIN INFORMATION
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">


        {/* Risk Distribution */}

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Overall Risk Distribution
              </h3>

              <p className="text-[10px] text-slate-400 mt-1">
                Distribution of analyzed claims by risk level
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Current Dataset
            </div>

          </div>


          <div className="space-y-5">

            {riskData.map((risk) => (

              <div key={risk.label}>

                <div className="flex items-center justify-between mb-2">

                  <div className="flex items-center gap-2">

                    <div
                      className={`w-2.5 h-2.5 rounded-full ${risk.className}`}
                    />

                    <span className="text-xs font-semibold text-slate-600">
                      {risk.label}
                    </span>

                  </div>

                  <span className="text-xs font-bold text-slate-800">
                    {risk.value}%
                  </span>

                </div>


                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full ${risk.className}`}
                    style={{
                      width: `${risk.percentage}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* System Status */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

          <div className="mb-5">

            <h3 className="text-sm font-bold text-slate-900">
              System Status
            </h3>

            <p className="text-[10px] text-slate-400 mt-1">
              Current platform health
            </p>

          </div>


          <div className="space-y-4">

            <StatusRow
              icon={Server}
              title="Backend API"
              status="Operational"
            />

            <StatusRow
              icon={Database}
              title="Database"
              status="Connected"
            />

            <StatusRow
              icon={Cpu}
              title="ML Model"
              status="Running"
            />

            <StatusRow
              icon={Activity}
              title="XAI Service"
              status="Operational"
            />

          </div>


          <div className="mt-6 pt-5 border-t border-slate-100">

            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-slate-500">
                Overall Health
              </span>

              <span className="text-sm font-extrabold text-emerald-600">
                {dashboardStats.systemHealth}%
              </span>

            </div>

            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${dashboardStats.systemHealth}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ADMIN ACTIVITY
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


        <InfoCard
          icon={Users}
          title="Investigators"
          value={dashboardStats.investigators}
          description="Registered investigators"
          iconClass="bg-blue-50 text-blue-600"
        />


        <InfoCard
          icon={ShieldAlert}
          title="Active Cases"
          value={dashboardStats.activeCases}
          description="Cases currently under investigation"
          iconClass="bg-red-50 text-red-600"
        />


        <InfoCard
          icon={Activity}
          title="System Health"
          value={`${dashboardStats.systemHealth}%`}
          description="Overall platform availability"
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </div>


      {/* =====================================================
          ADMIN NOTE
      ====================================================== */}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

        <div className="flex items-start gap-3">

          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>

            <h3 className="text-sm font-bold text-blue-900">
              Administrative Monitoring
            </h3>

            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              This dashboard provides administrators with a system-wide
              view of claim analysis, fraud alerts, investigator activity
              and model health.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   STATUS ROW
============================================================ */

function StatusRow({
  icon: Icon,
  title,
  status,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>

        <span className="text-xs font-semibold text-slate-700">
          {title}
        </span>

      </div>

      <div className="flex items-center gap-1.5">

        <span className="w-2 h-2 rounded-full bg-emerald-500" />

        <span className="text-[10px] font-semibold text-emerald-600">
          {status}
        </span>

      </div>

    </div>
  );
}


/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

      <div className="flex items-start gap-4">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div>

          <p className="text-[10px] uppercase tracking-wide font-bold text-slate-500">
            {title}
          </p>

          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {value}
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}