import React, {
  useState,
  useEffect,
  lazy,
  Suspense
} from 'react';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AskHealthGuardModal from './components/AskHealthGuardModal';

// =========================================================
// LOGIN
// =========================================================

import Login from './pages/Login';


// =========================================================
// INVESTIGATOR PAGES
// =========================================================

import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import ClaimsConsole from './pages/ClaimsConsole';
import ProviderIntelligence from './pages/ProviderIntelligence';
import ProviderDetails from './pages/ProviderDetails';
import Reports from './pages/Reports';
import ModelPerformance from './pages/ModelPerformance';


// =========================================================
// ADMIN APPLICATION
// =========================================================
//
// IMPORTANT:
// AdminApp is loaded only when the user selects Admin.
// This prevents Admin-side errors from affecting the
// existing Investigator application.
//

const AdminApp = lazy(() => import('./admin/AdminApp'));


// =========================================================
// API
// =========================================================

import {
  fetchClaims,
  fetchProviders,
  fetchAlerts,
  fetchReports,
} from './services/api';


export default function App() {

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Selected role from Login.jsx
  //
  // Possible values:
  // "admin"
  // "investigator"
  //
  const [userRole, setUserRole] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');


  // =========================================================
  // INVESTIGATOR DATA
  // =========================================================

  const [claims, setClaims] = useState([]);
  const [providers, setProviders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);


  // =========================================================
  // SELECTED ITEMS
  // =========================================================

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);


  // =========================================================
  // GLOBAL UI
  // =========================================================

  const [globalSearch, setGlobalSearch] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = (role) => {

    console.log('Logged in role:', role);

    /*
      Login.jsx sends either:

      "admin"

      OR

      "investigator"
    */

    setUserRole(role);
    setIsAuthenticated(true);

    // Start from dashboard after login
    setActiveTab('dashboard');

  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    setIsAuthenticated(false);
    setUserRole(null);

    setActiveTab('dashboard');

    // Close AI modal
    setIsAiModalOpen(false);

  };


  // =========================================================
  // LOAD INVESTIGATOR DATA
  // =========================================================

  /*
    IMPORTANT:

    Investigator APIs are loaded ONLY when the user is
    authenticated as an investigator.

    Admin users will NOT trigger these API calls.
  */

  useEffect(() => {

    // User is not logged in yet
    if (!isAuthenticated) {
      return;
    }

    // Admin does not need Investigator API data
    if (userRole !== 'investigator') {
      return;
    }


    async function loadData() {

      try {

        const claimsRes = await fetchClaims();
        const providersRes = await fetchProviders();
        const alertsRes = await fetchAlerts();
        const reportsRes = await fetchReports();


        // Store data
        setClaims(claimsRes || []);
        setProviders(providersRes || []);
        setAlerts(alertsRes || []);
        setReports(reportsRes || []);


        // Select first claim
        if (claimsRes && claimsRes.length > 0) {
          setSelectedClaim(claimsRes[0]);
        }


        // Select first provider
        if (providersRes && providersRes.length > 0) {
          setSelectedProvider(providersRes[0]);
        }


      } catch (error) {

        console.error(
          'Error loading HealthGuard investigator data:',
          error
        );

      }

    }


    loadData();

  }, [isAuthenticated, userRole]);


  // =========================================================
  // CLAIM SELECTION
  // =========================================================

  const handleSelectClaim = (claim) => {

    setSelectedClaim(claim);
    setActiveTab('claims');

  };


  // =========================================================
  // PROVIDER SELECTION
  // =========================================================

  const handleSelectProvider = (prov) => {

    setSelectedProvider(prov);
    setActiveTab('provider-details');

  };


  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  /*
    When nobody is logged in, show Login.jsx.
  */

  if (!isAuthenticated) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }


  // =========================================================
  // ADMIN APPLICATION
  // =========================================================

  /*
    When Admin is selected:

    Login
      ↓
    App.jsx
      ↓
    AdminApp.jsx

    The Investigator application below will NOT render.
  */

  if (userRole === 'admin') {

    return (

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

              <p className="text-sm font-semibold text-slate-700">
                Loading Admin Console...
              </p>

            </div>

          </div>
        }
      >

        <AdminApp
          onLogout={handleLogout}
        />

      </Suspense>

    );

  }


  // =========================================================
  // INVESTIGATOR PAGE TITLES
  // =========================================================

  const titleMap = {

    dashboard: {
      title: 'Dashboard',
      subtitle:
        'Overview of current signals and model performance'
    },


    alerts: {
      title: 'Alerts Queue',
      subtitle:
        'Prioritized investigation queue generated by Model A'
    },


    claims: {
      title: 'Claims & Investigation Console',
      subtitle:
        'Master-detail claims analysis and risk investigation'
    },


    providers: {
      title: 'Provider Intelligence',
      subtitle:
        'Behavioral analysis across provider network'
    },


    'provider-details': {
      title: 'Provider Intelligence Profile',
      subtitle:
        'Detailed billing and behavioral anomaly analysis'
    },


    reports: {
      title: 'Reports Archive',
      subtitle:
        'View and export compliance and risk reports'
    },


    'model-performance': {
      title: 'Model Performance',
      subtitle:
        'Exact Model A validation metrics and model comparison'
    },

  };


  const currentTitle =
    titleMap[activeTab] ||
    titleMap.dashboard;


  // =========================================================
  // INVESTIGATOR APPLICATION
  // =========================================================

  /*
    This is your existing Investigator application.

    It will be shown for:

      userRole === "investigator"
  */

  return (

    <div className="flex min-h-screen bg-slate-100">


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar

        activeTab={activeTab}

        setActiveTab={setActiveTab}

        onLogout={handleLogout}

        userRole={userRole}

      />


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0">


        {/* ===================================================
            TOPBAR
        ==================================================== */}

        <Topbar

          title={currentTitle.title}

          subtitle={currentTitle.subtitle}

          onOpenAiModal={() =>
            setIsAiModalOpen(true)
          }

          globalSearch={globalSearch}

          setGlobalSearch={setGlobalSearch}

          userRole={userRole}

        />


        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="flex-1 p-6 overflow-y-auto">


          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activeTab === 'dashboard' && (

            <Dashboard

              claims={claims}

              providers={providers}

              onSelectClaim={handleSelectClaim}

              onOpenAiModal={() =>
                setIsAiModalOpen(true)
              }

              setActiveTab={setActiveTab}

              userRole={userRole}

            />

          )}


          {/* =================================================
              ALERTS
          ================================================= */}

          {activeTab === 'alerts' && (

            <Alerts

              alerts={alerts}

              onSelectClaim={handleSelectClaim}

            />

          )}


          {/* =================================================
              CLAIMS
          ================================================= */}

          {activeTab === 'claims' && (

            <ClaimsConsole

              claims={claims}

              selectedClaim={selectedClaim}

              onSelectClaim={setSelectedClaim}

              onOpenAiModal={() =>
                setIsAiModalOpen(true)
              }

            />

          )}


          {/* =================================================
              PROVIDERS
          ================================================= */}

          {activeTab === 'providers' && (

            <ProviderIntelligence

              providers={providers}

              onSelectProvider={handleSelectProvider}

            />

          )}


          {/* =================================================
              PROVIDER DETAILS
          ================================================= */}

          {activeTab === 'provider-details' && (

            <ProviderDetails

              provider={selectedProvider}

              onBack={() =>
                setActiveTab('providers')
              }

              onSelectClaim={handleSelectClaim}

            />

          )}


          {/* =================================================
              REPORTS
          ================================================= */}

          {activeTab === 'reports' && (

            <Reports

              reports={reports}

              onReportCreated={(newRep) =>
                setReports([
                  newRep,
                  ...reports
                ])
              }

            />

          )}


          {/* =================================================
              MODEL PERFORMANCE
          ================================================= */}

          {activeTab === 'model-performance' && (

            <ModelPerformance />

          )}

        </main>

      </div>


      {/* =====================================================
          ASK HEALTHGUARD AI
      ====================================================== */}

      <AskHealthGuardModal

        isOpen={isAiModalOpen}

        onClose={() =>
          setIsAiModalOpen(false)
        }

        defaultProviderId={
          selectedClaim
            ? selectedClaim.provider_id
            : 'PRV51003'
        }

        defaultClaimId={
          selectedClaim
            ? selectedClaim.claim_id
            : 'CLM-904812'
        }

      />

    </div>

  );

}