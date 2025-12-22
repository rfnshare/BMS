import Layout from '../../components/layouts/Layout';
import AdminDashboard from '../../components/features/Admin/AdminDashboard';
import { useRouter } from 'next/router';
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";


export default function Page() {
  const router = useRouter();

  return (
    // 🔥 STEP 2: Pass the new 'adminMenuItems' instead of the old flat list
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1 text-dark">System Command Center</h2>
            <p className="text-muted small mb-0">Real-time data synchronization with your property records.</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small transition-all"
              onClick={() => window.location.reload()}
            >
                <i className="bi bi-arrow-clockwise me-2"></i>Refresh
            </button>
            <button
              className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold small transition-all"
              onClick={() => router.push('/admin-dashboard/reports')}
            >
                <i className="bi bi-file-earmark-bar-graph me-2"></i>Analytics
            </button>
          </div>
        </div>

        {/* FEATURE COMPONENT */}
        {/* This component (AdminDashboard) handles the data fetching for Renters, Leases, and Invoices */}
        <AdminDashboard />

      </div>
    </Layout>
  );
}