import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { Spinner } from "react-bootstrap";

/* =======================
   TYPES
======================= */

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  isCurrency?: boolean;
}

interface DashboardSummary {
  total_income: number;
  total_due: number;
  active_renters: number;
}

interface Occupancy {
  occupancy_percent: number;
}

interface RecentPayment {
  id: number;
  renter_name: string | null;
  unit_name: string | null;
  method: string;
  amount: number;
}

interface DashboardData {
  summary: DashboardSummary;
  occupancy: Occupancy;
  recent_payments: RecentPayment[];
}

interface TopDueRenter {
  renter_id: number;
  full_name: string;
  phone_number: string;
  total_due: number;
}

/* =======================
   STAT CARD
======================= */

const StatCard = ({
  title,
  value,
  icon,
  color,
  isCurrency = false,
}: StatCardProps) => {
  const formattedValue = isCurrency
    ? `৳${Number(value || 0).toLocaleString()}`
    : value?.toString().padStart(2, "0") || "00";

  return (
    <div className="col-6 col-lg-3 mb-3 mb-md-4">
      <div className="card border-0 shadow-sm rounded-4 h-100 animate__animated animate__fadeIn">
        <div className="card-body d-flex flex-column flex-md-row align-items-center gap-2 gap-md-3 p-3">
          <div
            className={`rounded-circle bg-${color} bg-opacity-10 p-2 p-md-3 d-flex align-items-center justify-content-center`}
          >
            <i className={`bi ${icon} text-${color} fs-5 fs-md-4`} />
          </div>
          <div className="text-center text-md-start">
            <h6
              className="text-muted mb-0 fw-bold text-uppercase"
              style={{ fontSize: "0.6rem", letterSpacing: "0.5px" }}
            >
              {title}
            </h6>
            <h4 className="fw-bold mb-0 mt-1" style={{ fontSize: "1.1rem" }}>
              {formattedValue}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =======================
   MAIN COMPONENT
======================= */

export default function AdminDashboard() {
  const router = useRouter();

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);
  const [topDues, setTopDues] = useState<TopDueRenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReminding, setIsReminding] = useState<boolean>(false);
  const [isOverdueChecking, setIsOverdueChecking] =
    useState<boolean>(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, topDuesRes] = await Promise.all([
        api.get("/dashboard/summary/"),
        api.get("/reports/renter/top-dues/"),
      ]);

      setDashboardData(summaryRes.data.data as DashboardData);
      setTopDues(topDuesRes.data as TopDueRenter[]);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleManualReminder = async () => {
    if (
      !window.confirm(
        "Send friendly SMS/Email reminders to all renters with upcoming dues?"
      )
    )
      return;

    setIsReminding(true);
    try {
      const res = await InvoiceService.sendManualReminders();
      alert(`✅ Success: ${res.message}`);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setIsReminding(false);
    }
  };

  const handleOverdueNotice = async () => {
    if (
      !window.confirm(
        "⚠️ Send URGENT overdue notices to renters with dues older than 30 days?"
      )
    )
      return;

    setIsOverdueChecking(true);
    try {
      const res = await InvoiceService.detectOverdueInvoices();
      alert(`✅ Success: ${res.message}`);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setIsOverdueChecking(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5 min-vh-100 d-flex flex-column justify-content-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted small fw-bold text-uppercase">
          Synchronizing Property Records...
        </p>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (!dashboardData) return null;

  const { summary, occupancy, recent_payments } = dashboardData;

  return (
    <div className="py-2 px-2 px-md-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">System Command Center</h2>
          <p className="text-muted small mb-0">
            Real-time data synchronization with your property records.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small"
            onClick={loadDashboardData}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Refresh
          </button>
          <button
            className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold small"
            onClick={() => router.push("/admin-dashboard/reports")}
          >
            <i className="bi bi-file-earmark-bar-graph me-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="row g-2 g-md-4">
        <StatCard
          title="Revenue"
          value={summary.total_income}
          icon="bi-cash-stack"
          color="success"
          isCurrency
        />
        <StatCard
          title="Dues"
          value={summary.total_due}
          icon="bi-exclamation-triangle"
          color="danger"
          isCurrency
        />
        <StatCard
          title="Renters"
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

      <div className="row mt-2 mt-md-4">
        {/* RECENT PAYMENTS */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
              <span className="badge bg-success-subtle text-success rounded-pill">
                Live
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th className="ps-4">Renter</th>
                    <th className="d-none d-sm-table-cell">Method</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="ps-4">
                        <div className="fw-bold small">
                          {payment.renter_name ?? "N/A"}
                        </div>
                        <div className="text-muted x-small">
                          {payment.unit_name ?? "N/A"}
                        </div>
                      </td>
                      <td className="d-none d-sm-table-cell">
                        <span className="badge bg-light text-dark border x-small">
                          {payment.method}
                        </span>
                      </td>
                      <td className="fw-bold text-success small">
                        ৳{payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TOP DUES */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0 text-danger">Urgent Collection</h5>
            </div>

            <div className="card-body px-3 px-md-4">
              <div className="vstack gap-2">
                {topDues.slice(0, 5).map((renter) => (
                  <div
                    key={renter.renter_id}
                    className="p-3 border rounded-4 d-flex justify-content-between align-items-center bg-light bg-opacity-50"
                  >
                    <div>
                      <div className="fw-bold small">{renter.full_name}</div>
                      <div className="text-muted x-small">
                        {renter.phone_number}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-danger fw-bold small">
                        ৳{renter.total_due.toLocaleString()}
                      </div>
                      <button
                        className="btn btn-link p-0 x-small text-decoration-none"
                        onClick={() =>
                          router.push(
                            `/admin-dashboard/renters/${renter.renter_id}`
                          )
                        }
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-footer bg-white border-0 px-4 pb-4">
              <div className="vstack gap-2">
                <button
                  className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm"
                  onClick={handleManualReminder}
                  disabled={isReminding}
                >
                  {isReminding ? (
                    <Spinner size="sm" className="me-2" />
                  ) : (
                    <i className="bi bi-send-fill me-2" />
                  )}
                  Send Rent Reminders
                </button>

                <button
                  className="btn btn-outline-danger w-100 rounded-pill py-2 fw-bold"
                  onClick={handleOverdueNotice}
                  disabled={isOverdueChecking}
                >
                  {isOverdueChecking ? (
                    <Spinner size="sm" className="me-2" />
                  ) : (
                    <i className="bi bi-exclamation-octagon-fill me-2" />
                  )}
                  Send Overdue Notices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}