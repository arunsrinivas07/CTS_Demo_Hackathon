import React from 'react';
import {
  Users,
  Plus,
  UserCheck,
} from 'lucide-react';

export default function Investigators({
  investigators = [],
  loading = false,
}) {
  return (
    <div className="space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>

          <h2 className="text-lg font-extrabold text-slate-900">
            Investigators
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Manage investigator accounts and application access
          </p>

        </div>

        <button
          onClick={() =>
            alert('Investigator creation requires the user-management API.')
          }
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          Add Investigator
        </button>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Investigator
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Email
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Role
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Last Activity
                </th>

                <th className="px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500">
                  Account
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="6"
                    className="py-16 text-center text-xs text-slate-400"
                  >
                    Loading investigators...
                  </td>
                </tr>

              ) : investigators.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="py-16 text-center"
                  >

                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />

                    <p className="text-xs font-semibold text-slate-600">
                      No investigator data available
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1 max-w-md mx-auto">
                      User-management APIs are not connected yet.
                      The administration interface is ready for integration.
                    </p>

                  </td>

                </tr>

              ) : (

                investigators.map((investigator) => (

                  <tr
                    key={investigator.id}
                    className="border-b border-slate-100"
                  >

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-3">

                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <UserCheck className="w-4 h-4" />
                        </div>

                        <span className="text-xs font-bold text-slate-800">
                          {investigator.name || '—'}
                        </span>

                      </div>

                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {investigator.email || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs font-semibold">
                      INVESTIGATOR
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {investigator.status || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      {investigator.last_activity || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {investigator.account_status || '—'}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}