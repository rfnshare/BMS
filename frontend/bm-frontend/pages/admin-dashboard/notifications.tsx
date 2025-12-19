import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { useState } from 'react';

// 🔥 STEP 1: Use the Grouped Menu Structure (Consistency for Sidebar)
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

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'broadcast' | 'system'

  return (
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Communication Hub</h2>
            <p className="text-muted small mb-0">Manage tenant broadcasts and automated system alerts.</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">
            <i className="bi bi-megaphone me-2"></i>Send New Broadcast
          </button>
        </div>

        {/* NOTIFICATION CONTROLS */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="btn-group p-1 bg-light rounded-pill">
                {['all', 'broadcast', 'system'].map((type) => (
                  <button
                    key={type}
                    className={`btn btn-sm rounded-pill px-4 fw-bold text-uppercase ${filter === type ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
                    onClick={() => setFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <span className="small text-muted fw-medium me-2">
                Last Sync: Today, 10:45 AM
              </span>
            </div>
          </div>
        </div>

        {/* NOTIFICATION LIST (Placeholder Logic) */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="list-group list-group-flush">
            {/* Example Broadcast Item */}
            <div className="list-group-item p-4 border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <h6 className="fw-bold mb-0 text-primary">Water Tank Cleaning - Building A</h6>
                <span className="badge bg-light text-dark border rounded-pill px-3">2 Hours Ago</span>
              </div>
              <p className="text-muted small mb-2">Water supply will be suspended from 2:00 PM to 4:00 PM today for monthly maintenance.</p>
              <div className="d-flex gap-3 x-small fw-bold text-uppercase ls-1 text-muted">
                <span><i className="bi bi-people me-1"></i> Sent to 42 Renters</span>
                <span><i className="bi bi-whatsapp me-1"></i> SMS/WhatsApp Delivered</span>
              </div>
            </div>

            {/* Example System Alert Item */}
            <div className="list-group-item p-4 border-start border-4 border-warning">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <h6 className="fw-bold mb-0 text-warning">Overdue Invoice Detected</h6>
                <span className="badge bg-light text-dark border rounded-pill px-3">Yesterday</span>
              </div>
              <p className="text-muted small mb-0">System automatically sent a reminder to <strong>Abdullah Faroque (Unit A-102)</strong> for Invoice #INV-2025001.</p>
            </div>
          </div>

          <div className="card-footer bg-white border-0 text-center py-3">
             <button className="btn btn-link btn-sm text-decoration-none fw-bold">Load Historical Logs</button>
          </div>
        </div>

      </div>
    </Layout>
  );
}