import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';

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

export default function ReportsPage() {
  const router = useRouter();

  return (
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Intelligence & Analytics</h2>
            <p className="text-muted small mb-0">Monthly financial performance and occupancy trends.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary rounded-pill px-4 shadow-sm fw-bold small">
              <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
            </button>
            <button className="btn btn-success rounded-pill px-4 shadow-sm fw-bold small">
              <i className="bi bi-file-earmark-excel me-2"></i>Export Excel
            </button>
          </div>
        </div>

        {/* 1. ANALYTICS CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
              <div className="text-muted x-small fw-bold text-uppercase">Collection Rate</div>
              <div className="h3 fw-bold mb-0">94.2%</div>
              <div className="text-success x-small fw-bold"><i className="bi bi-arrow-up"></i> 2.1% from last month</div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
              <div className="text-muted x-small fw-bold text-uppercase">Total Collected</div>
              <div className="h3 fw-bold mb-0">৳4,52,000</div>
              <div className="text-muted x-small">Current Month (Dec)</div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
              <div className="text-muted x-small fw-bold text-uppercase">Pending Arrears</div>
              <div className="h3 fw-bold mb-0">৳28,500</div>
              <div className="text-danger x-small fw-bold">12 Invoices Overdue</div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-info">
              <div className="text-muted x-small fw-bold text-uppercase">Occupancy</div>
              <div className="h3 fw-bold mb-0">118/120</div>
              <div className="text-muted x-small">Units occupied</div>
            </div>
          </div>
        </div>

        {/* 2. MAIN REPORT TABLE */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Monthly Revenue Summary</h5>
            <div className="d-flex gap-2">
              <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3">
                <option>Year 2025</option>
                <option>Year 2024</option>
              </select>
            </div>
          </div>
          <div className="card-body p-0 mt-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr className="text-muted x-small fw-bold text-uppercase">
                    <th className="ps-4">Month</th>
                    <th>Expected</th>
                    <th>Collected</th>
                    <th>Variance</th>
                    <th className="pe-4 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: "December", e: "4,80,500", c: "4,52,000", v: "-28,500", s: "In Progress" },
                    { m: "November", e: "4,80,500", c: "4,80,500", v: "0", s: "Reconciled" },
                    { m: "October", e: "4,75,000", c: "4,75,000", v: "0", s: "Reconciled" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="ps-4 fw-bold">{row.m} 2025</td>
                      <td>৳{row.e}</td>
                      <td className="text-success fw-bold">৳{row.c}</td>
                      <td className={row.v.startsWith('-') ? 'text-danger' : 'text-muted'}>৳{row.v}</td>
                      <td className="pe-4 text-end">
                        <span className={`badge rounded-pill px-3 py-2 ${row.s === 'Reconciled' ? 'bg-success-subtle text-success border border-success' : 'bg-primary-subtle text-primary border border-primary'}`}>
                          {row.s.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}