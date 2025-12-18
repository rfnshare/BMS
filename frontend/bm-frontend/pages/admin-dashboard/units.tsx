import { useState } from 'react';
import Layout from '../../components/layouts/Layout';
import FloorManager from '../../components/features/Units/FloorManager';
import UnitManager from '../../components/features/Units/UnitManager';

const menuItems = [
  { name: 'Home', path: '/admin-dashboard/home', icon: 'bi-house' },
  { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
  { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
  { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-text' },
  { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
  { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart' },
  { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person' },
];

export default function UnitsPage() {
  // 1. State to toggle between Floor and Unit management
  const [activeTab, setActiveTab] = useState<'units' | 'floors'>('units');

  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Property Infrastructure</h2>
            <p className="text-muted mb-0">Manage your building floors and individual rental units.</p>
          </div>
          
          {/* 2. TAB CONTROLS (Pill style) */}
          <div className="bg-white p-1 rounded-pill shadow-sm d-inline-flex border">
            <button 
              onClick={() => setActiveTab('units')}
              className={`btn rounded-pill px-4 ${activeTab === 'units' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
            >
              <i className="bi bi-door-open me-2"></i>Units
            </button>
            <button 
              onClick={() => setActiveTab('floors')}
              className={`btn rounded-pill px-4 ${activeTab === 'floors' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
            >
              <i className="bi bi-layers me-2"></i>Floors
            </button>
          </div>
        </div>

        {/* 3. CONTENT AREA */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-0">
                
                {/* Conditional Rendering based on active tab */}
                {activeTab === 'units' ? (
                  <div className="p-4 animate__animated animate__fadeIn">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                        <i className="bi bi-door-open-fill fs-5"></i>
                      </div>
                      <h5 className="fw-bold mb-0">Unit Inventory</h5>
                    </div>
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
                    <FloorManager />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* 4. QUICK HELP FOOTER */}
        <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-4 d-flex align-items-center gap-3 border border-primary border-opacity-25">
          <i className="bi bi-info-circle-fill text-primary fs-5"></i>
          <p className="mb-0 small text-primary-emphasis">
            <strong>Pro Tip:</strong> Create your <strong>Floors</strong> first before adding <strong>Units</strong> to ensure proper organization of your building layout.
          </p>
        </div>

      </div>
    </Layout>
  );
}