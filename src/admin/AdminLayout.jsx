import React from 'react';

export default function AdminLayout({
  activePage,
  setActivePage,
  children,
}) {
  const navigation = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'claims', label: 'Claims' },
    { id: 'investigators', label: 'Investigators' },
    { id: 'health', label: 'System Health' },
    { id: 'models', label: 'Model Status' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* =====================================================
          SIMPLE ADMIN SIDEBAR
      ====================================================== */}
      <aside className="w-[260px] bg-slate-950 text-white min-h-screen flex-shrink-0">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-800">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">

              <span className="font-extrabold text-lg">
                H
              </span>

            </div>

            <div>
              <h2 className="font-extrabold text-base">
                HealthGuard AI
              </h2>

              <p className="text-[10px] text-slate-400">
                Administration Console
              </p>
            </div>

          </div>

        </div>


        {/* Admin */}
        <div className="px-4 pt-5">

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">

            <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
              Logged in as
            </p>

            <p className="text-xs font-bold text-cyan-400 mt-1">
              Administrator
            </p>

          </div>

        </div>


        {/* Navigation */}
        <nav className="px-3 py-6">

          <p className="px-3 mb-3 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
            Administration
          </p>

          <div className="space-y-1">

            {navigation.map((item) => (

              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>

            ))}

          </div>

        </nav>


        {/* Bottom */}
        <div className="absolute bottom-0 left-0 w-[260px] p-4 border-t border-slate-800">

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full text-left px-3 py-3 text-sm font-semibold text-red-400 hover:bg-slate-900 rounded-lg"
          >
            Sign Out
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="flex-1 min-w-0">

        {/* Topbar */}
        <header className="h-[84px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">

          <div>

            <h1 className="text-xl font-extrabold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              System-wide claims and fraud monitoring overview
            </p>

          </div>


          <div className="flex items-center gap-3">

            <div className="text-right">

              <p className="text-xs font-bold text-slate-800">
                Administrator
              </p>

              <p className="text-[10px] text-slate-400">
                System Administration
              </p>

            </div>


            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              AD
            </div>

          </div>

        </header>


        {/* Page Content */}
        <main className="p-6">

          {children}

        </main>

      </div>

    </div>
  );
}