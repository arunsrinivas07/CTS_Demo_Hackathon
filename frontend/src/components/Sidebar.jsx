import React from "react";

import {
  LayoutDashboard,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  FileText,
  Activity,
  Settings,
  LogOut,
  Users,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  userRole,
}) {
  // =========================================================
  // CURRENT ROLE
  // =========================================================

  const role = (userRole || "investigator").toLowerCase();

  // =========================================================
  // ROLE-BASED NAVIGATION
  // =========================================================

  const navItems = {
    // =======================================================
    // INVESTIGATOR
    // =======================================================

    investigator: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "alerts",
        label: "Alerts Queue",
        icon: AlertTriangle,
        badge: "4",
      },
      {
        id: "claims",
        label: "Claims & Investigation",
        icon: FileSpreadsheet,
      },
      {
        id: "providers",
        label: "Provider Intelligence",
        icon: Building2,
      },
      {
        id: "reports",
        label: "Reports Archive",
        icon: FileText,
      },
      {
        id: "model-performance",
        label: "Model Performance",
        icon: Activity,
        tag: "Model A",
      },
    ],

    // =======================================================
    // ADMIN
    // =======================================================

    admin: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "alerts",
        label: "Alerts Queue",
        icon: AlertTriangle,
        badge: "4",
      },
      {
        id: "claims",
        label: "Claims & Investigation",
        icon: FileSpreadsheet,
      },
      {
        id: "providers",
        label: "Provider Intelligence",
        icon: Building2,
      },
      {
        id: "reports",
        label: "Reports Archive",
        icon: FileText,
      },
      {
        id: "model-performance",
        label: "Model Performance",
        icon: Activity,
        tag: "Model A",
      },
      {
        id: "users",
        label: "User Management",
        icon: Users,
      },
      {
        id: "audit",
        label: "Audit Logs",
        icon: ClipboardCheck,
      },
    ],

    // =======================================================
    // USER
    // =======================================================

    user: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "claims",
        label: "Claims Analysis",
        icon: FileSpreadsheet,
      },
      {
        id: "providers",
        label: "Provider Intelligence",
        icon: Building2,
      },
      {
        id: "reports",
        label: "Reports Archive",
        icon: FileText,
      },
    ],
  };

  // =========================================================
  // GET NAVIGATION FOR CURRENT ROLE
  // =========================================================

  const currentNavItems =
    navItems[role] || navItems.investigator;

  // =========================================================
  // ROLE DISPLAY NAME
  // =========================================================

  const roleNames = {
    admin: "System Administrator",
    investigator: "Fraud Investigator",
    user: "Claims User",
  };

  const roleDisplayName =
    roleNames[role] || "Fraud Investigator";

  // =========================================================
  // SIDEBAR
  // =========================================================

  return (
    <aside className="w-64 h-screen flex-shrink-0 sticky top-0 bg-slate-950 text-white flex flex-col border-r border-slate-800">

      {/* =====================================================
          BRAND HEADER
      ====================================================== */}

      <div className="px-5 py-6 border-b border-slate-800/80">

        <div className="flex items-center gap-3">

          {/* Logo */}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">

            <ShieldCheck className="w-6 h-6 text-white" />

          </div>

          {/* Brand */}

          <div>

            <h1 className="text-lg font-bold tracking-tight">
              HealthGuard AI
            </h1>

            <p className="text-[10px] text-slate-400 font-medium">
              Medicare Fraud Intelligence
            </p>

          </div>

        </div>

        {/* =================================================
            LOGGED-IN ROLE
        ================================================== */}

        <div className="mt-5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800">

          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
            Logged in as
          </div>

          <div className="text-xs text-cyan-400 font-semibold mt-1">
            {roleDisplayName}
          </div>

        </div>

      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex-1 overflow-y-auto">

        <nav className="p-3 space-y-1">

          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Console Core
          </div>

          {currentNavItems.map((item) => {

            const Icon = item.icon;

            const isActive =
              activeTab === item.id;

            return (

              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-semibold transition-all transform ${
                  isActive
                    ? "bg-gradient-to-r from-brand-blue to-cyan-600 text-white shadow-lg scale-[1.02]"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:scale-[1.01]"
                }`}
              >

                {/* Left Side */}

                <div className="flex items-center gap-3">

                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  />

                  <span>
                    {item.label}
                  </span>

                </div>

                {/* Right Side */}

                <div className="flex items-center gap-1">

                  {/* Model A */}

                  {item.tag && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-cyan-400"
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}

                  {/* Alert Badge */}

                  {item.badge && (
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}

                </div>

              </button>

            );
          })}

        </nav>

      </div>

      {/* =====================================================
          MODEL STATUS + FOOTER
      ====================================================== */}

      <div className="flex-shrink-0 p-3 border-t border-slate-800/80 space-y-3 bg-slate-900/50">

        {/* =================================================
            MODEL STATUS
        ================================================== */}

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/60 shadow-lg">

          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">

            <span>
              Model Status
            </span>

            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />

              Healthy

            </span>

          </div>

          {/* YOUR FINAL MODEL */}

          <div className="text-[11px] text-slate-400 font-mono space-y-1">

            <div>
              Model A: HistGradient Boosting
            </div>

            <div className="text-cyan-400 font-bold">
              Production Fraud Detection
            </div>

          </div>

        </div>

        {/* =================================================
            SETTINGS + SIGN OUT
        ================================================== */}

        <div className="flex items-center justify-between px-2 pt-1 text-slate-400">

          <button
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-2 text-xs hover:text-white transition-colors hover:bg-slate-800 px-2 py-1.5 rounded-lg"
          >

            <Settings className="w-4 h-4" />

            <span>
              Settings
            </span>

          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors hover:bg-slate-800 px-2 py-1.5 rounded-lg"
          >

            <LogOut className="w-4 h-4" />

            <span>
              Sign Out
            </span>

          </button>

        </div>

      </div>

    </aside>
  );
}