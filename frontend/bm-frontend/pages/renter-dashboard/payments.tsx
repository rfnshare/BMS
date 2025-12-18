import Layout from '../../components/layouts/Layout';
import RenterPaymentManager from '../../components/features/Renter/RenterPaymentManager';

const menuItems = [
  { name: 'Home', path: '/renter-dashboard', icon: 'bi-house' },
  { name: 'My Units', path: '/renter-dashboard/my-units', icon: 'bi-building' },
  { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
  { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
  { name: 'Profile', path: '/renter-dashboard/profile', icon: 'bi-person' },
];

export default function PaymentsPage() {
  return (
    <Layout menuItems={menuItems}>
      <div className="container-fluid py-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Payment History</h2>
            <p className="text-muted mb-0">Keep track of your transaction references and historical receipts.</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold bg-white">
            <i className="bi bi-download me-2"></i>Export Statement
          </button>
        </div>

        {/* COMPONENT */}
        <RenterPaymentManager />

        {/* SECURITY NOTE */}
        <div className="mt-4 p-3 rounded-4 bg-light border d-flex align-items-center gap-3">
          <i className="bi bi-patch-check-fill text-success fs-5"></i>
          <span className="small text-muted">
            All bank and mobile wallet payments are verified against transaction IDs provided by the clearinghouse.
          </span>
        </div>

      </div>
    </Layout>
  );
}