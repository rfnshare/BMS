import { useRouter } from "next/router";
import { Spinner, Badge, Table } from "react-bootstrap";
import { useDashboard } from "../../../logic/hooks/useDashboard";

export default function AdminDashboard() {
  const router = useRouter();
  const { data, topDues, loading, actions } = useDashboard();

  if (loading && !data) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  const { summary, occupancy, recent_payments } = data;

  // 1. Internal Helper for consistent Stat Cards
  const StatCard = ({ title, value, icon, color, isCurrency = false }: any) => (
    <div className="col-6 col-lg-3">
      <div className={`card border-0 shadow-sm p-3 bg-white border-start border-4 border-${color} rounded-4 h-100 animate__animated animate__fadeIn`}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <small className="text-muted fw-bold x-small text-uppercase" style={{ letterSpacing: '0.5px' }}>{title}</small>
          <div className={`bg-${color} bg-opacity-10 p-2 rounded-3 text-${color}`}>
            <i className={`bi ${icon} fs-5`}></i>
          </div>
        </div>
        <h4 className="fw-bold mb-0 text-dark">
          {isCurrency ? `৳${Number(value || 0).toLocaleString()}` : value}
        </h4>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3 animate__animated animate__fadeIn">


      {/* --- STATS ROW --- */}
      <div className="row g-3 mb-4">
        <StatCard title="Total Revenue" value={summary.total_income} icon="bi-cash-stack" color="success" isCurrency />
        <StatCard title="Outstanding Dues" value={summary.total_due} icon="bi-exclamation-octagon" color="danger" isCurrency />
        <StatCard title="Active Residents" value={summary.active_renters} icon="bi-people" color="primary" />
        <StatCard title="Property Load" value={`${occupancy.occupancy_percent}%`} icon="bi-building-up" color="info" />
      </div>

      <div className="row g-4">
        {/* --- RECENT ACTIVITY TABLE --- */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Recent Activity</h5>
              <Badge pill bg="success" className="px-3 py-2 x-small">LIVE UPDATES</Badge>
            </div>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr className="x-small fw-bold text-muted text-uppercase">
                    <th className="ps-4 py-3">Renter & Unit</th>
                    <th className="text-center">Method</th>
                    <th className="pe-4 text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="ps-4 py-3">
                        <div className="fw-bold text-dark small">{payment.renter_name}</div>
                        <div className="text-muted x-small fw-semibold">{payment.unit_name}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border rounded-pill px-3 x-small">{payment.method}</span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="fw-bold text-success small">৳{Number(payment.amount).toLocaleString()}</div>
                        <div className="text-muted x-small">{payment.payment_date}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        {/* --- URGENT COLLECTIONS (Sidebar Style) --- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
            <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-danger fs-5"></i>
              <h5 className="fw-bold mb-0">Urgent Collection</h5>
            </div>
            <div className="card-body px-4">
              <div className="vstack gap-3">
                {topDues.slice(0, 5).map((renter: any) => (
                  <div key={renter.renter_id} className="p-3 border rounded-4 bg-light bg-opacity-50 border-start border-4 border-danger position-relative overflow-hidden">
                    <div className="d-flex justify-content-between align-items-start position-relative" style={{ zIndex: 2 }}>
                      <div>
                        <div className="fw-bold text-dark small">{renter.full_name}</div>
                        <div className="text-muted x-small">{renter.phone_number}</div>
                      </div>
                      <div className="text-end">
                        <div className="text-danger fw-bold small">৳{Number(renter.total_due).toLocaleString()}</div>
                        <button
                          className="btn btn-link p-0 x-small text-decoration-none fw-bold"
                          onClick={() => router.push(`/admin-dashboard/renters/${renter.renter_id}`)}
                        >
                          Details <i className="bi bi-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-white border-0 p-4 pt-0">
                 <button className="btn btn-danger w-100 rounded-pill py-2 fw-bold shadow-sm" onClick={() => router.push('/admin-dashboard/reports')}>
                   <i className="bi bi-megaphone me-2"></i>Send Reminders
                 </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}