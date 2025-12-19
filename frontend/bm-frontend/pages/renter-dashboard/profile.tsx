import Layout from '../../components/layouts/Layout';
import RenterProfileManager from '../../components/features/Renter/RenterProfileManager';

// 🔥 STEP 1: Define the Grouped Menu for the Renter
// This alignment is critical to prevent the 'href' undefined error in the Sidebar
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
      // { name: 'Complaints', path: '/renter-dashboard/complaints', icon: 'bi-chat-left-dots' },
    ]
  },
  {
    group: "Settings",
    items: [
      { name: 'My Profile', path: '/renter-dashboard/profile', icon: 'bi-person-bounding-box' },
    ]
  },
];

export default function RenterProfilePage() {
  return (
    // 🔥 STEP 2: Pass 'renterMenuItems' to satisfy the Sidebar's nested mapping logic
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">My Profile</h2>
          <p className="text-muted small">Manage your personal information and notification preferences.</p>
        </div>

        {/* REAL DATA LOGIC COMPONENT */}
        {/* RenterProfileManager handles the API logic to fetch the Renter
            model data linked to the current User session. */}
        <RenterProfileManager />

        {/* DATA PRIVACY NOTE */}
        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-center gap-3 shadow-sm">
          <div className="bg-success bg-opacity-10 p-2 rounded-circle">
            <i className="bi bi-shield-lock-fill text-success"></i>
          </div>
          <span className="small text-muted">
            <strong>Privacy Check:</strong> Your NID and contact details are encrypted. Only authorized building administrators can access your sensitive documents.
          </span>
        </div>

      </div>
    </Layout>
  );
}