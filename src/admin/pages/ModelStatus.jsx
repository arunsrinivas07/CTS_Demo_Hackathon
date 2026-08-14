import React from 'react';
import {
  Cpu,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function ModelStatus({
  modelStatus = {},
}) {
  return (
    <div className="space-y-5">

      <div>

        <h2 className="text-lg font-extrabold text-slate-900">
          Model Status
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Operational monitoring of fraud and anomaly detection models
        </p>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Model A */}

        <ModelCard
          name="Model A"
          type="HistGradientBoostingClassifier"
          description="Fraud detection model"
          status={modelStatus.modelA}
          features="30 inference features"
          outputs={[
            'Fraud probability',
            'Fraud risk score',
          ]}
        />

        {/* Model B */}

        <ModelCard
          name="Model B"
          type="Isolation Forest"
          description="Anomaly detection model"
          status={modelStatus.modelB}
          outputs={[
            'Anomaly score',
            'Anomaly risk score',
          ]}
          featureGroups={[
            ['CARRIER', '53 features'],
            ['OUTPATIENT', '51 features'],
            ['INPATIENT', '62 features'],
          ]}
        />

      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>

          <div>

            <h3 className="text-sm font-bold text-slate-900">
              Administrative Monitoring Only
            </h3>

            <p className="text-[10px] text-slate-400 mt-1">
              Model training, feature-schema editing and SHAP configuration
              are intentionally not exposed in this interface.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

function ModelCard({
  name,
  type,
  description,
  status,
  features,
  outputs,
  featureGroups,
}) {
  const isHealthy =
    String(status || '').toLowerCase() === 'healthy';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="p-5 border-b border-slate-100">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>

            <div>

              <h3 className="text-base font-extrabold text-slate-900">
                {name}
              </h3>

              <p className="text-[10px] text-slate-400 mt-1">
                {description}
              </p>

            </div>

          </div>

          <span
            className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md border ${
              isHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {status || 'Unavailable'}
          </span>

        </div>

      </div>

      <div className="p-5 space-y-5">

        <div>

          <p className="text-[9px] uppercase font-bold tracking-wide text-slate-400">
            Model
          </p>

          <p className="text-sm font-bold text-slate-800 mt-1">
            {type}
          </p>

        </div>

        {features && (

          <div>

            <p className="text-[9px] uppercase font-bold tracking-wide text-slate-400">
              Features
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1">
              {features}
            </p>

          </div>

        )}

        {featureGroups && (

          <div>

            <p className="text-[9px] uppercase font-bold tracking-wide text-slate-400 mb-2">
              Feature Groups
            </p>

            <div className="grid grid-cols-3 gap-2">

              {featureGroups.map(([group, count]) => (

                <div
                  key={group}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                >

                  <p className="text-[10px] font-bold text-slate-700">
                    {group}
                  </p>

                  <p className="text-[9px] text-slate-400 mt-1">
                    {count}
                  </p>

                </div>

              ))}

            </div>

          </div>

        )}

        <div>

          <p className="text-[9px] uppercase font-bold tracking-wide text-slate-400 mb-2">
            Outputs
          </p>

          <div className="space-y-2">

            {outputs.map((output) => (

              <div
                key={output}
                className="flex items-center gap-2 text-xs text-slate-600"
              >

                <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />

                {output}

              </div>

            ))}

          </div>

        </div>

        <div className="pt-3 border-t border-slate-100">

          <p className="text-[10px] text-emerald-600 font-semibold">
            ✓ SHAP explanation available
          </p>

        </div>

      </div>

    </div>
  );
}