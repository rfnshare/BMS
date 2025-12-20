import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [topDues, setTopDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, topDuesRes] = await Promise.all([
        api.get("/dashboard/summary/"),
        api.get("/reports/renter/top-dues/")
      ]);
      setDashboardData(summaryRes.data.data);
      setTopDues(topDuesRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  // 🔥 RESPONSIVE STAT CARD
  const StatCard = ({ title, value, icon, color, isCurrency = false }: any) => {
    const formattedValue = isCurrency
      ? `৳${Number(value || 0).toLocaleString()}`
      : value?.toString().padStart(2, '0') || '00';

    return (
      /* col-6 = 2 cards per row on mobile | col-lg-3 = 4 per row on desktop */
      <div className="col-6 col-lg-3 mb-3 mb-md-4">
        <div className="card border-0 shadow-sm rounded-4 h-100 animate__animated animate__fadeIn">
          <div className="card-body d-flex flex-column flex-md-row align-items-center gap-2 gap-md-3 p-3">
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-2 p-md-3 d-flex align-items-center justify-content-center`}>
              <i className={`bi ${icon} text-${color} fs-5 fs-md-4`}></i>
            </div>
            <div className="text-center text-md-start">
              <h6 className="text-muted mb-0 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>{title}</h6>
              <h4 className="fw-bold mb-0 mt-1" style={{ fontSize: '1.1rem' }}>{formattedValue}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  const { summary, occupancy, recent_payments } = dashboardData;

  return (
    <div className="container-fluid px-2 px-md-3">
      {/* STATS ROW */}
      <div className="row g-2 g-md-4">
        <StatCard title="Revenue" value={summary.total_income} icon="bi-cash-stack" color="success" isCurrency={true} />
        <StatCard title="Dues" value={summary.total_due} icon="bi-exclamation-triangle" color="danger" isCurrency={true} />
        <StatCard title="Renters" value={summary.active_renters} icon="bi-people" color="primary" />
        <StatCard title="Occupancy" value={`${occupancy.occupancy_percent}%`} icon="bi-building-check" color="info" />
      </div>

      <div className="row mt-2 mt-md-4">
        {/* --- RECENT TRANSACTIONS --- */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-3 px-md-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
              <span className="badge bg-success-subtle text-success rounded-pill px-3">Live</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-3 ps-md-4" style={{ fontSize: '0.65rem' }}>Renter</th>
                      <th className="d-none d-sm-table-cell" style={{ fontSize: '0.65rem' }}>Method</th>
                      <th style={{ fontSize: '0.65rem' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_payments.map((payment: any) => (
                      <tr key={payment.id} style={{ cursor: 'pointer' }}>
                        <td className="ps-3 ps-md-4">
                          <div className="fw-bold small">{payment.renter_name || "N/A"}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{payment.unit_name || "N/A"}</div>
                        </td>
                        <td className="d-none d-sm-table-cell">
                            <span className="badge bg-light text-dark border x-small">{payment.method}</span>
                        </td>
                        <td>
                           <div className="fw-bold text-success small">৳{Number(payment.amount).toLocaleString()}</div>
                           <div className="d-block d-md-none text-muted x-small">{payment.payment_date}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- TOP DUES --- */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Urgent Collection</h5>
            </div>
            <div className="card-body px-3 px-md-4">
              <div className="vstack gap-2">
                {topDues.slice(0, 5).map((renter: any) => (
                  <div key={renter.renter_id} className="p-3 border rounded-4 d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                    <div>
                      <div className="fw-bold small">{renter.full_name}</div>
                      <div className="text-muted x-small">{renter.phone_number}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-danger fw-bold small">৳{Number(renter.total_due).toLocaleString()}</div>
                      <button className="btn btn-link p-0 x-small text-decoration-none" onClick={() => router.push(`/admin-dashboard/renters/${renter.renter_id}`)}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-white border-0 text-center pb-4">
                 <button className="btn btn-danger w-100 rounded-pill py-2" onClick={() => router.push('/admin-dashboard/reports')}>Send Reminders</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}