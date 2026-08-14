import React, { useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Clock,
  ShieldAlert,
  Building2,
  AlertTriangle,
  X,
  CheckCircle2,
  Loader2,
  CalendarClock,
} from 'lucide-react';
import { createReport } from '../services/api';

export default function Reports({ reports, onReportCreated }) {
  const [reportList, setReportList] = useState(reports || []);
  const [showModal, setShowModal] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] =
    useState('Investigation Summary');

  // ============================================================
  // Generate Report
  // ============================================================

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!newReportName.trim()) return;

    try {
      const created = await createReport({
        name: newReportName,
        type: newReportType,
      });

      setReportList((prev) => [created, ...prev]);

      if (onReportCreated) {
        onReportCreated(created);
      }

      setShowModal(false);
      setNewReportName('');
    } catch (error) {
      console.error('Failed to create report:', error);
      alert('Unable to generate the report. Please try again.');
    }
  };

  // ============================================================
  // Report Status Statistics
  // ============================================================

  const completedReports = reportList.filter(
    (report) =>
      String(report.status || '').toLowerCase() === 'completed'
  ).length;

  const processingReports = reportList.filter(
    (report) =>
      String(report.status || '').toLowerCase() === 'processing'
  ).length;

  const scheduledReports = [
    {
      title: 'Weekly Fraud Alert Summary',
      frequency: 'Every Monday 08:00 AM',
      type: 'Fraud Summary',
      icon: ShieldAlert,
    },
    {
      title: 'Monthly Anomaly Report',
      frequency: '1st of every month',
      type: 'Anomaly',
      icon: AlertTriangle,
    },
    {
      title: 'Provider Risk Audit Index',
      frequency: 'Bi-weekly Friday',
      type: 'Provider Risk',
      icon: Building2,
    },
  ];

  const scheduledCount = scheduledReports.length;

  // Completed reports are considered ready for PDF export.
  const exportReadyReports = completedReports;

  // ============================================================
  // Download PDF
  // ============================================================

  const handleDownloadPdf = (report) => {
    alert(`Downloading PDF for report ${report.report_id}...`);
  };

  return (
    <div className="w-full space-y-6 pb-10">

      {/* ========================================================
          PAGE ACTION HEADER
      ========================================================= */}

      <div className="flex items-center justify-end">

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-blue hover:bg-brand-darkBlue text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>

      </div>

      {/* ========================================================
          MAIN REPORT CONTENT
      ========================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-8 gap-6 items-start">

        {/* ======================================================
            GENERATED REPORTS HISTORY
        ======================================================= */}

        <section className="xl:col-span-5 min-w-0">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Card Header */}

            <div className="px-5 py-4 border-b border-slate-200">

              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                  <h3 className="text-sm font-bold text-navy-900">
                    Generated Reports History
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Recently generated compliance and investigation reports
                  </p>

                </div>

                <span className="flex-shrink-0 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                  {reportList.length} Reports
                </span>

              </div>

            </div>

            {/* ==================================================
                REPORT TABLE
            =================================================== */}

            <div className="w-full overflow-hidden">

              <table className="w-full table-fixed border-collapse">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="w-[30%] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Report Name
                    </th>

                    <th className="w-[16%] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="w-[20%] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Generated By
                    </th>

                    <th className="w-[13%] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="w-[10%] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="w-[11%] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      PDF
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {reportList.length > 0 ? (

                    reportList.map((report, index) => (

                      <tr
                        key={report.report_id || index}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                      >

                        {/* ==================================================
                            REPORT NAME
                        =================================================== */}

                        <td className="px-4 py-4 align-middle">

                          <div className="flex items-start gap-2.5 min-w-0">

                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-brand-blue flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">

                              <p className="font-bold text-xs text-slate-800 leading-4 break-words">
                                {report.report_name}
                              </p>

                              <p className="text-[9px] text-slate-400 font-mono mt-1 break-all">
                                {report.report_id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* ==================================================
                            TYPE
                        =================================================== */}

                        <td className="px-3 py-4 align-middle">

                          <span className="inline-block max-w-full text-[10px] leading-4 font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 break-words">
                            {report.type}
                          </span>

                        </td>

                        {/* ==================================================
                            GENERATED BY
                        =================================================== */}

                        <td className="px-3 py-4 align-middle">

                          <p className="text-[10px] text-slate-600 font-medium leading-4 break-words">
                            {report.generated_by}
                          </p>

                        </td>

                        {/* ==================================================
                            DATE
                        =================================================== */}

                        <td className="px-3 py-4 align-middle">

                          <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {report.date}
                          </span>

                        </td>

                        {/* ==================================================
                            STATUS
                        =================================================== */}

                        <td className="px-3 py-4 align-middle">

                          {String(report.status || '').toLowerCase() ===
                          'completed' ? (

                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>

                          ) : String(report.status || '').toLowerCase() ===
                            'processing' ? (

                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                              <Loader2 className="w-3 h-3" />
                              Processing
                            </span>

                          ) : (

                            <span className="inline-flex items-center text-[9px] font-semibold px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
                              {report.status || 'Pending'}
                            </span>

                          )}

                        </td>

                        {/* ==================================================
                            PDF ACTION
                        =================================================== */}

                        <td className="px-3 py-4 align-middle text-center">

                          {String(report.status || '').toLowerCase() ===
                          'completed' ? (

                            <button
                              onClick={() => handleDownloadPdf(report)}
                              className="inline-flex items-center justify-center gap-1.5 text-brand-blue hover:text-brand-darkBlue font-bold text-[10px] px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>

                          ) : (

                            <span className="text-[9px] text-slate-300">
                              —
                            </span>

                          )}

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan="6"
                        className="py-14 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>

                          <p className="text-xs font-semibold text-slate-600">
                            No reports generated yet
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1">
                            Generate a report to see it here.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </section>

        {/* ======================================================
            SCHEDULED REPORTS
        ======================================================= */}

        <section className="xl:col-span-3 min-w-0">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">

            {/* Header */}

            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">

              <div>

                <h3 className="text-sm font-bold text-navy-900">
                  Scheduled Recurring Reports
                </h3>

                <p className="text-[10px] text-slate-400 mt-1">
                  Automated report generation
                </p>

              </div>

              <span className="flex-shrink-0 text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md">
                Automated
              </span>

            </div>

            {/* Scheduled Reports */}

            <div className="space-y-3 mt-4">

              {scheduledReports.map((scheduled, index) => {

                const Icon = scheduled.icon;

                return (

                  <div
                    key={index}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-blue/30 hover:bg-blue-50/30 transition-colors"
                  >

                    <div className="flex items-start gap-3">

                      {/* Icon */}

                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-brand-blue" />
                      </div>

                      {/* Content */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <p className="text-xs font-bold text-slate-800 leading-4">
                            {scheduled.title}
                          </p>

                          <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                            {scheduled.type}
                          </span>

                        </div>

                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">

                          <Clock className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />

                          <span>{scheduled.frequency}</span>

                        </div>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          </div>

        </section>

      </div>

      {/* ========================================================
          REPORT STATUS & ACTIVITY
      ========================================================= */}

      <section>

        <div className="mb-3">

          <h3 className="text-sm font-bold text-navy-900">
            Report Status & Activity
          </h3>

          <p className="text-[11px] text-slate-400 mt-1">
            Current state of generated and scheduled reports
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* ==================================================
              COMPLETED
          =================================================== */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

            <div className="flex items-center justify-between">

              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <span className="text-[9px] font-semibold text-emerald-600">
                Ready
              </span>

            </div>

            <p className="text-2xl font-extrabold text-navy-900 mt-3">
              {completedReports}
            </p>

            <p className="text-xs font-bold text-slate-600 mt-1">
              Completed Reports
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Reports ready for investigator review
            </p>

          </div>

          {/* ==================================================
              PROCESSING
          =================================================== */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

            <div className="flex items-center justify-between">

              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-brand-blue" />
              </div>

              <span className="text-[9px] font-semibold text-brand-blue">
                Active
              </span>

            </div>

            <p className="text-2xl font-extrabold text-navy-900 mt-3">
              {processingReports}
            </p>

            <p className="text-xs font-bold text-slate-600 mt-1">
              Reports Processing
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Reports currently being generated
            </p>

          </div>

          {/* ==================================================
              SCHEDULED
          =================================================== */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

            <div className="flex items-center justify-between">

              <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                <CalendarClock className="w-4 h-4 text-violet-600" />
              </div>

              <span className="text-[9px] font-semibold text-violet-600">
                Automated
              </span>

            </div>

            <p className="text-2xl font-extrabold text-navy-900 mt-3">
              {scheduledCount}
            </p>

            <p className="text-xs font-bold text-slate-600 mt-1">
              Scheduled Reports
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Automated report schedules configured
            </p>

          </div>

          {/* ==================================================
              EXPORT READY
          =================================================== */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">

            <div className="flex items-center justify-between">

              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Download className="w-4 h-4 text-slate-600" />
              </div>

              <span className="text-[9px] font-semibold text-slate-500">
                PDF
              </span>

            </div>

            <p className="text-2xl font-extrabold text-navy-900 mt-3">
              {exportReadyReports}
            </p>

            <p className="text-xs font-bold text-slate-600 mt-1">
              Export Ready
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Completed reports available as PDF
            </p>

          </div>

        </div>

      </section>

      {/* ========================================================
          GENERATE REPORT MODAL
      ========================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">

            {/* Modal Header */}

            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h3 className="text-base font-bold text-navy-900">
                  Generate Custom Report
                </h3>

                <p className="text-[10px] text-slate-400 mt-1">
                  Configure the report you want to generate
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* Modal Body */}

            <form
              onSubmit={handleGenerate}
              className="p-6 space-y-4"
            >

              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Report Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Inpatient Provider Fraud Audit"
                  value={newReportName}
                  onChange={(e) =>
                    setNewReportName(e.target.value)
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                />

              </div>

              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Report Type
                </label>

                <select
                  value={newReportType}
                  onChange={(e) =>
                    setNewReportType(e.target.value)
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                >

                  <option value="Investigation Summary">
                    Investigation Summary
                  </option>

                  <option value="Anomaly">
                    Anomaly Report
                  </option>

                  <option value="Provider Risk">
                    Provider Risk Report
                  </option>

                  <option value="Fraud Summary">
                    Fraud Summary Report
                  </option>

                </select>

              </div>

              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-darkBlue rounded-lg shadow-sm"
                >
                  Generate Report
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}