import Layout from '../../components/layouts/Layout';

const adminMenuItems = [
  {
    group: "Operations",
    items: [
      { name: 'Dashboard', path: '/admin-dashboard/home', icon: 'bi-speedometer2' },
      { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
      { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-earmark-text' },
      { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
    ]
  },
  {
    group: "Financials",
    items: [
      { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Payments', path: '/admin-dashboard/payments', icon: 'bi-wallet2' },
      { name: 'Expenses', path: '/admin-dashboard/expenses', icon: 'bi-cart-dash' },
    ]
  },
  {
    group: "Support & Intelligence",
    items: [
      { name: 'Complaints', path: '/admin-dashboard/complaints', icon: 'bi-exclamation-triangle' },
      { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
      { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart-line' },
    ]
  },
  {
    group: "System",
    items: [
      { name: 'Permissions', path: '/admin-dashboard/permissions', icon: 'bi-shield-lock' },
      { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person-gear' },
    ]
  },
];

export default function ExpensesPage() {
  return (
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <h2 className="fw-bold mb-1">Building Expenses</h2>
        <p className="text-muted small">Log maintenance costs, utility bills, and procurement.</p>
        <div className="card border-0 shadow-sm rounded-4 p-5 mt-4 text-center bg-white">
          <i className="bi bi-cart-dash display-1 text-danger mb-3 opacity-25"></i>
          <h4>Expense Tracker Placeholder</h4>
          <p className="text-muted">This module will connect to <code>/api/expenses/</code>.</p>
        </div>
      </div>
    </Layout>
  );
}