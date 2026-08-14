import React from 'react';

import {
  LayoutDashboard,
  FileSearch,
  Users,
  Activity,
  Cpu,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar({
  activePage,
  setActivePage,
}) {
  const navigation = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'claims',
      label: 'Claims',
      icon: FileSearch,
    },
    {
      id: 'investigators',
      label: 'Investigators',
      icon: Users,
    },
    {
      id: 'health',
      label: 'System Health',
      icon: Activity,
    },
    {
      id: 'models',
      label: 'Model Status',
      icon: Cpu,
    },
  ];

  return (
    <aside className="w-[260px] bg-slate-950 text-white min-h-screen flex flex-col flex-shrink-0">

      {/* =====================================================
          LOGO
      ====================================================== */}
      <div className="px-5 py-6 border-b border-slate-800">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
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


      {/* =====================================================
          ADMIN BADGE
      ====================================================== */}
     


      {/* =====================================================
          MAIN NAVIGATION
      ====================================================== */}
      <nav className="px-3 py-6 flex-1">

        <p className="px-3 mb-3 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
          Administration
        </p>

        <div className="space-y-1">

          {navigation.map((item) => {

            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-3
                  rounded-lg
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }
                `}
              >

                <Icon className="w-4 h-4 flex-shrink-0" />

                <span>
                  {item.label}
                </span>

              </button>
            );

          })}

        </div>

      </nav>


      {/* =====================================================
          BOTTOM ACTIONS
          Settings + Sign Out
      ====================================================== */}
      <div className="px-4 py-4 border-t border-slate-800">

        <div className="flex items-center justify-between gap-2">

          {/* SETTINGS */}
          <button
            onClick={() => setActivePage('settings')}
            className={`
              flex
              items-center
              gap-2
              px-2
              py-2
              rounded-lg
              text-sm
              font-semibold
              transition-colors
              ${
                activePage === 'settings'
                  ? 'text-white bg-slate-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }
            `}
          >

            <Settings className="w-4 h-4 flex-shrink-0" />

            <span>
              Settings
            </span>

          </button>


          {/* SIGN OUT */}
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="
              flex
              items-center
              gap-2
              px-2
              py-2
              rounded-lg
              text-sm
              font-semibold
              text-red-400
              hover:text-red-300
              hover:bg-slate-900
              transition-colors
            "
          >

            <LogOut className="w-4 h-4 flex-shrink-0" />

            <span>
              Sign Out
            </span>

          </button>

        </div>

      </div>

    </aside>
  );
}