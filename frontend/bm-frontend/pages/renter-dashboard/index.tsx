import Layout from '../../components/layouts/Layout';
import RenterDashboard from '../../components/features/Renter/RenterDashboard';

// 🔥 STEP 1: Define Grouped Menu Items for Renters
export const renterMenuItems = [
  {
    group: "Home",
    items: [
      {
        name: 'Home',
        path: '/renter-dashboard',
        icon: 'bi-house-heart'
      },
      {
        name: 'My Unit',
        path: '/renter-dashboard/unit',
        icon: 'bi-building'
      },
    ]
  },
  {
    group: "Finance",
    items: [
      {
        name: 'Invoices',
        path: '/renter-dashboard/invoices',
        icon: 'bi-receipt'
      },
      {
        // 🔥 Added the Expenses link here
        name: 'Other Expenses',
        path: '/renter-dashboard/expenses',
        icon: 'bi-cart-check'
      },
      {
        name: 'Payments',
        path: '/renter-dashboard/payments',
        icon: 'bi-wallet2'
      },
    ]
  },
  {
    group: "Support",
    items: [
      {
        name: 'Complaints',
        path: '/renter-dashboard/complaints',
        icon: 'bi-exclamation-triangle'
      },
      {
        name: 'Notifications',
        path: '/renter-dashboard/notifications',
        icon: 'bi-bell'
      },
    ]
  },
  {
    group: "Settings",
    items: [
      {
        name: 'My Profile',
        path: '/renter-dashboard/profile',
        icon: 'bi-person-gear'
      },
    ]
  }
];

export default function Page() {
  return (
    // 🔥 STEP 2: Pass the grouped 'renterMenuItems' to the Layout
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* WELCOME HEADER */}
        <div className="mb-4 ps-1">
          <h2 className="fw-bold text-dark mb-1">Renter Portal</h2>
          <p className="text-muted small">Welcome back! Manage your stay and view your latest bills.</p>
        </div>

        {/* FEATURE COMPONENT */}
        {/* This component pulls real data like 'Total Outstanding Dues' and 'Unit Info' */}
        <RenterDashboard />

      </div>
    </Layout>
  );
}