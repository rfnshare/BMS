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

  // 🔥 ADD THIS FUNCTION HERE (The missing piece)
  const StatCard = ({ title, value, icon, color, isCurrency = false }: any) => {
    const formattedValue = isCurrency
      ? `৳${Number(value || 0).toLocaleString()}`
      : value?.toString().padStart(2, '0') || '00';

    return (
      <div className="col-md-3 mb-4">
        <div className="card border-0 shadow-sm rounded-4 h-100 animate__animated animate__fadeIn">
          <div className="card-body d-flex align-items-center gap-3">
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-3`}>
              <i className={`bi ${icon} text-${color} fs-4`}></i>
            </div>
            <div>
              <h6 className="text-muted mb-0 small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{title}</h6>
              <h4 className="fw-bold mb-0">{formattedValue}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const { summary, occupancy, recent_payments } = dashboardData;

  return (
    <>
      <div className="row">
        {/* 🔥 Now StatCard will work because it is defined above */}
        <StatCard
            title="Total Revenue"
            value={summary.total_income}
            icon="bi-cash-stack"
            color="success"
            isCurrency={true}
        />
        <StatCard
            title="Total Outstanding"
            value={summary.total_due}
            icon="bi-exclamation-triangle"
            color="danger"
            isCurrency={true}
        />
        <StatCard
            title="Active Renters"
            value={summary.active_renters}
            icon="bi-people"
            color="primary"
        />
        <StatCard
            title="Occupancy"
            value={`${occupancy.occupancy_percent}%`}
            icon="bi-building-check"
            color="info"
        />
      </div>

<div className="row mt-3">
        {/* --- LEFT COLUMN: RECENT PAYMENTS --- */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Transactions</h5>
              <div className="badge bg-success-subtle text-success px-3">Live Feed</div>
            </div>
            <div className="card-body p-0 mt-2">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-4">Renter / Unit</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th className="pe-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_payments.map((payment: any) => (
                      <tr key={payment.id}>
                        <td className="ps-4">
                          <div className="fw-bold small">{payment.renter_name || "Unknown Renter"}</div>
                          <div className="text-muted x-small">{payment.unit_name || "N/A"}</div>
                        </td>
                        <td>
                            <span className="badge bg-light text-dark border text-capitalize">{payment.method}</span>
                        </td>
                        <td className="fw-bold text-success">৳{Number(payment.amount).toLocaleString()}</td>
                        <td className="pe-4 small text-muted">{payment.payment_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: TOP DUES --- */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Top Dues (Urgent)</h5>
            </div>
            <div className="card-body px-4">
              <div className="vstack gap-3">
                {topDues.slice(0, 5).map((renter: any) => (
                  <div key={renter.renter_id} className="p-3 border rounded-4 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold small">{renter.full_name}</div>
                      <div className="text-muted x-small">{renter.phone_number}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-danger fw-bold small">৳{Number(renter.total_due).toLocaleString()}</div>
                      <button className="btn btn-link p-0 x-small text-decoration-none" onClick={() => router.push(`/admin-dashboard/renters/${renter.renter_id}`)}>View Profile</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-white border-0 text-center pb-4">
                 <button className="btn btn-sm btn-outline-danger rounded-pill px-4" onClick={() => router.push('/admin-dashboard/reports')}>Send Reminders</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}