import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";

export default function LeaseDetails({ lease, renter, unit, onBack }: any) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        api.get(`/invoices/?lease=${lease.id}`).then(r => r.data),
        api.get(`/payments?lease=${lease.id}`).then(r => r.data)
      ]);
      setInvoices(invRes.results || invRes || []);
      setPayments(payRes.results || payRes || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinancials(); }, [lease.id]);

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPaid = payments.reduce((acc, pay) => acc + Number(pay.amount), 0);
    return { totalBilled, totalPaid };
  }, [invoices, payments]);

  return (
    <div className="animate__animated animate__fadeIn">
      {/* DASHBOARD HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light rounded-circle border shadow-sm" onClick={onBack}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h4 className="fw-bold mb-0">Agreement Command Center</h4>
            <span className="text-muted small">Lease #{lease.id} • Unit {unit?.name} • Renter {renter?.full_name}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
            <button className="btn btn-outline-dark rounded-pill px-4 btn-sm fw-bold"><i className="bi bi-printer me-2"></i>Statement</button>
            <button className="btn btn-primary rounded-pill px-4 btn-sm fw-bold shadow-sm"><i className="bi bi-plus-lg me-2"></i>Record Payment</button>
        </div>
      </div>

      {/* FINANCIAL AGGREGATES */}
      <div className="row g-3 mb-4">
        {[
          { label: "Current Balance", val: lease.current_balance, color: "danger", icon: "bi-wallet2" },
          { label: "Total Billed", val: stats.totalBilled, color: "dark", icon: "bi-receipt" },
          { label: "Total Paid", val: stats.totalPaid, color: "success", icon: "bi-cash-coin" },
          { label: "Security Deposit", val: lease.security_deposit, color: "primary", icon: "bi-shield-lock" }
        ].map((s, i) => (
          <div className="col-md-3" key={i}>
            <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 border-bottom border-4 border-${s.color} bg-white`}>
              <div className="small text-muted fw-bold text-uppercase mb-2" style={{fontSize: '0.65rem'}}>{s.label}</div>
              <div className={`h3 fw-bold mb-0 text-${s.color}`}>৳{Number(s.val).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* LEFT PROFILE COLUMN */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-person-circle me-2"></i>Renter Profile</h6>
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3 text-primary h4 mb-0 fw-bold">
                {renter?.full_name?.charAt(0)}
              </div>
              <div>
                <div className="fw-bold fs-5 text-dark">{renter?.full_name}</div>
                <div className="text-muted small">{renter?.phone_number}</div>
              </div>
            </div>
            <div className="vstack gap-2 border-top pt-3">
                <div className="d-flex justify-content-between x-small"><span className="text-muted">Email:</span><span className="fw-bold">{renter?.email || '---'}</span></div>
                <div className="d-flex justify-content-between x-small"><span className="text-muted">NID/Passport:</span><span className="fw-bold">{renter?.nid_number || '---'}</span></div>
                <div className="d-flex justify-content-between x-small"><span className="text-muted">Emergency Contact:</span><span className="fw-bold">{renter?.emergency_contact || '---'}</span></div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white">
             <h6 className="fw-bold text-warning mb-3"><i className="bi bi-building me-2"></i>Unit Configuration</h6>
             <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white bg-opacity-10 rounded-4">
                <div className="h2 fw-bold mb-0">{unit?.name}</div>
                <div className="text-end small">Status<br/><span className="text-success fw-bold small">● Occupied</span></div>
             </div>
             <div className="vstack gap-2 px-1">
                {lease.lease_rents?.map((r: any) => (
                  <div key={r.id} className="d-flex justify-content-between small opacity-75 pb-2 border-bottom border-secondary border-opacity-25">
                    <span>{r.rent_type_name}</span>
                    <span className="fw-bold">৳{Number(r.amount).toLocaleString()}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT LEDGER COLUMN */}
        <div className="col-lg-8">
           <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100">
              <div className="card-header bg-white border-0 p-4 pb-0">
                 <div className="nav nav-tabs border-0 gap-3">
                    {['invoices', 'payments'].map(t => (
                      <button
                        key={t}
                        className={`nav-link border-0 text-capitalize fw-bold px-4 ${activeTab === t ? 'text-primary border-bottom border-3 border-primary' : 'text-muted'}`}
                        onClick={() => setActiveTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="card-body p-4">
                {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                  <div className="table-responsive">
                    {activeTab === 'invoices' ? (
                      <table className="table table-hover align-middle">
                        <thead className="small text-muted text-uppercase">
                          <tr><th>Invoice</th><th>Amount</th><th>Status</th><th className="text-end">Action</th></tr>
                        </thead>
                        <tbody>
                          {invoices.map(inv => (
                            <tr key={inv.id}>
                              <td>
                                <div className="fw-bold small">{inv.invoice_number}</div>
                                <div className="x-small text-muted">{inv.invoice_month || inv.invoice_type.replace('_',' ')}</div>
                              </td>
                              <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                              <td><span className={`badge rounded-pill ${inv.status === 'paid' ? 'bg-success' : 'bg-warning'}`} style={{fontSize: '0.65rem'}}>{inv.status.toUpperCase()}</span></td>
                              <td className="text-end"><a href={inv.invoice_pdf} target="_blank" className="btn btn-sm btn-outline-danger border-0 rounded-circle"><i className="bi bi-file-earmark-pdf fs-5"></i></a></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="table table-hover align-middle">
                        <thead className="small text-muted text-uppercase">
                          <tr><th>Date</th><th>Method</th><th>Ref</th><th className="text-end">Amount</th></tr>
                        </thead>
                        <tbody>
                          {payments.map(pay => (
                            <tr key={pay.id}>
                              <td className="small">{pay.payment_date}</td>
                              <td className="text-capitalize small fw-bold">{pay.method}</td>
                              <td className="x-small text-muted">{pay.transaction_reference || 'N/A'}</td>
                              <td className="text-end fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}