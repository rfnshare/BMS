import { useEffect, useState } from "react";
import Layout from "../../components/layouts/Layout";
import RenterManager from "../../components/features/Renters/RenterManager";
import api from "../../logic/services/apiClient";
import { getErrorMessage } from "../../logic/utils/getErrorMessage";
import {ADMIN_MENU_ITEMS} from "../../logic/utils/menuConstants";


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
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        {/* 1. PAGE HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Renter Directory</h2>
            <p className="text-muted small mb-0">
              Manage profiles, legal documents, and contact information.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-white border rounded-pill px-3 shadow-sm fw-bold small" onClick={loadRenterStats}>
              <i className="bi bi-arrow-clockwise me-2"></i>Refresh
            </button>
          </div>
        </div>

        {/* 2. SUMMARY METRICS */}
        <div className="row g-3 mb-4">
          <SummaryCard
            title="Total Residents"
            value={stats.total}
            subtitle="Active Records"
            icon="bi-people"
            color="primary"
            loading={loading}
          />
          <SummaryCard
            title="Verified"
            value={stats.verified}
            subtitle="NID Scanned"
            icon="bi-patch-check"
            color="success"
            loading={loading}
          />
          <SummaryCard
            title="Legal"
            value={stats.pending}
            subtitle="Docs Pending"
            icon="bi-file-earmark-person"
            color="warning"
            loading={loading}
          />
        </div>

        {/* 3. MAIN TABLE SECTION */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-lines-fill text-primary fs-5"></i>
              <h5 className="fw-bold mb-0">Identity Management</h5>
            </div>
          </div>
          <div className="card-body p-0">
            <RenterManager />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// 🔥 Helper Component for Summary Cards
function SummaryCard({ title, value, subtitle, icon, color, loading }: any) {
  return (
    <div className="col-md-4">
      <div className={`card border-0 shadow-sm rounded-4 border-start border-4 border-${color} h-100 bg-white`}>
        <div className="card-body p-3 d-flex align-items-center gap-3">
          <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle p-3`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
          <div>
            <div className="text-muted x-small fw-bold text-uppercase">{title}</div>
            <div className="fs-4 fw-bold text-dark">
              {loading ? <span className="spinner-border spinner-border-sm"></span> : value.toString().padStart(2, '0')}
            </div>
            <div className="x-small text-muted">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}