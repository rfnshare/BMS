import { useRouter } from 'next/router';
import Layout from '../../components/layouts/Layout';
import AdminDashboard from '../../components/features/Admin/AdminDashboard';
import { ADMIN_MENU_ITEMS } from "../../logic/utils/menuConstants";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-3 py-md-4 animate__animated animate__fadeIn">

        {/* --- 1. THE COMMANDER HEADER CARD --- */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden border-start border-4 border-primary bg-white">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <nav aria-label="breadcrumb" className="mb-1">
                  <ol className="breadcrumb mb-1 bg-transparent p-0">
                    <li className="breadcrumb-item x-small fw-bold text-muted text-uppercase" style={{ letterSpacing: '1px' }}>System</li>
                    <li className="breadcrumb-item active x-small fw-bold text-primary text-uppercase" style={{ letterSpacing: '1px' }}>Command Center</li>
                  </ol>
                </nav>
                <h2 className="fw-bold mb-1 text-dark h3">Executive Dashboard</h2>
                <p className="text-muted small mb-0">Real-time synchronization with property assets and resident records.</p>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-white bg-white border border-light-subtle rounded-pill px-4 shadow-sm fw-bold small py-2" onClick={() => window.location.reload()}>
                  <i className="bi bi-arrow-clockwise me-2 text-primary"></i>Refresh
                </button>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold small py-2" onClick={() => router.push('/admin-dashboard/reports')}>
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. THE CONTENT ENGINE --- */}
        <AdminDashboard />

      </div>
    </Layout>
  );
}