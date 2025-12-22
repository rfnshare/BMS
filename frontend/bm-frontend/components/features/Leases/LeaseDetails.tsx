import { useState } from "react";
import { useLeaseFinancials } from "../../../logic/hooks/useLeaseFinancials";
import { Badge, Spinner, Card, Row, Col, Button } from "react-bootstrap";

export default function LeaseDetails({ lease, renter, unit, onBack }: any) {
  const [activeTab, setActiveTab] = useState("invoices");

  // 1. Logic via Hook
  const { invoices, payments, expenses, stats, loading } = useLeaseFinancials(lease.id);

  const formatType = (type: string) =>
    type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "N/A";

  return (
    <div className="bg-light min-vh-100 animate__animated animate__fadeIn">

      {/* 2. HEADER APP BAR: Consistent with Manager Headers */}
      <div className="sticky-top bg-dark text-white border-bottom shadow mx-n3 px-3 py-3" style={{ zIndex: 1020 }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button
                className="btn btn-outline-light rounded-circle border-0 shadow-sm"
                onClick={onBack}
                style={{ width: '40px', height: '40px' }}
            >
              <i className="bi bi-arrow-left fs-5"></i>
            </button>
            <div>
              <h6 className="fw-bold mb-0">Lease Ledger</h6>
              <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                 Unit {unit?.name} — {renter?.full_name}
              </div>
            </div>
          </div>
          <Button variant="primary" className="rounded-pill btn-sm px-4 fw-bold shadow-sm border-0">
             <i className="bi bi-plus-lg me-1"></i> RECORD
          </Button>
        </div>
      </div>

      {/* 3. KPI OVERVIEW: Same Card Design as Manager */}
      <div className="d-flex gap-3 overflow-auto no-scrollbar py-3 px-1">
        {[
          { label: "Current Balance", val: lease.current_balance, color: "danger", icon: "bi-wallet2" },
          { label: "Total Billed", val: stats.totalBilled, color: "primary", icon: "bi-receipt" },
          { label: "Total Paid", val: stats.totalPaid, color: "success", icon: "bi-cash-coin" },
          { label: "Maintenance", val: stats.totalExpenses, color: "warning", icon: "bi-tools" }
        ].map((s, i) => (
          <div key={i} className="col-8 col-md-3 flex-shrink-0">
            <Card className={`border-0 shadow-sm rounded-4 p-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="text-muted fw-bold text-uppercase ls-1 mb-2" style={{ fontSize: '0.6rem' }}>{s.label}</div>
              <div className="d-flex justify-content-between align-items-end">
                <div className={`h4 fw-bold text-${s.color} mb-0`}>৳{Number(s.val).toLocaleString()}</div>
                <i className={`bi ${s.icon} text-${s.color} opacity-25`}></i>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* 4. IDENTITY SECTION: Blueprint Card Style */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white mx-1 border-start border-4 border-primary">
        <h6 className="fw-bold text-muted small text-uppercase ls-1 mb-4">
            <i className="bi bi-person-badge me-2 text-primary"></i>Renter & Contract Profile
        </h6>
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 text-primary rounded-pill d-flex align-items-center justify-content-center fw-bold h4 mb-0 me-3 shadow-sm" style={{ width:'60px', height:'60px' }}>
            {renter?.full_name?.charAt(0)}
          </div>
          <div>
            <div className="fw-bold text-dark fs-5">{renter?.full_name}</div>
            <div className="text-muted small fw-bold"><i className="bi bi-telephone me-1"></i>{renter?.phone_number}</div>
          </div>
        </div>

        <div className="row g-2 pt-3 border-top border-light">
           {lease.lease_rents?.map((r: any) => (
             <div key={r.id} className="col-6 col-md-4">
               <div className="p-2 bg-light rounded-3">
                  <span className="text-muted d-block fw-bold text-uppercase ls-1" style={{ fontSize: '0.55rem' }}>{r.rent_type_name}</span>
                  <span className="fw-bold text-dark">৳{Number(r.amount).toLocaleString()}</span>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 5. STICKY SUB-TABS: Pill Design */}
      <div className="bg-white border-bottom border-top mx-n3 p-2 sticky-top shadow-sm" style={{ top: '72px', zIndex: 1010 }}>
        <div className="nav nav-pills flex-nowrap gap-2 overflow-auto no-scrollbar">
          {['invoices', 'payments', 'expenses'].map(t => (
            <button
              key={t}
              className={`nav-link rounded-pill border-0 px-4 py-2 small fw-bold flex-grow-1 transition-all ${activeTab === t ? 'bg-primary text-white shadow-sm' : 'text-muted bg-light'}`}
              onClick={() => setActiveTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 6. LISTS: Edge-to-Edge Blueprint */}
      <div className="mx-n3 bg-white mb-5 min-vh-50">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></div>
        ) : (
          <div className="vstack">
            {activeTab === 'invoices' && invoices.map(inv => (
              <div key={inv.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <div className="overflow-hidden">
                  <div className="fw-bold text-dark small">{inv.invoice_number}</div>
                  <div className="text-muted x-small fw-bold text-uppercase ls-1">
                      {inv.invoice_date} • {formatType(inv.invoice_type)}
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-dark mb-1">৳{Number(inv.amount).toLocaleString()}</div>
                  <Badge pill className={`x-small border px-2 py-1 ${inv.status === 'paid' ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                    {inv.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}

            {activeTab === 'payments' && payments.map(pay => (
              <div key={pay.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-success small text-uppercase ls-1"><i className="bi bi-arrow-down-left-circle me-1"></i>Payment Received</div>
                  <div className="text-muted x-small fw-bold">{pay.payment_date} • {pay.method?.toUpperCase()}</div>
                </div>
                <div className="fw-bold text-dark">৳{Number(pay.amount).toLocaleString()}</div>
              </div>
            ))}

            {activeTab === 'expenses' && expenses.map(exp => (
              <div key={exp.id} className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <div className="overflow-hidden pe-3">
                  <div className="fw-bold text-dark small text-truncate">{exp.title}</div>
                  <div className="text-muted x-small fw-bold text-uppercase ls-1">{exp.date} • {exp.category?.toUpperCase()}</div>
                </div>
                <div className="text-end">
                   <div className="fw-bold text-danger mb-1">-৳{Number(exp.amount).toLocaleString()}</div>
                   {exp.attachment && (
                       <a href={exp.attachment} target="_blank" className="x-small text-decoration-none fw-bold text-primary">
                           VIEW <i className="bi bi-paperclip"></i>
                       </a>
                   )}
                </div>
              </div>
            ))}

            {((activeTab === 'invoices' && invoices.length === 0) ||
              (activeTab === 'payments' && payments.length === 0) ||
              (activeTab === 'expenses' && expenses.length === 0)) && (
              <div className="text-center py-5">
                 <i className="bi bi-card-checklist display-4 text-light"></i>
                 <p className="text-muted small italic mt-2">No records found for this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}