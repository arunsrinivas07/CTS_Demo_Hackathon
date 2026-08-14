import React from 'react';
import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';
import { ExternalLink, ArrowUpDown } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, emptyMessage = "No matching records found." }) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5 whitespace-nowrap">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
