import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './pages/AdminDashboard';

export default function AdminApp() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {activePage === 'dashboard' ? (
        <AdminDashboard />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-extrabold text-slate-900">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            This Admin section is ready to be connected.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}