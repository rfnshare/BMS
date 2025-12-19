import Layout from '../../components/layouts/Layout';
import RenterDashboard from '../../components/features/Renter/RenterDashboard';

// 🔥 STEP 1: Define Grouped Menu Items for Renters
const renterMenuItems = [
  {
    group: "My Residence",
    items: [
      { name: 'Home', path: '/renter-dashboard', icon: 'bi-house-heart' },
      { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
    ]
  },
  {
    group: "Bills & History",
    items: [
      { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Payment History', path: '/renter-dashboard/payments', icon: 'bi-credit-card-2-back' },
    ]
  },
  {
    group: "Communication",
    items: [
      { name: 'Notifications', path: '/renter-dashboard/notifications', icon: 'bi-bell' },
      // { name: 'Complaints', path: '/renter-dashboard/complaints', icon: 'bi-chat-left-dots' }, // Future Add
    ]
  },
  {
    group: "Settings",
    items: [
      { name: 'My Profile', path: '/renter-dashboard/profile', icon: 'bi-person-bounding-box' },
    ]
  },
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