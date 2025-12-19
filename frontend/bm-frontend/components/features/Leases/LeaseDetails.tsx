import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { Badge } from "react-bootstrap";

export default function LeaseDetails({ lease, renter, unit, onBack }: any) {
  // 1. State for Data
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]); // 🔥 New State
  const [activeTab, setActiveTab] = useState("invoices");
  const [loading, setLoading] = useState(true);

  // 2. Fetch All Financials (Invoices, Payments, Expenses)
  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, expRes] = await Promise.all([
        api.get(`/invoices/?lease=${lease.id}`).then(r => r.data),
        api.get(`/payments/?lease=${lease.id}`).then(r => r.data),
        api.get(`/expenses/?lease=${lease.id}`).then(r => r.data) // 🔥 Fetch Linked Expenses
      ]);
      setInvoices(invRes.results || invRes || []);
      setPayments(payRes.results || payRes || []);
      setExpenses(expRes.results || expRes || []);
    } catch (err) {
      console.error("Failed to load financials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinancials(); }, [lease.id]);

  // 3. Calculated Stats
  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPaid = payments.reduce((acc, pay) => acc + Number(pay.amount), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0); // 🔥 Sum Expenses
    return { totalBilled, totalPaid, totalExpenses };
  }, [invoices, payments, expenses]);

  // Helper to format Invoice Type (e.g. security_deposit -> Security Deposit)
  const formatType = (type: string) => type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

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
          { label: "Current Due", val: lease.current_balance, color: "danger", icon: "bi-wallet2" },
          { label: "Total Billed", val: stats.totalBilled, color: "dark", icon: "bi-receipt" },
          { label: "Total Paid", val: stats.totalPaid, color: "success", icon: "bi-cash-coin" },
          { label: "Lease Expenses", val: stats.totalExpenses, color: "warning", icon: "bi-tools" } // 🔥 New Card
        ].map((s, i) => (
          <div className="col-md-3" key={i}>
            <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 border-bottom border-4 border-${s.color} bg-white`}>
              <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="small text-muted fw-bold text-uppercase mb-2" style={{fontSize: '0.65rem'}}>{s.label}</div>
                    <div className={`h3 fw-bold mb-0 text-${s.color}`}>৳{Number(s.val).toLocaleString()}</div>
                  </div>
                  <i className={`bi ${s.icon} fs-3 text-${s.color} opacity-25`}></i>
              </div>
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
                    {['invoices', 'payments', 'expenses'].map(t => (
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

                    {/* --- INVOICES TAB --- */}
                    {activeTab === 'invoices' && (
                      <table className="table table-hover align-middle">
                        <thead className="small text-muted text-uppercase">
                          <tr><th>Invoice #</th><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th className="text-end">PDF</th></tr>
                        </thead>
                        <tbody>
                          {invoices.map(inv => (
                            <tr key={inv.id}>
                              <td className="fw-bold text-primary small">{inv.invoice_number}</td>
                              <td className="small">{inv.invoice_date}</td>
                              {/* 🔥 Added Invoice Type */}
                              <td><span className="badge bg-light text-dark border fw-normal">{formatType(inv.invoice_type)}</span></td>
                              <td className="fw-bold text-dark">৳{Number(inv.amount).toLocaleString()}</td>
                              <td>
                                <span className={`badge rounded-pill ${
                                  inv.status === 'paid' ? 'bg-success-subtle text-success' : 
                                  inv.status === 'unpaid' ? 'bg-danger-subtle text-danger' : 
                                  'bg-warning-subtle text-warning'
                                }`} style={{fontSize: '0.65rem'}}>
                                  {inv.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="text-end">
                                <a href={inv.invoice_pdf} target="_blank" className="btn btn-sm btn-white text-danger border-0"><i className="bi bi-file-earmark-pdf-fill fs-5"></i></a>
                              </td>
                            </tr>
                          ))}
                          {invoices.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted small">No invoices found.</td></tr>}
                        </tbody>
                      </table>
                    )}

                    {/* --- PAYMENTS TAB --- */}
                    {activeTab === 'payments' && (
                      <table className="table table-hover align-middle">
                        <thead className="small text-muted text-uppercase">
                          <tr><th>Date</th><th>Method</th><th>Ref</th><th className="text-end">Amount</th></tr>
                        </thead>
                        <tbody>
                          {payments.map(pay => (
                            <tr key={pay.id}>
                              <td className="small">{pay.payment_date}</td>
                              <td className="text-capitalize small fw-bold">{pay.method}</td>
                              <td className="x-small text-muted font-monospace">{pay.transaction_reference || 'N/A'}</td>
                              <td className="text-end fw-bold text-success">+৳{Number(pay.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                          {payments.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-muted small">No payments recorded.</td></tr>}
                        </tbody>
                      </table>
                    )}

                    {/* --- 🔥 EXPENSES TAB --- */}
                    {activeTab === 'expenses' && (
                      <table className="table table-hover align-middle">
                        <thead className="small text-muted text-uppercase">
                          <tr><th>Date</th><th>Title</th><th>Category</th><th>Attachment</th><th className="text-end">Cost</th></tr>
                        </thead>
                        <tbody>
                          {expenses.map(exp => (
                            <tr key={exp.id}>
                              <td className="small text-muted">{exp.date}</td>
                              <td>
                                <div className="fw-bold text-dark small">{exp.title}</div>
                                {exp.description && <div className="x-small text-muted text-truncate" style={{maxWidth: '200px'}}>{exp.description}</div>}
                              </td>
                              <td><span className="badge bg-light text-dark border fw-normal text-capitalize">{exp.category}</span></td>
                              <td>
                                {exp.attachment ? (
                                    <a href={exp.attachment} target="_blank" rel="noreferrer" className="text-success"><i className="bi bi-paperclip fs-5"></i></a>
                                ) : <span className="text-muted opacity-25">-</span>}
                              </td>
                              <td className="text-end fw-bold text-danger">-৳{Number(exp.amount).toLocaleString()}</td>
                            </tr>
                          ))}
                          {expenses.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted small">No expenses logged for this lease.</td></tr>}
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