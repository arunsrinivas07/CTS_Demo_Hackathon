import React from 'react';
import { Search, Calendar, Bell, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';

export default function Topbar({ title, subtitle, onOpenAiModal, globalSearch, setGlobalSearch }) {
  return (
    <header className="bg-white border-b-2 border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
      {/* Page Title Context */}
      <div>
        <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Global Search - Enhanced */}
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Claim ID, Provider, Beneficiary..."
            value={globalSearch || ''}
            onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
          />
        </div>

        {/* Date Filter - Enhanced */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-brand-blue transition-all">
          <Calendar className="w-4 h-4 text-brand-blue" />
          <span>Last 30 Days</span>
        </div>

        {/* Ask HealthGuard AI Button - Enhanced */}
        <button
          onClick={onOpenAiModal}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-cyan-600 hover:from-brand-darkBlue hover:to-cyan-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Ask HealthGuard AI</span>
        </button>

        {/* Notifications - Enhanced */}
        <button className="relative p-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-brand-blue text-slate-600 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        </button>

        {/* User Profile - Enhanced */}
        <div className="flex items-center gap-3 pl-3 border-l-2 border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-900 to-slate-800 text-white font-bold text-sm flex items-center justify-center border-2 border-slate-300 shadow-md">
            SJ
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-navy-900 leading-tight">Dr. Sarah Jenkins</p>
            <p className="text-[10px] text-slate-400 font-medium">Lead SIU Auditor</p>
          </div>
        </div>
      </div>
    </header>
  );
}
