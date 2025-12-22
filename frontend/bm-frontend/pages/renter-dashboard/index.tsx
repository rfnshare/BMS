import Layout from '../../components/layouts/Layout';
import RenterDashboard from '../../components/features/Renter/RenterDashboard';
import { withAuth } from '../../logic/utils/withAuth'; // ✅ Import our Guard

// 1. Define Grouped Menu Items for Renters
// (Keeping this exported is good if the Sidebar needs to import it directly)
export const renterMenuItems = [
  {
    group: "Home",
    items: [
      { name: 'Home', path: '/renter-dashboard', icon: 'bi-house-heart' },
      { name: 'My Unit', path: '/renter-dashboard/unit', icon: 'bi-building' },
    ]
  },
  {
    group: "Finance",
    items: [
      { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Other Expenses', path: '/renter-dashboard/expenses', icon: 'bi-cart-check' },
      { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
    ]
  },
  {
    group: "Support",
    items: [
      { name: 'Complaints', path: '/renter-dashboard/complaints', icon: 'bi-exclamation-triangle' },
      { name: 'Notifications', path: '/renter-dashboard/notifications', icon: 'bi-bell' },
    ]
  },
  {
    group: "Settings",
    items: [
      { name: 'My Profile', path: '/renter-dashboard/profile', icon: 'bi-person-gear' },
    ]
  }
];

function RenterDashboardPage() {
  return (
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* WELCOME HEADER */}
        <div className="mb-4 ps-1">
          <h2 className="fw-bold text-dark mb-1">Renter Portal</h2>
          <p className="text-muted small">Welcome back! Manage your stay and view your latest bills.</p>
        </div>

        {/* FEATURE COMPONENT */}
        {/* Clean Code Tip: Ensure RenterDashboard uses a custom hook for its data fetching! */}
        <RenterDashboard />

      </div>
    </Layout>
  );
}

// ✅ PROTECTED: Only allow users with the 'renter' role
export default withAuth(RenterDashboardPage, "renter");