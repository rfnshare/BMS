import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();

  // 1. Initialize with safe defaults to prevent 'undefined' errors
  const [data, setData] = useState({
    rentersCount: 0,
    activeLeases: 0,
    unpaidInvoicesCount: 0,
    totalRevenue: 0,
    recentActivities: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [rRes, lRes, iRes] = await Promise.all([
        api.get("/renters/renters/"),
        api.get("/leases/"),
        api.get("/invoices/")
      ]);

      const renters = rRes.data.results || rRes.data || [];
      const leases = lRes.data.results || lRes.data || [];
      const invoices = iRes.data.results || iRes.data || [];

      const unpaid = invoices.filter((inv: any) => inv.status === 'unpaid');

      // SQA Tip: Always provide '0' as initial value in reduce to prevent crashes on empty arrays
      const revenue = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

      setData({
        rentersCount: renters.length,
        activeLeases: leases.filter((l: any) => l.status === 'active').length,
        unpaidInvoicesCount: unpaid.length,
        totalRevenue: revenue,
        recentActivities: invoices.slice(0, 5)
      });
    } catch (err) {
      console.error("Dashboard Load Error:", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  // 2. Optimized StatCard with Defensive Formatting
  const StatCard = ({ title, value, icon, color, isCurrency = false }: any) => {
    // 🔥 SAFE FORMATTING LOGIC
    // Math.max(0, ...) ensures padStart never sees a negative number
    const formattedValue = isCurrency
      ? `৳${Number(value || 0).toLocaleString()}`
      : Math.max(0, Number(value || 0)).toString().padStart(2, '0');

    return (
      <div className="col-md-3 mb-4">
        <div className="card border-0 shadow-sm rounded-4 h-100 animate__animated animate__fadeIn">
          <div className="card-body d-flex align-items-center gap-3">
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-3`}>
              <i className={`bi ${icon} text-${color} fs-4`}></i>
            </div>
            <div>
              <h6 className="text-muted mb-0 small fw-bold text-uppercase">{title}</h6>
              <h4 className="fw-bold mb-0">{formattedValue}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2 text-muted small">Synchronizing Real-time Data...</p>
    </div>
  );

  return (
    <>
      <div className="row">
        <StatCard title="Total Renters" value={data.rentersCount} icon="bi-people" color="primary" />
        <StatCard title="Active Leases" value={data.activeLeases} icon="bi-file-earmark-check" color="success" />
        <StatCard title="Unpaid Bills" value={data.unpaidInvoicesCount} icon="bi-exclamation-circle" color="warning" />
        <StatCard title="Revenue (MTD)" value={data.totalRevenue} icon="bi-wallet2" color="info" isCurrency={true} />
      </div>

      <div className="row mt-2">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
              <button className="btn btn-sm btn-link text-decoration-none fw-bold" onClick={() => router.push('/admin-dashboard/invoices')}>View All</button>
            </div>
            <div className="card-body p-0 mt-2">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-4">Invoice #</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="pe-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivities.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">No recent records.</td></tr>
                    ) : data.recentActivities.map((inv) => (
                      <tr key={inv.id}>
                        <td className="ps-4 fw-bold small">{inv.invoice_number}</td>
                        <td className="fw-medium text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                        <td>
                          <span className={`badge rounded-pill ${inv.status === 'paid' ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning border border-warning'}`}>
                            {inv.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="pe-4 small text-muted">{inv.invoice_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-3 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4 text-warning">Quick Actions</h5>
              <div className="vstack gap-3">
                <button className="btn btn-outline-light text-start py-3 rounded-4 border-secondary border-opacity-50" onClick={() => router.push('/admin-dashboard/units')}>
                  <i className="bi bi-building-add me-3"></i> Add New Unit
                </button>
                <button className="btn btn-outline-light text-start py-3 rounded-4 border-secondary border-opacity-50" onClick={() => router.push('/admin-dashboard/renters')}>
                  <i className="bi bi-person-plus me-3"></i> Register Renter
                </button>
                <button className="btn btn-outline-light text-start py-3 rounded-4 border-secondary border-opacity-50" onClick={() => router.push('/admin-dashboard/leases')}>
                  <i className="bi bi-file-earmark-plus me-3"></i> Create Lease
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}