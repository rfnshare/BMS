import Layout from '../../components/layouts/Layout';
import RenterExpenseManager from "../../components/features/Renter/RenterExpenseManager";

export default function RenterExpensesPage() {
  return (
    <Layout>
      <div className="container-fluid px-2 py-4 animate__animated animate__fadeIn">
        {/* HEADER SECTION */}
        <div className="mb-4 ps-2">
          <h2 className="fw-bold mb-1 text-dark">Additional Expenses</h2>
          <p className="text-muted small">
            View one-time charges, maintenance costs, and other renter-related expenses.
          </p>
        </div>

        {/* The component that handles the API data and responsive UI */}
        <RenterExpenseManager />
      </div>
    </Layout>
  );
}