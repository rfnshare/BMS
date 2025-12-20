import { useState } from 'react';
import Layout from '../../components/layouts/Layout';
import FloorManager from '../../components/features/Units/FloorManager';
import UnitManager from '../../components/features/Units/UnitManager';

// 🔥 STEP 1: Consistent Grouped Menu Structure
const adminMenuItems = [
  {
    group: "Operations",
    items: [
      { name: 'Dashboard', path: '/admin-dashboard/home', icon: 'bi-speedometer2' },
      { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
      { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-earmark-text' },
      { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
    ]
  },
  {
    group: "Financials",
    items: [
      { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Payments', path: '/admin-dashboard/payments', icon: 'bi-wallet2' },
      { name: 'Expenses', path: '/admin-dashboard/expenses', icon: 'bi-cart-dash' },
    ]
  },
  {
    group: "Support & Intelligence",
    items: [
      { name: 'Complaints', path: '/admin-dashboard/complaints', icon: 'bi-exclamation-triangle' },
      { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
      { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart-line' },
    ]
  },
  {
    group: "System",
    items: [
      { name: 'Permissions', path: '/admin-dashboard/permissions', icon: 'bi-shield-lock' },
      { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person-gear' },
    ]
  },
];

export default function UnitsPage() {
  // Tab state: 'units' or 'floors'
  const [activeTab, setActiveTab] = useState<'units' | 'floors'>('units');

  return (
    // 🔥 STEP 2: Use the Grouped structure to fix the Sidebar href error
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Property Infrastructure</h2>
            <p className="text-muted small mb-0">Manage building floors and individual rental units.</p>
          </div>

          {/* TAB CONTROLS (Pill style) */}
          <div className="bg-white p-1 rounded-pill shadow-sm d-inline-flex border">
            <button
              onClick={() => setActiveTab('units')}
              className={`btn rounded-pill px-4 fw-bold small ${activeTab === 'units' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
            >
              <i className="bi bi-door-open me-2"></i>Units
            </button>
            <button
              onClick={() => setActiveTab('floors')}
              className={`btn rounded-pill px-4 fw-bold small ${activeTab === 'floors' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
            >
              <i className="bi bi-layers me-2"></i>Floors
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-body p-0">

            {activeTab === 'units' ? (
              <div className="p-4 animate__animated animate__fadeIn">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                    <i className="bi bi-door-open-fill fs-5"></i>
                  </div>
                  <h5 className="fw-bold mb-0">Unit Inventory</h5>
                </div>
                {/* Renders components/features/Units/UnitManager.tsx */}
                <UnitManager />
              </div>
            ) : (
              <div className="p-4 animate__animated animate__fadeIn">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
                    <i className="bi bi-layers-fill fs-5"></i>
                  </div>
                  <h5 className="fw-bold mb-0">Floor Configuration</h5>
                </div>
                {/* Renders components/features/Units/FloorManager.tsx */}
                <FloorManager />
              </div>
            )}

          </div>
        </div>

        {/* QUICK HELP FOOTER */}
        <div className="mt-4 p-3 bg-white rounded-4 d-flex align-items-center gap-3 border shadow-sm">
          <i className="bi bi-info-circle-fill text-primary fs-5"></i>
          <p className="mb-0 small text-muted">
            <strong>Note:</strong> Always create <strong>Floors</strong> first. Units rely on Floor to establish the building hierarchy in the system.
          </p>
        </div>

      </div>
    </Layout>
  );
}