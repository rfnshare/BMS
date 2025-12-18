import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';

const menuItems = [
  { name: 'Home', path: '/renter-dashboard', icon: 'bi-house' },
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function InvoicesPage() {
  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">

        {/* HEADER SECTION */}
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">My Invoices</h2>
          <p className="text-muted mb-0">Track your billing history and download official receipts.</p>
        </div>

        {/* LOGIC COMPONENT */}
        <RenterInvoiceManager />

        {/* HELP INFO */}
        <div className="mt-4 p-3 rounded-4 bg-light border d-flex align-items-center gap-3">
          <i className="bi bi-shield-lock text-muted fs-5"></i>
          <span className="small text-muted">
            All invoices are digitally signed. For any disputes, please use the <strong>Support</strong> section.
          </span>
        </div>

      </div>
    </Layout>
  );
}