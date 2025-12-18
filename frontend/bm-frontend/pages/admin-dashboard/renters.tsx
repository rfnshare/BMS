import Layout from "../../components/layouts/Layout";
import RenterManager from "../../components/features/Renters/RenterManager";

const menuItems = [
  { name: "Home", path: "/admin-dashboard/home", icon: "bi-house" },
  { name: "Units", path: "/admin-dashboard/units", icon: "bi-building" },
  { name: "Renters", path: "/admin-dashboard/renters", icon: "bi-people" },
  { name: "Leases", path: "/admin-dashboard/leases", icon: "bi-file-text" },
  { name: "Invoices", path: "/admin-dashboard/invoices", icon: "bi-receipt" },
  { name: "Notifications", path: "/admin-dashboard/notifications", icon: "bi-bell" },
  { name: "Reports", path: "/admin-dashboard/reports", icon: "bi-bar-chart" },
  { name: "Profile", path: "/admin-dashboard/profile", icon: "bi-person" },
];

export default function RentersPage() {
  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">

        {/* 1. PAGE HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Renter Directory</h2>
            <p className="text-muted mb-0">
              Manage profiles, documents, and contact information for all residents.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light rounded-pill px-3 shadow-sm border">
              <i className="bi bi-download me-2"></i>Export List
            </button>
          </div>
        </div>

        {/* 2. MINI SUMMARY CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-primary text-white">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <div>
                  <div className="small opacity-75">Total Renters</div>
                  <div className="fs-5 fw-bold">Active Records</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-2">
                  <i className="bi bi-check-circle-fill fs-4"></i>
                </div>
                <div>
                  <div className="small text-muted">Verified</div>
                  <div className="fs-5 fw-bold text-dark">NID Scanned</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2">
                  <i className="bi bi-clock-history fs-4"></i>
                </div>
                <div>
                  <div className="small text-muted">Pending</div>
                  <div className="fs-5 fw-bold text-dark">Profile Updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT CONTAINER */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 pt-4 px-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-filter-right text-primary fs-5"></i>
              <h5 className="fw-bold mb-0">Resident Management</h5>
            </div>
          </div>
          <div className="card-body p-4">
            {/* The core manager logic stays here */}
            <RenterManager />
          </div>
        </div>

        {/* 4. FOOTER INFO */}
        <div className="mt-4 text-center">
          <p className="text-muted small">
            <i className="bi bi-shield-lock me-1"></i>
            All renter personal data is encrypted and stored securely.
          </p>
        </div>

      </div>
    </Layout>
  );
}