import Layout from '../../components/layouts/Layout';
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';
import RenterComplaintManager from "../../components/features/Renter/RenterComplaintManager";
import RenterExpenseManager from "../../components/features/Renter/RenterExpenseManager";

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

export default function RenterExpensesPage() {
  return (
    <Layout menuItems={renterMenuItems}>
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