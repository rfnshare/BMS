import { useRouter } from "next/router";
import Layout from "../../../components/layouts/Layout";
import RenterProfileManager from "../../../components/features/Renters/RenterProfileManager";
import {ADMIN_MENU_ITEMS} from "../../../logic/utils/menuConstants";


export default function RenterDetailedView() {
  const router = useRouter();
  const { id } = router.query; // This captures the ID from the URL

  // Defensive SQA Check: Wait until router is ready to avoid "undefined" ID errors
  if (!router.isReady) {
    return (
      <Layout menuItems={ADMIN_MENU_ITEMS}>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* BREADCRUMB NAVIGATION */}
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 bg-transparent p-0">
              <li className="breadcrumb-item">
                <button
                  onClick={() => router.push("/admin-dashboard/home")}
                  className="btn btn-link p-0 text-decoration-none text-muted small"
                >
                  Admin
                </button>
              </li>
              <li className="breadcrumb-item">
                <button
                  onClick={() => router.push("/admin-dashboard/renters")}
                  className="btn btn-link p-0 text-decoration-none text-muted small"
                >
                  Renters
                </button>
              </li>
              <li className="breadcrumb-item active small fw-bold text-primary" aria-current="page">
                Renter Dossier #{id}
              </li>
            </ol>
          </nav>

          <button
            onClick={() => router.push('/admin-dashboard/renters')}
            className="btn btn-white border btn-sm rounded-pill px-3 d-flex align-items-center gap-2 shadow-sm"
          >
            <i className="bi bi-arrow-left"></i> Back to Directory
          </button>
        </div>

        {/* HEADER SECTION */}

        {/* PROFILE MANAGER CONTENT */}
        {/* SQA Note: RenterProfileManager should use the 'id' from props or URL
            to fetch the specific data from /api/renters/{id}/ */}
        <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
          <RenterProfileManager />
        </div>

        {/* QUICK ACTIONS FOOTER */}
        <div className="mt-4 card border-0 shadow-sm rounded-4 bg-dark text-white p-3">
          <div className="card-body d-flex flex-wrap justify-content-center gap-3">
            <button className="btn btn-primary rounded-pill px-4 fw-bold small">
               <i className="bi bi-pencil-square me-2"></i>Edit Resident
            </button>
            <button className="btn btn-outline-light rounded-pill px-4 fw-bold small">
               <i className="bi bi-printer me-2"></i>Print Dossier
            </button>
            <button className="btn btn-danger rounded-pill px-4 fw-bold small">
               <i className="bi bi-trash me-2"></i>Flag Account
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}