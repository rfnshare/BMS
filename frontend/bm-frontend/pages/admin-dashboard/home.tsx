import Layout from '../../components/layouts/Layout';
import AdminDashboard from '../../components/features/Admin/AdminDashboard';
import { useRouter } from 'next/router';

// 🔥 STEP 1: Define the Grouped Menu Items
// This structure now matches the interfaces we built in Layout.tsx and Sidebar.tsx
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

export default function Page() {
  const router = useRouter();

  return (
    // 🔥 STEP 2: Pass the new 'adminMenuItems' instead of the old flat list
    <Layout menuItems={adminMenuItems}>
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