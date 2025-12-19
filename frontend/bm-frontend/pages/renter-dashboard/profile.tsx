import Layout from '../../components/layouts/Layout';
import RenterProfileManager from '../../components/features/Renter/RenterProfileManager';

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

export default function RenterProfilePage() {
  return (
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">

        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Profile</h2>
            <p className="text-muted small m-0">Securely view and verify your residency identity data.</p>
          </div>
        </div>

        {/* REAL DATA LOGIC COMPONENT */}
        <RenterProfileManager />

        {/* DATA PRIVACY NOTE */}
        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-center gap-3 shadow-sm">
          <div className="bg-success bg-opacity-10 p-2 rounded-circle">
            <i className="bi bi-shield-lock-fill text-success"></i>
          </div>
          <span className="small text-muted">
            <strong>Security Notice:</strong> To update sensitive fields like your NID or Phone Number, please visit the building management office for identity verification.
          </span>
        </div>

      </div>
    </Layout>
  );
}