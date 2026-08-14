import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Activity,
  Eye,
} from 'lucide-react';

export default function AdminClaimDetails({
  claim,
  onClose,
}) {
  const [showDetailedExplanation, setShowDetailedExplanation] =
    useState(false);

  if (!claim) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">

        {/* Header */}

        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">

          <div>

            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Claim Details
            </p>

            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              {claim.claim_id || '—'}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* Content */}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-5">

          {/* Claim Information */}

          <section className="bg-slate-50 rounded-xl p-5">

            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Claim Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <InfoItem
                label="Claim ID"
                value={claim.claim_id}
              />

              <InfoItem
                label="Provider ID"
                value={claim.provider_id}
              />

              <InfoItem
                label="Claim Type"
                value={claim.claim_type}
              />

            </div>

          </section>

          {/* Fraud */}

          <AnalysisSection
            title="Fraud Analysis"
            icon={ShieldAlert}
            iconClass="text-red-600 bg-red-50"
            values={[
              ['Fraud Probability', claim.fraud?.probability],
              ['Fraud Risk Score', claim.fraud?.risk_score],
              ['Fraud Level', claim.fraud?.level],
            ]}
          />

          {/* Anomaly */}

          <AnalysisSection
            title="Anomaly Analysis"
            icon={Activity}
            iconClass="text-orange-600 bg-orange-50"
            values={[
              ['Anomaly Score', claim.anomaly?.raw_score],
              ['Anomaly Risk Score', claim.anomaly?.risk_score],
              ['Anomaly Level', claim.anomaly?.level],
            ]}
          />

          {/* Overall */}

          <section className="rounded-xl border border-slate-200 p-5">

            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Overall Risk
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <InfoItem
                label="Overall Risk Score"
                value={claim.overall?.risk_score}
              />

              <InfoItem
                label="Overall Risk Level"
                value={claim.overall?.risk_level}
              />

            </div>

          </section>

          {/* XAI */}

          <div>

            <button
              onClick={() =>
                setShowDetailedExplanation((current) => !current)
              }
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg"
            >

              <Eye className="w-4 h-4" />

              {showDetailedExplanation
                ? 'Hide Detailed Explanation'
                : 'View Detailed Explanation'}

            </button>

          </div>

          {showDetailedExplanation && (
            <XaiExplanation claim={claim} />
          )}

        </div>

      </div>

    </div>
  );
}

/* ==============================================================
   Information item
============================================================== */

function InfoItem({ label, value }) {
  return (
    <div>

      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
        {label}
      </p>

      <p className="text-sm font-bold text-slate-800 mt-1">
        {value ?? '—'}
      </p>

    </div>
  );
}

/* ==============================================================
   Analysis section
============================================================== */

function AnalysisSection({
  title,
  icon: Icon,
  iconClass,
  values,
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-5">

      <div className="flex items-center gap-3 mb-4">

        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {values.map(([label, value]) => (
          <InfoItem
            key={label}
            label={label}
            value={value}
          />
        ))}

      </div>

    </section>
  );
}

/* ==============================================================
   XAI Explanation
============================================================== */

function XaiExplanation({ claim }) {

  const fraudDrivers =
    claim.fraud?.explanation?.all_feature_contributions || [];

  const anomalyDrivers =
    claim.anomaly?.explanation?.all_feature_contributions || [];

  return (
    <section className="rounded-xl border border-slate-200 overflow-hidden">

      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">

        <h3 className="text-sm font-bold text-slate-900">
          Detailed XAI Explanation
        </h3>

        <p className="text-[10px] text-slate-400 mt-1">
          User-friendly feature contributions returned by the backend
        </p>

      </div>

      <div className="p-5 space-y-6">

        <ContributionTable
          title="Fraud"
          contributions={fraudDrivers}
          type="fraud"
        />

        <ContributionTable
          title="Anomaly"
          contributions={anomalyDrivers}
          type="anomaly"
        />

      </div>

    </section>
  );
}

/* ==============================================================
   Contribution table
============================================================== */

function ContributionTable({
  title,
  contributions,
  type,
}) {
  return (
    <div>

      <h4 className="text-xs font-bold text-slate-800 mb-3">
        {title} Feature Contributions
      </h4>

      {contributions.length === 0 ? (

        <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center">

          <p className="text-xs text-slate-500">
            Detailed explanation unavailable
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px]">

            <thead>

              <tr className="bg-slate-50">

                <th className="px-3 py-2 text-left text-[9px] uppercase text-slate-400">
                  Feature
                </th>

                <th className="px-3 py-2 text-left text-[9px] uppercase text-slate-400">
                  Value
                </th>

                <th className="px-3 py-2 text-left text-[9px] uppercase text-slate-400">
                  Contribution
                </th>

                <th className="px-3 py-2 text-left text-[9px] uppercase text-slate-400">
                  Direction
                </th>

                <th className="px-3 py-2 text-left text-[9px] uppercase text-slate-400">
                  Rank
                </th>

              </tr>

            </thead>

            <tbody>

              {contributions.map((item, index) => (

                <tr
                  key={`${item.feature || 'feature'}-${index}`}
                  className="border-b border-slate-100"
                >

                  <td className="px-3 py-2 text-xs font-semibold text-slate-700">
                    {item.feature ?? '—'}
                  </td>

                  <td className="px-3 py-2 text-xs text-slate-600">
                    {item.value ?? '—'}
                  </td>

                  <td className="px-3 py-2 text-xs font-bold text-slate-800">
                    {item.contribution ?? '—'}
                  </td>

                  <td className="px-3 py-2 text-xs text-slate-600">
                    {translateDirection(item.direction, type)}
                  </td>

                  <td className="px-3 py-2 text-xs text-slate-500">
                    {item.rank ?? '—'}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

/* ==============================================================
   Direction translation
============================================================== */

function translateDirection(direction, type) {

  const map = {
    increases_fraud: 'Increases fraud risk',
    decreases_fraud: 'Decreases fraud risk',
    increases_anomaly: 'Increases anomaly risk',
    decreases_anomaly: 'Decreases anomaly risk',
  };

  return map[direction] || direction || '—';
}