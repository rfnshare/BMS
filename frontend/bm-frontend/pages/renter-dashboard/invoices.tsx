import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';

// 🔥 STEP 1: Define the Grouped Menu for the Renter Persona
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

export default function InvoicesPage() {
  return (
    // 🔥 STEP 2: Pass the grouped 'renterMenuItems' to satisfy the updated Sidebar logic
    <Layout menuItems={renterMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Invoices</h2>
            <p className="text-muted small mb-0">Track your billing history and download official receipts.</p>
          </div>
          <div className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill">
            <i className="bi bi-info-circle me-2"></i>Live Data Sync
          </div>
        </div>

        {/* LOGIC COMPONENT */}
        {/* RenterInvoiceManager handles the API call to /api/invoices/
            and renders the table of receipts for the logged-in user. */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <RenterInvoiceManager />
        </div>

        {/* HELP INFO */}
        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-center gap-3 shadow-sm">
          <i className="bi bi-shield-lock text-success fs-5"></i>
          <span className="small text-muted">
            All invoices are digitally signed by <strong>BM PRO Systems</strong>. For any disputes regarding the amounts, please contact building management.
          </span>
        </div>

      </div>
    </Layout>
  );
}