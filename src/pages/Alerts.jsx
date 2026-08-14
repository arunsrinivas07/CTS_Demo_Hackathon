import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  Download,
  Plus,
  Search,
  ArrowUpRight,
  X,
  Upload,
  FileJson,
} from 'lucide-react';

export default function Alerts({ alerts, onSelectClaim }) {
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Create Case state
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [inputMode, setInputMode] = useState('manual');
  const [jsonFile, setJsonFile] = useState(null);

  const [formData, setFormData] = useState({
    provider_id: '',
    claim_id: '',
    claim_type: 'OUTPATIENT',

    claim_payment: '',
    primary_payer_payment: '',
    total_reimbursement: '',

    duration_days: '',
    diagnosis_count: '',
    procedure_count: '',
    hcpcs_count: '',

    has_negative_payment: false,
    has_primary_payer_payment: true,

    is_segment_2: false,
    has_segment_1_match: true,

    sex: '',
    race: '',
    esrd: false,
    state_code: '',
    county_code: '',

    hi_coverage_months: '',
    smi_coverage_months: '',
    hmo_coverage_months: '',
    plan_coverage_months: '',

    alzheimers: false,
    chf: false,
    chronic_kidney_disease: false,
    cancer: false,
    copd: false,
    depression: false,
    diabetes: false,
    ischemic_heart_disease: false,
    osteoporosis: false,
    rheumatoid_arthritis: false,
    stroke_tia: false,

    medreimb_ip: '',
    benres_ip: '',
    pppymt_ip: '',

    medreimb_op: '',
    benres_op: '',
    pppymt_op: '',

    medreimb_car: '',
    benres_car: '',
    pppymt_car: '',
  });

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesRisk =
      riskFilter === 'ALL' || a.risk_level === riskFilter;

    const matchesType =
      typeFilter === 'ALL' || a.claim_type === typeFilter;

    const matchesSearch =
      a.claim_id.toLowerCase().includes(search.toLowerCase()) ||
      a.provider_name.toLowerCase().includes(search.toLowerCase()) ||
      a.beneficiary_id.toLowerCase().includes(search.toLowerCase());

    return matchesRisk && matchesType && matchesSearch;
  });

  // Handle manual input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle JSON upload
  const handleJsonUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setJsonFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        setFormData({
          provider_id: data.provider_id ?? '',
          claim_id: data.claim_id ?? '',
          claim_type: data.claim_type ?? 'OUTPATIENT',

          claim_payment:
            data.claim?.payment?.claim_payment ?? '',

          primary_payer_payment:
            data.claim?.payment?.primary_payer_payment ?? '',

          total_reimbursement:
            data.claim?.payment?.total_reimbursement ?? '',

          duration_days:
            data.claim?.duration_days ?? '',

          diagnosis_count:
            data.claim?.diagnosis_count ?? '',

          procedure_count:
            data.claim?.procedure_count ?? '',

          hcpcs_count:
            data.claim?.hcpcs_count ?? '',

          has_negative_payment:
            data.claim?.has_negative_payment ?? false,

          has_primary_payer_payment:
            data.claim?.has_primary_payer_payment ?? false,

          is_segment_2:
            data.claim?.is_segment_2 ?? false,

          has_segment_1_match:
            data.claim?.has_segment_1_match ?? false,

          sex:
            data.beneficiary?.sex ?? '',

          race:
            data.beneficiary?.race ?? '',

          esrd:
            data.beneficiary?.esrd ?? false,

          state_code:
            data.beneficiary?.state_code ?? '',

          county_code:
            data.beneficiary?.county_code ?? '',

          hi_coverage_months:
            data.beneficiary?.hi_coverage_months ?? '',

          smi_coverage_months:
            data.beneficiary?.smi_coverage_months ?? '',

          hmo_coverage_months:
            data.beneficiary?.hmo_coverage_months ?? '',

          plan_coverage_months:
            data.beneficiary?.plan_coverage_months ?? '',

          alzheimers:
            data.beneficiary?.alzheimers ?? false,

          chf:
            data.beneficiary?.chf ?? false,

          chronic_kidney_disease:
            data.beneficiary?.chronic_kidney_disease ?? false,

          cancer:
            data.beneficiary?.cancer ?? false,

          copd:
            data.beneficiary?.copd ?? false,

          depression:
            data.beneficiary?.depression ?? false,

          diabetes:
            data.beneficiary?.diabetes ?? false,

          ischemic_heart_disease:
            data.beneficiary?.ischemic_heart_disease ?? false,

          osteoporosis:
            data.beneficiary?.osteoporosis ?? false,

          rheumatoid_arthritis:
            data.beneficiary?.rheumatoid_arthritis ?? false,

          stroke_tia:
            data.beneficiary?.stroke_tia ?? false,

          medreimb_ip:
            data.coverage?.medreimb_ip ?? '',

          benres_ip:
            data.coverage?.benres_ip ?? '',

          pppymt_ip:
            data.coverage?.pppymt_ip ?? '',

          medreimb_op:
            data.coverage?.medreimb_op ?? '',

          benres_op:
            data.coverage?.benres_op ?? '',

          pppymt_op:
            data.coverage?.pppymt_op ?? '',

          medreimb_car:
            data.coverage?.medreimb_car ?? '',

          benres_car:
            data.coverage?.benres_car ?? '',

          pppymt_car:
            data.coverage?.pppymt_car ?? '',
        });

        // Switch to manual view so the user can
        // review the populated values.
        setInputMode('manual');
      } catch (error) {
        alert('Invalid JSON file. Please upload a valid claim JSON.');
        setJsonFile(null);
      }
    };

    reader.readAsText(file);
  };

  // Close modal and reset uploaded file
  const closeCreateCase = () => {
    setShowCreateCase(false);
    setJsonFile(null);
    setInputMode('manual');
  };

  const columns = [
    {
      header: 'Risk',
      accessor: 'risk_level',
      cell: (r) => (
        <RiskBadge
          level={r.risk_level}
          score={r.fraud_percentage}
        />
      ),
    },
    {
      header: 'Claim ID',
      accessor: 'claim_id',
      cell: (r) => (
        <span className="font-bold font-mono text-brand-blue">
          {r.claim_id}
        </span>
      ),
    },
    {
      header: 'Claim Date',
      accessor: 'claim_date',
      cell: (r) => (
        <span className="text-slate-600 font-mono text-[11px]">
          {r.claim_date}
        </span>
      ),
    },
    {
      header: 'Provider',
      accessor: 'provider_name',
      cell: (r) => (
        <div>
          <p className="font-semibold text-slate-800">
            {r.provider_name}
          </p>

          <p className="text-[10px] text-slate-400 font-mono">
            {r.provider_id}
          </p>
        </div>
      ),
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiary_id',
      cell: (r) => (
        <span className="font-mono text-slate-600 text-xs">
          {r.beneficiary_id}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (r) => (
        <span className="font-bold text-slate-900">
          $
          {r.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      header: 'Fraud Prob.',
      accessor: 'fraud_percentage',
      cell: (r) => (
        <span className="font-extrabold text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded border border-red-100">
          {r.fraud_percentage}%
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Action',
      cell: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectClaim(r);
          }}
          className="bg-brand-blue hover:bg-brand-darkBlue text-white font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
        >
          <span>Open Case</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* =====================================================
          HEADER BAR
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-navy-900">
              Alerts Queue
            </h2>

            <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {alerts.length} Active Alerts
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Prioritized Medicare fraud investigation queue generated by
            Model A (HistGradientBoosting)
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Export CSV */}
          <button
            onClick={() => alert('Alerts queue exported to CSV.')}
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Create Case */}
          <button
            onClick={() => setShowCreateCase(true)}
            className="bg-brand-blue hover:bg-brand-darkBlue text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Case</span>
          </button>

        </div>
      </div>

      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3 flex-1 min-w-[240px]">

          <div className="relative flex-1">

            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Filter alerts by Claim ID, Provider, Beneficiary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-blue/20"
            />

          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Risk Filter */}
          <div className="flex items-center gap-2">

            <span className="text-xs font-semibold text-slate-500">
              Risk:
            </span>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">

            <span className="text-xs font-semibold text-slate-500">
              Type:
            </span>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="Inpatient">Inpatient</option>
              <option value="Outpatient">Outpatient</option>
            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN ALERTS DATA TABLE
      ====================================================== */}

      <DataTable
        columns={columns}
        data={filteredAlerts}
        onRowClick={(claim) => onSelectClaim(claim)}
        emptyMessage="No alerts matching selected filters."
      />

      {/* =====================================================
          CREATE CASE MODAL
      ====================================================== */}

      {showCreateCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">

          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">

              <div>
                <h2 className="text-lg font-extrabold text-navy-900">
                  Create New Investigation Case
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Enter claim information or upload an existing JSON record
                </p>
              </div>

              <button
                onClick={closeCreateCase}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Input Mode Tabs */}
            <div className="px-6 pt-4 flex-shrink-0">

              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">

                <button
                  onClick={() => setInputMode('manual')}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                    inputMode === 'manual'
                      ? 'bg-white text-brand-blue shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Manual Entry
                </button>

                <button
                  onClick={() => setInputMode('json')}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                    inputMode === 'json'
                      ? 'bg-white text-brand-blue shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Upload JSON
                </button>

              </div>

            </div>

            {/* JSON Upload Area */}
            {inputMode === 'json' && (
              <div className="px-6 pt-5 flex-shrink-0">

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-7 text-center hover:border-brand-blue hover:bg-blue-50/30 transition-colors">

                  <div className="flex justify-center mb-3">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FileJson className="w-6 h-6 text-brand-blue" />
                    </div>

                  </div>

                  <p className="text-sm font-bold text-slate-700">
                    Upload Claim JSON
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Upload a JSON file containing claim, beneficiary and
                    coverage information
                  </p>

                  <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-blue hover:bg-brand-darkBlue text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">

                    <Upload className="w-4 h-4" />

                    Choose JSON File

                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleJsonUpload}
                      className="hidden"
                    />

                  </label>

                  {jsonFile && (
                    <p className="text-xs text-emerald-600 font-semibold mt-3">
                      ✓ {jsonFile.name} loaded successfully
                    </p>
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                FORM CONTENT
            ================================================== */}

            <div className="px-6 py-5 overflow-y-auto flex-1">

              {/* =================================================
                  CLAIM INFORMATION
              ================================================== */}

              <div className="mb-7">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Claim Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Claim ID
                    </label>

                    <input
                      name="claim_id"
                      value={formData.claim_id}
                      onChange={handleInputChange}
                      placeholder="e.g. CLM_MANUAL_001"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Provider ID
                    </label>

                    <input
                      name="provider_id"
                      value={formData.provider_id}
                      onChange={handleInputChange}
                      placeholder="e.g. PRV51001"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Claim Type
                    </label>

                    <select
                      name="claim_type"
                      value={formData.claim_type}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
                    >
                      <option value="OUTPATIENT">Outpatient</option>
                      <option value="INPATIENT">Inpatient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Duration (Days)
                    </label>

                    <input
                      type="number"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleInputChange}
                      placeholder="e.g. 1"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Diagnosis Count
                    </label>

                    <input
                      type="number"
                      name="diagnosis_count"
                      value={formData.diagnosis_count}
                      onChange={handleInputChange}
                      placeholder="e.g. 4"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Procedure Count
                    </label>

                    <input
                      type="number"
                      name="procedure_count"
                      value={formData.procedure_count}
                      onChange={handleInputChange}
                      placeholder="e.g. 2"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      HCPCS Count
                    </label>

                    <input
                      type="number"
                      name="hcpcs_count"
                      value={formData.hcpcs_count}
                      onChange={handleInputChange}
                      placeholder="e.g. 3"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                </div>

              </div>

              {/* =================================================
                  PAYMENT INFORMATION
              ================================================== */}

              <div className="mb-7">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Claim Payment
                    </label>

                    <input
                      type="number"
                      name="claim_payment"
                      value={formData.claim_payment}
                      onChange={handleInputChange}
                      placeholder="e.g. 5000"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Primary Payer Payment
                    </label>

                    <input
                      type="number"
                      name="primary_payer_payment"
                      value={formData.primary_payer_payment}
                      onChange={handleInputChange}
                      placeholder="e.g. 1000"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Total Reimbursement
                    </label>

                    <input
                      type="number"
                      name="total_reimbursement"
                      value={formData.total_reimbursement}
                      onChange={handleInputChange}
                      placeholder="e.g. 6000"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                </div>

                <div className="flex flex-wrap gap-5 mt-4">

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_negative_payment"
                      checked={formData.has_negative_payment}
                      onChange={handleInputChange}
                      className="rounded border-slate-300"
                    />
                    Has Negative Payment
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_primary_payer_payment"
                      checked={formData.has_primary_payer_payment}
                      onChange={handleInputChange}
                      className="rounded border-slate-300"
                    />
                    Has Primary Payer Payment
                  </label>

                </div>

              </div>

              {/* =================================================
                  CLAIM SEGMENT INFORMATION
              ================================================== */}

              <div className="mb-7">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Claim Segment Information
                </h3>

                <div className="flex flex-wrap gap-5">

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_segment_2"
                      checked={formData.is_segment_2}
                      onChange={handleInputChange}
                      className="rounded border-slate-300"
                    />
                    Is Segment 2
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_segment_1_match"
                      checked={formData.has_segment_1_match}
                      onChange={handleInputChange}
                      className="rounded border-slate-300"
                    />
                    Has Segment 1 Match
                  </label>

                </div>

              </div>

              {/* =================================================
                  BENEFICIARY INFORMATION
              ================================================== */}

              <div className="mb-7">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Beneficiary Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Sex Code
                    </label>

                    <input
                      type="number"
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      placeholder="e.g. 1"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Race Code
                    </label>

                    <input
                      type="number"
                      name="race"
                      value={formData.race}
                      onChange={handleInputChange}
                      placeholder="e.g. 1"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      State Code
                    </label>

                    <input
                      type="number"
                      name="state_code"
                      value={formData.state_code}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      County Code
                    </label>

                    <input
                      type="number"
                      name="county_code"
                      value={formData.county_code}
                      onChange={handleInputChange}
                      placeholder="e.g. 100"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                </div>

                <div className="mt-4">

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="esrd"
                      checked={formData.esrd}
                      onChange={handleInputChange}
                      className="rounded border-slate-300"
                    />
                    ESRD
                  </label>

                </div>

              </div>

              {/* =================================================
                  COVERAGE PERIOD
              ================================================== */}

              <div className="mb-7">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Coverage Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      HI Coverage Months
                    </label>

                    <input
                      type="number"
                      name="hi_coverage_months"
                      value={formData.hi_coverage_months}
                      onChange={handleInputChange}
                      placeholder="12"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      SMI Coverage Months
                    </label>

                    <input
                      type="number"
                      name="smi_coverage_months"
                      value={formData.smi_coverage_months}
                      onChange={handleInputChange}
                      placeholder="12"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      HMO Coverage Months
                    </label>

                    <input
                      type="number"
                      name="hmo_coverage_months"
                      value={formData.hmo_coverage_months}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Plan Coverage Months
                    </label>

                    <input
                      type="number"
                      name="plan_coverage_months"
                      value={formData.plan_coverage_months}
                      onChange={handleInputChange}
                      placeholder="12"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />
                  </div>

                </div>

              </div>

              {/* =================================================
                  MEDICAL CONDITIONS
              ================================================== */}

              <div className="mb-7">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Medical Conditions
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                  {[
                    ['alzheimers', "Alzheimer's"],
                    ['chf', 'CHF'],
                    ['chronic_kidney_disease', 'Chronic Kidney Disease'],
                    ['cancer', 'Cancer'],
                    ['copd', 'COPD'],
                    ['depression', 'Depression'],
                    ['diabetes', 'Diabetes'],
                    ['ischemic_heart_disease', 'Ischemic Heart Disease'],
                    ['osteoporosis', 'Osteoporosis'],
                    ['rheumatoid_arthritis', 'Rheumatoid Arthritis'],
                    ['stroke_tia', 'Stroke / TIA'],
                  ].map(([name, label]) => (
                    <label
                      key={name}
                      className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={name}
                        checked={formData[name]}
                        onChange={handleInputChange}
                        className="rounded border-slate-300"
                      />

                      {label}
                    </label>
                  ))}

                </div>

              </div>

              {/* =================================================
                  COVERAGE PAYMENTS
              ================================================== */}

              <div className="mb-3">

                <h3 className="text-sm font-bold text-navy-900 mb-3">
                  Coverage Payments
                </h3>

                {/* Inpatient */}
                <div className="mb-5">

                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Inpatient
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <input
                      type="number"
                      name="medreimb_ip"
                      value={formData.medreimb_ip}
                      onChange={handleInputChange}
                      placeholder="Medicare Reimbursement"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                    <input
                      type="number"
                      name="benres_ip"
                      value={formData.benres_ip}
                      onChange={handleInputChange}
                      placeholder="Beneficiary Responsibility"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                    <input
                      type="number"
                      name="pppymt_ip"
                      value={formData.pppymt_ip}
                      onChange={handleInputChange}
                      placeholder="Primary Payer Payment"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                  </div>

                </div>

                {/* Outpatient */}
                <div className="mb-5">

                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Outpatient
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <input
                      type="number"
                      name="medreimb_op"
                      value={formData.medreimb_op}
                      onChange={handleInputChange}
                      placeholder="Medicare Reimbursement"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                    <input
                      type="number"
                      name="benres_op"
                      value={formData.benres_op}
                      onChange={handleInputChange}
                      placeholder="Beneficiary Responsibility"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                    <input
                      type="number"
                      name="pppymt_op"
                      value={formData.pppymt_op}
                      onChange={handleInputChange}
                      placeholder="Primary Payer Payment"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                  </div>

                </div>

                {/* Carrier */}
                <div>

                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Carrier
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <input
                      type="number"
                      name="medreimb_car"
                      value={formData.medreimb_car}
                      onChange={handleInputChange}
                      placeholder="Medicare Reimbursement"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                    <input
                      type="number"
                      name="benres_car"
                      value={formData.benres_car}
                      onChange={handleInputChange}
                      placeholder="Beneficiary Responsibility"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                    <input
                      type="number"
                      name="pppymt_car"
                      value={formData.pppymt_car}
                      onChange={handleInputChange}
                      placeholder="Primary Payer Payment"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================== */}

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0 bg-slate-50">

              <p className="text-[10px] text-slate-400">
                Prediction will be processed using the configured fraud detection model.
              </p>

              <div className="flex gap-3">

                <button
                  onClick={closeCreateCase}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={() => alert('Claim data ready for model prediction.')}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-darkBlue rounded-lg transition-colors"
                >
                  Run Prediction
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}