import Layout from '../../components/layouts/Layout';
import AdminDashboard from '../../components/features/Admin/AdminDashboard';
import { useRouter } from 'next/router';

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

export default function Page() {
  const router = useRouter();

  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Management Dashboard</h2>
            <p className="text-muted small mb-0">Live property analytics and financial oversight.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small" onClick={() => window.location.reload()}>
                <i className="bi bi-arrow-clockwise me-2"></i>Refresh Data
            </button>
            <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold small" onClick={() => router.push('/admin-dashboard/reports')}>
                <i className="bi bi-file-earmark-bar-graph me-2"></i>Reports
            </button>
          </div>
        </div>

        {/* FEATURE COMPONENT */}
        <AdminDashboard />
      </div>
    </Layout>
  );
}