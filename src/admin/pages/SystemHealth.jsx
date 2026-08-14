import React from 'react';

import {
  Server,
  Database,
  Cpu,
  GitMerge,
  BrainCircuit,
} from 'lucide-react';

import HealthStatusCard from '../components/HealthStatusCard';

export default function SystemHealth({
  health,
  loading = false,
}) {
  const services = [
    {
      key: 'backend',
      name: 'Backend API',
      description: 'Application API service',
      icon: Server,
    },
    {
      key: 'database',
      name: 'Database / Data Layer',
      description: 'Claims and application data',
      icon: Database,
    },
    {
      key: 'modelA',
      name: 'Model A',
      description: 'Fraud detection service',
      icon: Cpu,
    },
    {
      key: 'modelB',
      name: 'Model B',
      description: 'Anomaly detection service',
      icon: Cpu,
    },
    {
      key: 'riskFusion',
      name: 'Risk Fusion Engine',
      description: 'Overall risk aggregation',
      icon: GitMerge,
    },
    {
      key: 'xai',
      name: 'XAI / SHAP Service',
      description: 'Detailed model explanation service',
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="space-y-5">

      <div>

        <h2 className="text-lg font-extrabold text-slate-900">
          System Health
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Monitor the availability of critical platform services
        </p>

      </div>

      {loading ? (

        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-xs text-slate-500">
            Loading system health...
          </p>
        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {services.map((service) => (

            <HealthStatusCard
              key={service.key}
              name={service.name}
              description={service.description}
              status={health?.[service.key]}
            />

          ))}

        </div>

      )}

      {!health && !loading && (

        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">

          <p className="text-xs font-semibold text-slate-600">
            System health data unavailable
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            Connect the existing backend health/status endpoint to display
            live service states.
          </p>

        </div>

      )}

    </div>
  );
}