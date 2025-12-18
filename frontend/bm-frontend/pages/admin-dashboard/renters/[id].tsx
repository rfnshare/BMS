import { useRouter } from "next/router";
import Layout from "../../../components/layouts/Layout";
import RenterProfileManager from "../../../components/features/Renters/RenterProfileManager";


const menuItems = [
  { name: "Home", path: "/admin-dashboard/home", icon: "bi-house" },
  { name: "Units", path: "/admin-dashboard/units", icon: "bi-building" },
  { name: "Renters", path: "/admin-dashboard/renters", icon: "bi-people" },
  { name: "Leases", path: "/admin-dashboard/leases", icon: "bi-file-text" },
  { name: "Invoices", path: "/admin-dashboard/invoices", icon: "bi-receipt" },
  { name: "Notifications", path: "/admin-dashboard/notifications", icon: "bi-bell" },
  { name: "Reports", path: "/admin-dashboard/reports", icon: "bi-bar-chart" },
  { name: "Profile", path: "/admin-dashboard/profile", icon: "bi-person" },
];

export default function RenterProfilePage() {
  const router = useRouter();

  // wait until router is ready (prevents undefined id issues)
  if (!router.isReady) return null;

  return (
    <Layout menuItems={menuItems}>
      <RenterProfileManager />
    </Layout>
  );
}
