import React, { useMemo, useState } from 'react';

import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  X,
} from 'lucide-react';

import AdminClaimDetails from '../components/AdminClaimDetails';

export default function AdminClaims({
  claims = [],
  loading = false,
}) {
  const [search, setSearch] = useState('');
  const [claimType, setClaimType] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedClaim, setSelectedClaim] = useState(null);

  const filteredClaims = useMemo(() => {

    let result = [...claims];

    const searchValue = search.toLowerCase().trim();

    if (searchValue) {
      result = result.filter((claim) =>
        String(claim.claim_id || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(claim.provider_id || '')
          .toLowerCase()
          .includes(searchValue)
      );
    }

    if (claimType !== 'ALL') {
      result = result.filter(
        (claim) => claim.claim_type === claimType
      );
    }

    if (riskLevel !== 'ALL') {
      result = result.filter(
        (claim) =>
          String(claim.risk_level || '').toUpperCase() ===
          riskLevel
      );
    }

    result.sort((a, b) => {

      const scoreA = Number(
        a.overall_risk_score ?? a.risk_score ?? 0
      );

      const scoreB = Number(
        b.overall_risk_score ?? b.risk_score ?? 0
      );

      return sortDirection === 'desc'
        ? scoreB - scoreA
        : scoreA - scoreB;
    });

    return result;

  }, [
    claims,
    search,
    claimType,
    riskLevel,
    sortDirection,
  ]);

  return (
    <div className="space-y-5">

      {/* Header */}

      <div>

        <h2 className="text-lg font-extrabold text-slate-900">
          Claims
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Administrative view of claim analysis results
        </p>

      </div>

      {/* Filters */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search Claim ID or Provider ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />

          </div>

          {/* Claim type */}

          <select
            value={claimType}
            onChange={(e) => setClaimType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-white font-semibold text-slate-600"
          >

            <option value="ALL">
              All Claim Types
            </option>

            <option value="Inpatient">
              Inpatient
            </option>

            <option value="Outpatient">
              Outpatient
            </option>

            <option value="Carrier">
              Carrier
            </option>

          </select>

          {/* Risk */}

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-white font-semibold text-slate-600"
          >

            <option value="ALL">
              All Risk Levels
            </option>

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="CRITICAL">
              Critical
            </option>

          </select>

          {/* Sort */}

          <button
            onClick={() =>
              setSortDirection((current) =>
                current === 'desc' ? 'asc' : 'desc'
              )
            }
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            Risk
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px] border-collapse">

            <thead>

              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Claim ID
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Provider ID
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Claim Type
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Fraud Risk
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Anomaly Risk
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Overall Risk
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Risk Level
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Date / Time
                </th>

                <th className="px-4 py-3 text-center text-[10px] uppercase font-bold text-slate-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="10"
                    className="py-16 text-center text-xs text-slate-400"
                  >
                    Loading claims...
                  </td>
                </tr>

              ) : filteredClaims.length === 0 ? (

                <tr>
                  <td
                    colSpan="10"
                    className="py-16 text-center"
                  >

                    <Filter className="w-7 h-7 text-slate-300 mx-auto mb-2" />

                    <p className="text-xs font-semibold text-slate-500">
                      No claims available
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      No backend claim records match the selected filters.
                    </p>

                  </td>
                </tr>

              ) : (

                filteredClaims.map((claim) => (

                  <tr
                    key={claim.claim_id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-4 py-3 text-xs font-bold text-blue-600 font-mono">
                      {claim.claim_id}
                    </td>

                    <td className="px-4 py-3 text-xs font-mono text-slate-600">
                      {claim.provider_id || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {claim.claim_type || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs font-bold text-slate-700">
                      {claim.fraud_risk_score ?? '—'}
                    </td>

                    <td className="px-4 py-3 text-xs font-bold text-slate-700">
                      {claim.anomaly_risk_score ?? '—'}
                    </td>

                    <td className="px-4 py-3 text-xs font-extrabold text-slate-900">
                      {claim.overall_risk_score ?? '—'}
                    </td>

                    <td className="px-4 py-3">
                      <RiskBadge
                        level={claim.risk_level}
                      />
                    </td>

                    <td className="px-4 py-3">

                      <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                        {claim.analysis_status || '—'}
                      </span>

                    </td>

                    <td className="px-4 py-3 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {claim.date_time || '—'}
                    </td>

                    <td className="px-4 py-3 text-center">

                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-[10px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Claim details */}

      {selectedClaim && (
        <AdminClaimDetails
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}

    </div>
  );
}

/* ==============================================================
   Small local risk badge
============================================================== */

function RiskBadge({ level }) {

  const normalized = String(level || '').toUpperCase();

  const styles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex text-[9px] font-bold px-2 py-1 rounded-md border ${
        styles[normalized] ||
        'bg-slate-50 text-slate-500 border-slate-200'
      }`}
    >
      {level || '—'}
    </span>
  );
}