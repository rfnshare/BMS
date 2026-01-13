import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';

export default function InvoicesPage() {
  return (
    <Layout>
      <div className="container-fluid px-2 py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-4 px-1">
          <div>
            <h2 className="fw-bold text-dark mb-1 h3">My Invoices</h2>
            <p className="text-muted small mb-0 d-none d-md-block">Track your billing history and download official receipts.</p>
          </div>
          <div className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill small">
            <i className="bi bi-info-circle me-1"></i>Live Sync
          </div>
        </div>

        {/* LOGIC COMPONENT */}
        <RenterInvoiceManager />

        {/* HELP INFO */}
        <div className="mt-4 p-3 rounded-4 bg-white border d-flex align-items-start gap-3 shadow-sm mx-1">
          <i className="bi bi-shield-lock text-success fs-5 flex-shrink-0"></i>
          <span className="small text-muted">
            All invoices are digitally signed by <strong>BM PRO Systems</strong>. For disputes, contact management.
          </span>
        </div>

      </div>
    </Layout>
  );
}