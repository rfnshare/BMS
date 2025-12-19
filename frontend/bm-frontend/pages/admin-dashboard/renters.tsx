import Layout from "../../components/layouts/Layout";
import RenterManager from "../../components/features/Renters/RenterManager";

// 🔥 STEP 1: Apply the Grouped Menu Structure (Consistency for Sidebar logic)
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

export default function RentersPage() {
  return (
    // 🔥 STEP 2: Pass the new 'adminMenuItems' instead of the flat list
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* 1. PAGE HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Renter Directory</h2>
            <p className="text-muted small mb-0">
              Manage profiles, legal documents, and contact information for all residents.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-white border rounded-pill px-3 shadow-sm fw-bold small">
              <i className="bi bi-download me-2"></i>Export List
            </button>
          </div>
        </div>

        {/* 2. SUMMARY METRICS (Updated for modern look) */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-primary h-100 bg-white">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                  <i className="bi bi-people fs-4"></i>
                </div>
                <div>
                  <div className="text-muted x-small fw-bold text-uppercase">Total Residents</div>
                  <div className="fs-4 fw-bold text-dark">Directory List</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-success h-100 bg-white">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3">
                  <i className="bi bi-patch-check fs-4"></i>
                </div>
                <div>
                  <div className="text-muted x-small fw-bold text-uppercase">Verified</div>
                  <div className="fs-4 fw-bold text-dark">NID Verified</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-warning h-100 bg-white">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3">
                  <i className="bi bi-file-earmark-person fs-4"></i>
                </div>
                <div>
                  <div className="text-muted x-small fw-bold text-uppercase">Legal</div>
                  <div className="fs-4 fw-bold text-dark">Docs Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN TABLE SECTION */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-lines-fill text-primary fs-5"></i>
              <h5 className="fw-bold mb-0">Identity Management</h5>
            </div>
          </div>
          <div className="card-body p-0">
            {/* SQA Note: RenterManager handles the API fetching from
                your Django /api/renters/ endpoint and displays the
                searchable table.
            */}
            <RenterManager />
          </div>
        </div>

      </div>
    </Layout>
  );
}