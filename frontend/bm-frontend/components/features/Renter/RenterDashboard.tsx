import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import Link from "next/link";

export default function RenterDashboard() {
  const [lease, setLease] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current active lease
      const leaseRes = await api.get("/leases/my-lease/");
      setLease(leaseRes.data);

      // 2. Fetch all invoices
      const invRes = await api.get("/invoices/");
      setInvoices(invRes.data.results || invRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Logic: Calculate totals for financial cards
  const summary = useMemo(() => {
    const unpaid = invoices.filter(inv => inv.status === 'unpaid');
    const unpaidTotal = unpaid.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
    return {
      unpaidTotal,
      unpaidCount: unpaid.length,
      lastPayment: invoices.find(inv => inv.status === 'paid')?.amount || 0
    };
  }, [invoices]);

  if (loading) return (
    <div className="text-center py-5 my-5">
      <div className="spinner-border text-primary"></div>
      <p className="mt-2 text-muted small">Loading your residency data...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. TOP STATS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-danger border-4 bg-white position-relative overflow-hidden">
            <div className="position-relative z-1">
              <div className="text-muted small fw-bold text-uppercase mb-1">Due Amount</div>
              <div className="h2 fw-bold mb-0 text-danger">৳{summary.unpaidTotal.toLocaleString()}</div>
              <div className="small text-muted mt-1">{summary.unpaidCount} Pending Invoices</div>
            </div>
            <i className="bi bi-exclamation-circle position-absolute end-0 bottom-0 mb-n2 me-n2 text-danger opacity-10" style={{fontSize: '5rem'}}></i>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-primary border-4 bg-white position-relative overflow-hidden">
            <div className="position-relative z-1">
              <div className="text-muted small fw-bold text-uppercase mb-1">Security Deposit</div>
              <div className="h2 fw-bold mb-0 text-primary">৳{Number(lease?.security_deposit || 0).toLocaleString()}</div>
              <div className="small text-muted mt-1">Held by Management</div>
            </div>
            <i className="bi bi-shield-lock position-absolute end-0 bottom-0 mb-n2 me-n2 text-primary opacity-10" style={{fontSize: '5rem'}}></i>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-success border-4 bg-white position-relative overflow-hidden">
            <div className="position-relative z-1">
              <div className="text-muted small fw-bold text-uppercase mb-1">Last Payment</div>
              <div className="h2 fw-bold mb-0 text-success">৳{Number(summary.lastPayment).toLocaleString()}</div>
              <div className="small text-muted mt-1">Thank you for being on time!</div>
            </div>
            <i className="bi bi-check-circle position-absolute end-0 bottom-0 mb-n2 me-n2 text-success opacity-10" style={{fontSize: '5rem'}}></i>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. RECENT INVOICE LIST */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100">
            <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Recent Activity</h5>
              <Link href="/renter-dashboard/invoices" className="btn btn-sm btn-light rounded-pill px-3 fw-bold small">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light small text-muted text-uppercase">
                  <tr>
                    <th className="ps-4">Inv #</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th className="pe-4 text-end">Status</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {invoices.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-5 text-muted">No historical data available.</td></tr>
                  ) : invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id}>
                      <td className="ps-4 py-3 fw-bold small text-primary">{inv.invoice_number}</td>
                      <td className="small text-muted">{inv.due_date}</td>
                      <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                      <td className="pe-4 text-end">
                        <span className={`badge rounded-pill px-3 py-2 ${inv.status === 'paid' ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning border border-warning'}`}>
                          {inv.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. UNIT & LEASE PREVIEW */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100 shadow-lg">
            {!lease ? (
              <div className="text-center py-4">
                <i className="bi bi-house-dash display-4 text-secondary"></i>
                <p className="mt-3 small opacity-75">Your assigned unit information will appear here once the lease is active.</p>
              </div>
            ) : (
              <>
                <h6 className="text-warning fw-bold text-uppercase mb-4 small ls-1">My Current Unit</h6>
                <div className="d-flex align-items-center mb-4 p-3 bg-white bg-opacity-10 rounded-4 border border-secondary border-opacity-25">
                   <div className="bg-primary rounded-circle p-2 me-3 shadow-sm"><i className="bi bi-building fs-4"></i></div>
                   <div>
                      <div className="h4 fw-bold mb-0 text-white">{lease.unit?.name || "Unit"}</div>
                      <div className="small text-white-50">Grand Terrace Residency</div>
                   </div>
                </div>

                <div className="vstack gap-3 px-1">
                   <div className="d-flex justify-content-between small">
                      <span className="text-white-50">Lease Start</span>
                      <span className="text-white fw-bold">{lease.start_date}</span>
                   </div>
                   <div className="d-flex justify-content-between small">
                      <span className="text-white-50">Monthly Rent</span>
                      <span className="text-white fw-bold">৳{Number(lease.rent_amount || 0).toLocaleString()}</span>
                   </div>
                   <div className="d-flex justify-content-between small pt-2 border-top border-secondary border-opacity-50">
                      <span className="text-white-50">Unit Type</span>
                      <span className="text-white fw-bold">Residential</span>
                   </div>
                </div>

                <div className="mt-auto pt-5">
                   <Link href="/renter-dashboard/my-units" className="btn btn-warning w-100 rounded-pill fw-bold text-dark shadow-sm">
                      Full Details <i className="bi bi-arrow-right ms-2"></i>
                   </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}