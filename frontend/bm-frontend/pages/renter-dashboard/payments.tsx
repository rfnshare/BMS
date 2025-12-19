import Layout from '../../components/layouts/Layout';
import RenterPaymentManager from '../../components/features/Renter/RenterPaymentManager';

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

export default function PaymentsPage() {
  return (
    // 🔥 STEP 2: Pass 'renterMenuItems' to satisfy the Sidebar's nested mapping logic
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Payment History</h2>
            <p className="text-muted small mb-0">Review your past transaction references and receipts.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small">
              <i className="bi bi-download me-2 text-primary"></i>Export Ledger
            </button>
          </div>
        </div>

        {/* LOGIC COMPONENT */}
        {/* RenterPaymentManager handles the API logic to fetch historical
            payments specific to the authenticated renter's token. */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
             <RenterPaymentManager />
        </div>

        {/* SECURITY NOTE */}
        <div className="mt-4 p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center gap-3 shadow-sm">
          <i className="bi bi-patch-check-fill text-success fs-5"></i>
          <span className="small text-dark fw-medium">
            All mobile wallet and bank transactions are verified against the central clearinghouse. Your financial data is encrypted.
          </span>
        </div>

      </div>
    </Layout>
  );
}