// pages/renter-dashboard/index.tsx
import Layout from "../components/Layout";

export default function RenterDashboard() {
  const menuItems = [
    { name: "My Units", path: "/renter-dashboard/my-units", icon: "bi-house" },
    { name: "Invoices", path: "/renter-dashboard/invoices", icon: "bi-receipt" },
    { name: "Payments", path: "/renter-dashboard/payments", icon: "bi-cash-stack" },
    { name: "Profile", path: "/renter-dashboard/profile", icon: "bi-person" },
  ];

  return (
    <Layout menuItems={menuItems} userName="RenterUser">
      <h1>Welcome to Renter Dashboard</h1>
      <p>This is your home page content.</p>
    </Layout>
  );
}
