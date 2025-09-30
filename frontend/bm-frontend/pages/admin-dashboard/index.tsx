// pages/admin-dashboard/index.tsx
import Layout from "../components/Layout";

export default function AdminDashboard() {
  const menuItems = [
    { name: "Home", path: "/admin-dashboard/home", icon: "bi-house" },
    { name: "Units", path: "/admin-dashboard/units", icon: "bi-building" },
    { name: "Renters", path: "/admin-dashboard/renters", icon: "bi-people" },
    { name: "Leases", path: "/admin-dashboard/leases", icon: "bi-file-text" },
    { name: "Invoices", path: "/admin-dashboard/invoices", icon: "bi-receipt" },
    { name: "Notifications", path: "/admin-dashboard/notifications", icon: "bi-bell" },
    { name: "Reports", path: "/admin-dashboard/reports", icon: "bi-bar-chart-line" },
    { name: "Profile", path: "/admin-dashboard/profile", icon: "bi-person" },
  ];

  return (
    <Layout menuItems={menuItems} userName="SuperAdmin">
      <h1>Welcome to Admin Dashboard</h1>
      <p>This is your home page content.</p>
    </Layout>
  );
}
