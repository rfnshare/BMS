import { useEffect, useState, useMemo } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, Row, Col, Table, Button } from "react-bootstrap";

export default function RenterInvoiceManager() {
  const { error: notifyError } = useNotify();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices/");
      setInvoices(res.data.results || res.data);
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  // 1. CALCULATE RAW STATS (Ensuring numeric types)
  const stats = useMemo(() => {
    return {
      totalBilled: invoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
      totalPaid: invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
      pendingCount: invoices.filter(i => i.status === 'unpaid').length,
      totalRecords: invoices.length
    };
  }, [invoices]);

  // 2. FIX TS2365: Map Display logic to separate Raw vs Display values
  const kpiData = useMemo(() => [
    { label: "Gross Billing", display: `৳${stats.totalBilled.toLocaleString()}`, raw: stats.totalBilled, color: "primary", icon: "bi-bank" },
    { label: "Total Settled", display: `৳${stats.totalPaid.toLocaleString()}`, raw: stats.totalPaid, color: "success", icon: "bi-check2-circle" },
    { label: "Pending Dues", display: stats.pendingCount.toString().padStart(2, '0'), raw: stats.pendingCount, color: "danger", icon: "bi-exclamation-octagon" },
    { label: "Registry Vol.", display: stats.totalRecords.toString().padStart(2, '0'), raw: stats.totalRecords, color: "info", icon: "bi-archive" },
  ], [stats]);

  const filteredData = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-success-subtle text-success border-success",
      unpaid: "bg-danger-subtle text-danger border-danger",
      draft: "bg-warning-subtle text-warning border-warning"
    };
    return (
      <Badge pill className={`px-3 py-2 fw-bold ls-1 text-uppercase border ${map[status] || 'bg-light'}`} style={{ fontSize: '0.65rem' }}>
        {status}
      </Badge>
    );
  };

  if (loading && invoices.length === 0) return (
    <div className="text-center py-5 vstack gap-3 animate__animated animate__fadeIn">
      <Spinner animation="grow" variant="primary" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Synchronizing Billing Records...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">
      {/* HEADER BLOCK */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-receipt-cutoff fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Billing Archive</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Official Ledger Statements</p>
              </div>
            </div>
            <div className="ms-md-auto">
              <Button variant="light" className="rounded-pill px-4 fw-bold small border ls-1 text-muted shadow-sm" onClick={loadInvoices}>
                <i className="bi bi-arrow-clockwise me-2"></i>SYNC LEDGER
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI OVERVIEW (Type-Safe Fix Applied Here) */}
      <Row className="g-2 g-md-3 mb-4">
        {kpiData.map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              {/* FIX: Comparison s.raw > 0 is now type-safe because 'raw' is always a number */}
              <div className={`h4 fw-bold mb-0 text-${s.color === 'danger' && s.raw > 0 ? 'danger' : 'dark'} fs-5 fs-md-4 font-monospace`}>
                {s.display}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* FILTER BAR */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-2 rounded-pill shadow-sm border px-3">
        <div className="btn-group p-1 bg-light rounded-pill">
          {['all', 'paid', 'unpaid'].map((s) => (
            <Button
              key={s}
              variant={filter === s ? 'primary' : 'transparent'}
              className={`rounded-pill px-3 px-md-4 fw-bold x-small ls-1 border-0 ${filter === s ? 'shadow-sm text-white' : 'text-muted'}`}
              onClick={() => setFilter(s)}
            >
              {s.toUpperCase()}
            </Button>
          ))}
        </div>
        <div className="text-muted x-small fw-bold ls-1 text-uppercase d-none d-md-block">
          Syncing {filteredData.length} records
        </div>
      </div>

      {/* DATA TABLE (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 d-none d-md-block">
        <Table hover className="align-middle mb-0 font-monospace-ledger">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
              <th className="ps-4 py-3">Audit Record</th>
              <th>Category</th>
              <th>Month</th>
              <th>Amount</th>
              <th className="text-center">Status</th>
              <th className="pe-4 text-end">Archive</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((inv) => (
              <tr key={inv.id}>
                <td className="ps-4">
                  <div className="fw-bold text-dark small font-monospace">#{inv.invoice_number}</div>
                  <div className="text-muted x-small fw-bold ls-1 opacity-75">DUE: {inv.due_date}</div>
                </td>
                <td>
                  <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 fw-bold x-small ls-1 text-uppercase">
                    {inv.invoice_type.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="small fw-bold text-muted text-uppercase ls-1">{inv.invoice_month || 'N/A'}</td>
                <td className="fw-bold text-dark font-monospace">৳{Number(inv.amount).toLocaleString()}</td>
                <td className="text-center">{getStatusBadge(inv.status)}</td>
                <td className="pe-4 text-end">
                  {inv.invoice_pdf ? (
                    <Button variant="white" size="sm" className="rounded-pill border shadow-sm px-3 fw-bold x-small ls-1" onClick={() => window.open(inv.invoice_pdf, '_blank')}>
                      <i className="bi bi-file-earmark-pdf me-1 text-danger"></i> PDF
                    </Button>
                  ) : <span className="text-muted x-small fw-bold ls-1 opacity-50 font-italic">PENDING</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* MOBILE FEED */}
      <div className="d-block d-md-none vstack gap-2 p-2">
        {filteredData.map((inv) => (
          <div key={inv.id} className={`card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 ${inv.status === 'paid' ? 'border-success' : 'border-danger'}`}>
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fw-bold text-dark font-monospace small">#{inv.invoice_number}</div>
                <div className="fw-bold text-dark font-monospace">৳{Number(inv.amount).toLocaleString()}</div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-light">
                <span className="x-small text-muted fw-bold ls-1 text-uppercase">{inv.invoice_type.replace('_', ' ')}</span>
                {getStatusBadge(inv.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}