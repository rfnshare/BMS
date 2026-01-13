import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { Badge, Spinner, Card } from "react-bootstrap";

export default function LeaseDetails({ lease, renter, unit, onBack }: any) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, expRes] = await Promise.all([
        api.get(`/invoices/?lease=${lease.id}`).then(r => r.data),
        api.get(`/payments/?lease=${lease.id}`).then(r => r.data),
        api.get(`/expenses/?lease=${lease.id}`).then(r => r.data)
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

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPaid = payments.reduce((acc, pay) => acc + Number(pay.amount), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
    return { totalBilled, totalPaid, totalExpenses };
  }, [invoices, payments, expenses]);

  const formatType = (type: string) => type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="bg-light min-vh-100">

      {/* 1. STICKY APP BAR (Fixed positioning removed) */}
      <div className="bg-white border-bottom shadow-sm py-3">
        <div className="container-fluid px-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light rounded-circle border shadow-sm" onClick={onBack} style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Agreement Dashboard</h6>
                <span className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>Unit {unit?.name} • {renter?.full_name}</span>
              </div>
            </div>
            <button className="btn btn-primary rounded-pill btn-sm px-3 fw-bold shadow-sm">
              + <i className="bi bi-cash"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SWIPEABLE KPI CARDS (Proper responsive grid) */}
      <div className="container-fluid px-3 py-3">
        <div className="row g-3">
          {[
            { label: "Balance Due", val: lease.current_balance, color: "danger", icon: "bi-wallet2" },
            { label: "Total Billed", val: stats.totalBilled, color: "dark", icon: "bi-receipt" },
            { label: "Total Paid", val: stats.totalPaid, color: "success", icon: "bi-cash-coin" },
            { label: "Expenses", val: stats.totalExpenses, color: "warning", icon: "bi-tools" }
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <Card className={`border-0 shadow-sm rounded-4 p-3 h-100 border-bottom border-4 border-${s.color}`}>
                <div className="text-muted fw-bold x-small text-uppercase mb-1">{s.label}</div>
                <div className={`h3 fw-bold text-${s.color} mb-0`}>৳{Number(s.val).toLocaleString()}</div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PROFILE & CONFIGURATION SECTION */}
      <div className="container-fluid px-3 pb-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
          {/* Header with icon */}
          <h6 className="fw-bold text-primary small text-uppercase mb-3 d-flex align-items-center">
            <i className="bi bi-person-badge me-2"></i>
            <span>Renter & Unit</span>
          </h6>

          {/* Identity Section - Fixed text truncation */}
          <div className="d-flex align-items-center mb-3">
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 me-3"
              style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
            >
              {renter?.full_name?.charAt(0)}
            </div>

            <div className="flex-grow-1 overflow-hidden">
              <div className="fw-bold text-dark text-truncate fs-6 lh-1 mb-1">
                {renter?.full_name}
              </div>
              <div className="text-muted small text-truncate">
                {renter?.phone_number || "No contact info"}
              </div>
            </div>
          </div>

          {/* Rent Breakdown */}
          <div className="vstack gap-2 border-top pt-3">
            {lease.lease_rents?.map((r: any) => (
              <div key={r.id} className="d-flex justify-content-between align-items-center small">
                <span className="text-muted text-truncate me-2">{r.rent_type_name}</span>
                <span className="fw-bold text-dark flex-shrink-0">
                  ৳{Number(r.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. STICKY SUB-TABS (LEDGER) */}
      <div className="bg-white border-top border-bottom shadow-sm sticky-top" style={{ top: '0', zIndex: 1010 }}>
        <div className="container-fluid px-3">
          <div className="nav nav-pills gap-2 py-2">
            {['invoices', 'payments', 'expenses'].map(t => (
              <button
                key={t}
                className={`nav-link rounded-pill px-4 py-2 small fw-bold ${activeTab === t ? 'bg-dark text-white shadow' : 'text-muted bg-light'}`}
                onClick={() => setActiveTab(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. NATIVE-STYLE LISTS */}
      <div className="container-fluid px-3 pb-5">
        <div className="bg-white rounded-3 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="vstack">
              {/* INVOICES LIST */}
              {activeTab === 'invoices' && invoices.map(inv => (
                <div key={inv.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 overflow-hidden me-3">
                    <div className="fw-bold text-dark fs-6 text-truncate">{inv.invoice_number}</div>
                    <div className="text-muted x-small fw-bold">{inv.invoice_date} • {formatType(inv.invoice_type)}</div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="fw-bold fs-6 mb-1">৳{Number(inv.amount).toLocaleString()}</div>
                    <Badge bg={inv.status === 'paid' ? 'success' : 'danger'} className="rounded-pill x-small text-uppercase">
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* PAYMENTS LIST */}
              {activeTab === 'payments' && payments.map(pay => (
                <div key={pay.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 me-3">
                    <div className="fw-bold text-success fs-6">Payment Received</div>
                    <div className="text-muted x-small fw-bold">{pay.payment_date} • {pay.method.toUpperCase()}</div>
                  </div>
                  <div className="fw-bold fs-6 text-dark flex-shrink-0">
                    ৳{Number(pay.amount).toLocaleString()}
                  </div>
                </div>
              ))}

              {/* EXPENSES LIST */}
              {activeTab === 'expenses' && expenses.map(exp => (
                <div key={exp.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 overflow-hidden me-3">
                    <div className="fw-bold text-dark fs-6 text-truncate">{exp.title}</div>
                    <div className="text-muted x-small fw-bold">{exp.date} • {exp.category.toUpperCase()}</div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="fw-bold text-danger fs-6">-৳{Number(exp.amount).toLocaleString()}</div>
                    {exp.attachment && (
                      <a href={exp.attachment} target="_blank" rel="noopener noreferrer" className="x-small text-decoration-none fw-bold">
                        View Receipt <i className="bi bi-paperclip"></i>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {((activeTab === 'invoices' && invoices.length === 0) ||
                (activeTab === 'payments' && payments.length === 0) ||
                (activeTab === 'expenses' && expenses.length === 0)) && (
                <div className="text-center py-5 text-muted small fst-italic">
                  No records in this ledger.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}