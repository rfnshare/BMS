import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Container, Button } from "react-bootstrap";

export default function RenterInvoiceManager() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices/");
      setInvoices(res.data.results || res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  const filteredData = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  return (
    <div className="bg-light min-vh-100 pb-5">

      {/* 1. STATIC PAGE HEADER
          This part stays at the top and scrolls away.
      */}
      <Container fluid className="px-2 px-md-0 mb-3" style={{ maxWidth: '800px' }}>
        <div className="d-flex justify-content-between align-items-start pt-2">
          <div>
            <h5 className="fw-bold text-dark mb-1">My Invoices</h5>
            <p className="text-muted x-small mb-0">Track your billing history and receipts.</p>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-pill px-3 fw-bold d-flex align-items-center gap-2 border-2"
            onClick={loadInvoices}
          >
            {loading ? <Spinner size="sm" /> : <i className="bi bi-info-circle"></i>}
            <span className="d-none d-sm-inline">Live Data Sync</span>
          </Button>
        </div>
      </Container>

      {/* 2. STICKY FILTER BAR
          - No Title or Sync button here (Fixed the duplication)
          - top: 70px ensures it sits flush under the global Topbar
      */}
      <div
        className="sticky-top bg-white border-bottom shadow-sm px-3 py-2 mb-3"
        style={{ zIndex: 1020, top: '70px' }}
      >
        <Container fluid className="px-0" style={{ maxWidth: '800px' }}>
          <div className="btn-group p-1 bg-light rounded-pill w-100 overflow-auto no-scrollbar flex-nowrap">
            {['all', 'paid', 'unpaid'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm rounded-pill py-2 fw-bold text-uppercase flex-grow-1 border-0 ${filter === s ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* 3. INVOICE LIST */}
      <Container fluid className="px-2 px-md-0" style={{ maxWidth: '800px' }}>
        {loading && invoices.length === 0 ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-5 text-muted border rounded-4 bg-white shadow-sm">
            No {filter} invoices found.
          </div>
        ) : (
          <div className="vstack gap-3">
            {filteredData.map((inv) => (
              <div key={inv.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className={`p-1 ${inv.status === 'paid' ? 'bg-success' : 'bg-warning'}`}></div>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <div className="fw-bold text-primary small">#{inv.invoice_number}</div>
                        <div className="x-small text-muted text-uppercase fw-bold">
                            {inv.invoice_type?.replace('_', ' ')} • {inv.invoice_month || 'Current'}
                        </div>
                    </div>
                    <Badge pill bg={inv.status === 'paid' ? 'success' : 'danger'} className="text-uppercase x-small px-3">
                      {inv.status}
                    </Badge>
                  </div>
                  <div className="h3 fw-bold text-dark mb-3">৳{Number(inv.amount).toLocaleString()}</div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light">
                    <div className="x-small text-muted fw-bold">DUE: <span className="text-dark">{inv.due_date}</span></div>
                    {inv.invoice_pdf && (
                      <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" className="btn btn-sm btn-danger rounded-pill px-3 fw-bold shadow-sm">
                        <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}