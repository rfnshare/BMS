import Layout from "../../components/layouts/Layout";
import LeaseManager from "../../components/features/Leases/LeaseManager";
import { ADMIN_MENU_ITEMS } from "../../logic/utils/menuConstants";

export default function LeasesPage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-3 py-md-4">
        {/* The Manager now handles all logic, stats, and modals internally */}
        <LeaseManager />
      </div>
    </Layout>
  );
}