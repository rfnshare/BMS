import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth';

// 🔥 STEP 1: Apply the Grouped Menu Structure (Crucial for Sidebar Consistency)
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

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const data = await getCurrentUser();
      setUser(data);
    };
    loadUser();
  }, []);

  return (
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1 text-dark">Admin Settings</h2>
          <p className="text-muted small">Manage your administrative identity and system preferences.</p>
        </div>

        <div className="row g-4">
          {/* LEFT: IDENTITY CARD */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 text-center p-4 bg-white">
              <div className="position-relative d-inline-block mx-auto mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center border border-primary border-opacity-25 shadow-sm" style={{ width: 120, height: 120 }}>
                  <i className="bi bi-person-badge text-primary display-4"></i>
                </div>
                <button className="btn btn-sm btn-dark rounded-circle position-absolute bottom-0 end-0 border-4 border-white">
                  <i className="bi bi-camera"></i>
                </button>
              </div>
              <h4 className="fw-bold mb-1">{user?.username || "Admin User"}</h4>
              <p className="text-muted small text-uppercase fw-bold ls-1 mb-3">System Superuser</p>
              <div className="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2">
                <i className="bi bi-patch-check-fill me-1"></i> Verified Account
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mt-4 overflow-hidden">
               <div className="list-group list-group-flush">
                  <button className="list-group-item list-group-item-action p-3 small border-0 d-flex align-items-center">
                    <i className="bi bi-shield-lock me-3 text-primary"></i> Change Password
                  </button>
                  <button className="list-group-item list-group-item-action p-3 small border-0 d-flex align-items-center text-danger">
                    <i className="bi bi-box-arrow-right me-3"></i> Log Out
                  </button>
               </div>
            </div>
          </div>

          {/* RIGHT: DETAILS & PERMISSIONS */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
              <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Identity Details</h5>
                <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">Update Profile</button>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Email Address</label>
                    <div className="p-3 bg-light rounded-3 fw-bold border-0">{user?.email || "admin@bms-pro.com"}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Account Role</label>
                    <div className="p-3 bg-light rounded-3 fw-bold border-0 text-capitalize">{user?.role || "Administrator"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM PERMISSIONS PREVIEW (SQA Focused) */}
            <div className="card border-0 shadow-sm rounded-4 bg-dark text-white">
              <div className="card-body p-4">
                <h6 className="text-warning fw-bold text-uppercase mb-4 small ls-1">System Access Level</h6>
                <div className="vstack gap-3">
                  {[
                    { label: "Can Manage Financials", val: true },
                    { label: "Can Terminate Leases", val: true },
                    { label: "Can Access System Logs", val: true },
                    { label: "Can Modify Users", val: false },
                  ].map((perm, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between">
                      <span className="small opacity-75">{perm.label}</span>
                      <i className={`bi bi-${perm.val ? 'check-circle-fill text-success' : 'x-circle text-secondary'}`}></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}