import React from 'react';
import { Sparkles, BrainCircuit, ArrowUpRight, TrendingUp, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function ShapContentBreakdown({ claimId = "CLM-904812", providerId = "PRV51003", providerName = "Metro General Health System" }) {
  const shapFactors = [
    {
      feature: "Total Reimbursement",
      shapValue: "+0.312",
      impact: "High Risk Inflation",
      value: "$14,250.00",
      baseline: "$3,450.00 (Peer Avg)",
      rationale: "SHAP value +0.312 indicates that the claim amount of $14,250.00 is 3.1x higher than regional specialty benchmarks, serving as the single largest positive contributor pushing the fraud probability past the 0.50 threshold."
    },
    {
      feature: "Claims Per Beneficiary",
      shapValue: "+0.245",
      impact: "High Utilization Anomaly",
      value: "6.8 claims / patient",
      baseline: "2.1 claims / patient (Peer Avg)",
      rationale: "SHAP value +0.245 captures abnormal patient claim frequency. The provider billed an average of 6.8 claims per beneficiary within a 90-day window, indicating potential unbundling or repeated billing."
    },
    {
      feature: "Inpatient Claim Share",
      shapValue: "+0.184",
      impact: "Care Setting Discrepancy",
      value: "42.5% Inpatient Share",
      baseline: "14.2% Inpatient Share (Peer Avg)",
      rationale: "SHAP value +0.184 reflects a major imbalance in inpatient billing volume compared to outpatient care for this specialty category."
    },
    {
      feature: "Inpatient Max Reimbursement Range",
      shapValue: "+0.128",
      impact: "Outlier Billing Range",
      value: "$18,900.00 Max - $4,200.00 Min",
      baseline: "$5,100.00 Range (Peer Avg)",
      rationale: "SHAP value +0.128 indicates extreme variance between peak and average claim reimbursements, typical of high-risk upcoding patterns."
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Rationale Header */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            SHAP (SHapley Additive exPlanations) Rationale
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          The Gradient Boosting model classified claim <code className="text-cyan-300 font-mono">{claimId}</code> for provider <strong className="text-white">{providerName}</strong> as <strong className="text-red-400">Potential Fraud (91% Probability)</strong>. Below is the exact breakdown of how specific feature values shifted the model prediction from the baseline expectation.
        </p>
      </div>

      {/* Structured SHAP Feature Rationale Content Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
            <span>SHAP Feature Attribution Evidence</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Model Base Value: 0.0935 (9.35%)</span>
        </div>

        {shapFactors.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 card-shadow hover:border-brand-blue/40 transition-all space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center font-mono">
                  +{idx + 1}
                </span>
                <div>
                  <h5 className="text-xs font-bold text-navy-900">{item.feature}</h5>
                  <span className="text-[10px] text-slate-400 font-medium">{item.impact}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  SHAP {item.shapValue}
                </span>
                <span className="text-xs font-bold font-mono bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded">
                  {item.value}
                </span>
              </div>
            </div>

            {/* Natural language why explanation */}
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {item.rationale}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50 font-mono">
              <span>Observed Value: <strong className="text-slate-700">{item.value}</strong></span>
              <span>Regional Benchmark: <strong className="text-slate-700">{item.baseline}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Rationale Callout */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <strong className="text-brand-blue block font-semibold mb-0.5">Audit Trail & Compliance Rationale</strong>
          <span>
            Combined SHAP feature additivity shows that high total reimbursement and beneficiary claim frequency account for over 55% of the total risk probability increase above baseline.
          </span>
        </div>
      </div>
    </div>
  );
}
