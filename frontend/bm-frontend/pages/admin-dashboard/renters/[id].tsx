import { useRouter } from "next/router";
import Layout from "../../../components/layouts/Layout";
import RenterProfileManager from "../../../components/features/Renters/RenterProfileManager";

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

export default function RenterProfilePage() {
  const router = useRouter();

  // wait until router is ready
  if (!router.isReady) {
    return (
      <Layout menuItems={menuItems}>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-grow text-primary" role="status"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">

        {/* BREADCRUMB & BACK NAVIGATION */}
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/admin-dashboard/home" className="text-decoration-none text-muted">Admin</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/admin-dashboard/renters" className="text-decoration-none text-muted">Renters</a>
              </li>
              <li className="breadcrumb-item active fw-bold text-primary" aria-current="page">
                Detailed Profile
              </li>
            </ol>
          </nav>

          <button
            onClick={() => router.push('/admin-dashboard/renters')}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
          >
            <i className="bi bi-arrow-left"></i> Back to List
          </button>
        </div>

        {/* PROFILE MANAGER CONTENT */}
        <div className="animate__animated animate__fadeIn">
          <RenterProfileManager />
        </div>

        {/* QUICK ACTIONS FOOTER */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 bg-light">
              <div className="card-body d-flex flex-wrap justify-content-center gap-3">
                <button className="btn btn-primary rounded-pill px-4">
                   <i className="bi bi-pencil-square me-2"></i>Edit Information
                </button>
                <button className="btn btn-outline-danger rounded-pill px-4">
                   <i className="bi bi-trash me-2"></i>Delete Profile
                </button>
                <button className="btn btn-dark rounded-pill px-4">
                   <i className="bi bi-printer me-2"></i>Print Dossier
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}