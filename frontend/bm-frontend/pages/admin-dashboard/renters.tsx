import { useEffect, useState } from "react";
import Layout from "../../components/layouts/Layout";
import RenterManager from "../../components/features/Renters/RenterManager";
import api from "../../logic/services/apiClient";
import { getErrorMessage } from "../../logic/utils/getErrorMessage";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";
import LeaseManager from "../../components/features/Leases/LeaseManager";


export default function RentersPage() {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH REAL DATA
  const loadRenterStats = async () => {
    try {
      // We fetch from the main renters list to calculate stats
      const response = await api.get("/renters/");
      const renters = response.data.results || response.data || [];

      setStats({
        total: renters.length,
        // Assuming your Renter model has an 'is_verified' or 'nid' field
        verified: renters.filter((r: any) => r.nid && r.nid !== "").length,
        pending: renters.filter((r: any) => !r.nid || r.nid === "").length
      });
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRenterStats();
  }, []);

  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
      <div className="container-fluid py-3 py-md-4">
        {/* The Manager now handles all logic, stats, and modals internally */}
        <RenterManager />
      </div>
    </Layout>
  );
}