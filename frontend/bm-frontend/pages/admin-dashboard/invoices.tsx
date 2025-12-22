import Layout from '../../components/layouts/Layout';
import InvoiceManager from "../../components/features/Invoices/InvoiceManager";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";



export default function InvoicesPage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Invoice Management</h2>
            <p className="text-muted small mb-0">Track payments, rent cycles, and generated receipts.</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <InvoiceManager />
        </div>

      </div>
    </Layout>
  );
}