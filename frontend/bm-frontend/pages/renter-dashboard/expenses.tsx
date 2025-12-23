import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';
import RenterComplaintManager from "../../components/features/Renter/RenterComplaintManager";
import RenterExpenseManager from "../../components/features/Renter/RenterExpenseManager";
import {RENTER_MENU_ITEMS} from "../../utils/menuConstants";


export default function RenterExpensesPage() {
  return (
    <Layout menuItems={RENTER_MENU_ITEMS}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="mb-4 ps-2">
          <h2 className="fw-bold mb-1 text-dark">Additional Expenses</h2>
          <p className="text-muted small">
            View one-time charges, maintenance costs, and other renter-related expenses.
          </p>
        </div>

        {/* The component that handles the API data */}
        <RenterExpenseManager />
      </div>
    </Layout>
  );
}