import Layout from '../../components/layouts/Layout';
import RenterPaymentManager from '../../components/features/Renter/RenterPaymentManager';

export default function PaymentsPage() {
  return (
    <Layout>
      <div className="container-fluid px-2 py-2 animate__animated animate__fadeIn">

        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 px-1 gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1 h3">Payment History</h2>
            <p className="text-muted small mb-0">Review your past transaction references and receipts.</p>
          </div>
          <button className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small w-100 w-md-auto">
            <i className="bi bi-download me-2 text-primary"></i>Export Ledger
          </button>
        </div>

        {/* LOGIC COMPONENT */}
        <RenterPaymentManager />

        {/* SECURITY NOTE */}
        <div className="mt-4 p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-start gap-3 shadow-sm mx-1">
          <i className="bi bi-patch-check-fill text-success fs-5 flex-shrink-0"></i>
          <span className="small text-dark fw-medium">
            All mobile wallet and bank transactions are verified against the central clearinghouse. Your financial data is encrypted.
          </span>
        </div>

      </div>
    </Layout>
  );
}