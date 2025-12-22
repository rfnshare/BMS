import { useState, useMemo } from "react";
import { Spinner, Table, Badge, Row, Col, InputGroup, Form, Button } from "react-bootstrap";
import { useInvoices } from "../../../logic/hooks/useInvoices";
import { useNotify } from "../../../logic/context/NotificationContext";
import { InvoiceService } from "../../../logic/services/invoiceService";
import InvoiceModal from "./InvoiceModal";
import InvoicePreviewModal from "./InvoicePreviewModal";

export default function InvoiceManager() {
  const { success, error } = useNotify();
  const [filters, setFilters] = useState({
    status: "", search: "", page: 1, invoice_month: "", invoice_type: "", lease: ""
  });

  const { data, loading, isGenerating, cache, actions } = useInvoices(filters);
  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'preview' | null, data: any }>({ type: null, data: null });

  // 1. REVENUE STATS (KPI Logic)
  const stats = useMemo(() => {
    const results = data.results || [];
    return {
      unpaidCount: results.filter((i: any) => i.status === 'unpaid').length,
      unpaidAmount: results.filter((i: any) => i.status === 'unpaid').reduce((acc: number, i: any) => acc + Number(i.amount), 0),
      collected: results.filter((i: any) => i.status === 'paid').reduce((acc: number, i: any) => acc + Number(i.amount), 0),
      total: data.count || 0
    };
  }, [data]);

  const handleBulkGenerate = async () => {
    try {
      await actions.generate();
      success("Revenue Pipeline: Bulk invoices generated for the current period.");
    } catch (err) {
      error("Action Denied: Bulk generation failed.");
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-success-subtle text-success border-success",
      unpaid: "bg-danger-subtle text-danger border-danger",
      draft: "bg-warning-subtle text-warning border-warning",
    };
    return map[status?.toLowerCase()] || "bg-light text-muted border";
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 2. INDUSTRIAL HEADER: Right-Aligned Actions */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">

            {/* Identity Block (Left) */}
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-receipt-cutoff fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Revenue Pipeline</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                  {isGenerating ? "Processing Automated Billing Run..." : "Financial Control & Ledger Management"}
                </p>
              </div>
            </div>

            {/* Action Stack (Right-Aligned via ms-md-auto) */}
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
              <Button
                variant="light"
                className="rounded-pill px-3 fw-bold small border text-muted d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                onClick={handleBulkGenerate}
                disabled={isGenerating || loading}
              >
                {isGenerating ? <Spinner animation="border" size="sm" /> : <i className="bi bi-lightning-charge text-warning"></i>}
                <span className="ls-1">GENERATE</span>
              </Button>

              <Button
                variant="primary"
                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0 ls-1"
                onClick={() => setActiveModal({ type: 'edit', data: null })}
                disabled={isGenerating}
              >
                <i className="bi bi-plus-lg"></i>
                <span>NEW INVOICE</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI OVERVIEW */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Unpaid", val: stats.unpaidCount, color: "danger", icon: "bi-exclamation-octagon" },
          { label: "Pending Revenue", val: `৳${stats.unpaidAmount.toLocaleString()}`, color: "warning", icon: "bi-cash-stack" },
          { label: "Collected", val: `৳${stats.collected.toLocaleString()}`, color: "success", icon: "bi-piggy-bank" },
          { label: "Archives", val: stats.total, color: "primary", icon: "bi-receipt" },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-${s.color} fs-5 fs-md-4`}>
                {typeof s.val === 'number' ? s.val.toString().padStart(2, '0') : s.val}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. FILTER PILL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
        <Row className="g-2">
            <Col xs={12} md={4}>
                <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                    <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                    <Form.Control
                        className="bg-light border-0 py-2 shadow-none fw-medium"
                        placeholder="Search Renter Designation..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                    />
                </InputGroup>
            </Col>
            <Col xs={6} md={2}>
                <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}>
                    <option value="">All Status</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                </Form.Select>
            </Col>
            <Col xs={6} md={2}>
                <Form.Control type="month" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted" value={filters.invoice_month} onChange={(e) => setFilters({...filters, invoice_month: e.target.value, page: 1})} />
            </Col>
            <Col xs={6} md={2}>
                <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none" value={filters.invoice_type} onChange={(e) => setFilters({...filters, invoice_type: e.target.value, page: 1})}>
                    <option value="">All Types</option>
                    <option value="rent">Rent</option>
                    <option value="security_deposit">Deposit</option>
                </Form.Select>
            </Col>
            <Col xs={6} md={2}>
                <Form.Control type="number" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted" placeholder="Lease ID" value={filters.lease} onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})} />
            </Col>
        </Row>
      </div>

      {/* 5. DATA VIEW */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white">
        <div className="table-responsive d-none d-md-block">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr className="x-small fw-bold text-muted text-uppercase ls-1">
                <th className="ps-4 py-3">Asset Record</th>
                <th>Renter Identity</th>
                <th>Amount</th>
                <th className="text-center">Status</th>
                <th className="pe-4 text-end">Management</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.results.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
              ) : data.results.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark small">#{inv.invoice_number}</div>
                    <div className="text-muted x-small fw-bold ls-1">{inv.invoice_date}</div>
                  </td>
                  <td>
                    <div className="fw-bold small text-primary">{cache[inv.lease]?.renter || "..."}</div>
                    <div className="text-muted x-small fw-bold ls-1">{cache[inv.lease]?.unit || "..."}</div>
                  </td>
                  <td><div className="fw-bold text-dark small font-monospace">৳{Number(inv.amount).toLocaleString()}</div></td>
                  <td className="text-center">
                    <Badge pill className={`border px-3 py-2 fw-bold text-uppercase ls-1 ${getStatusBadge(inv.status)}`} style={{fontSize: '0.65rem'}}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                      <button className="btn btn-sm btn-white border-end px-3" onClick={() => window.open(inv.invoice_pdf, '_blank')} title="PDF"><i className="bi bi-file-earmark-pdf text-danger"></i></button>
                      <button className="btn btn-sm btn-white border-end px-3" onClick={() => setActiveModal({type: 'preview', data: inv})} title="View"><i className="bi bi-speedometer2 text-primary"></i></button>
                      <button className="btn btn-sm btn-white border-end px-3" onClick={() => setActiveModal({type: 'edit', data: inv})} title="Edit"><i className="bi bi-pencil-square text-warning"></i></button>
                      <button className="btn btn-sm btn-white px-3 text-danger" onClick={async () => { if(confirm("Purge?")) { await InvoiceService.destroy(inv.id); actions.refresh(); }}} title="Delete"><i className="bi bi-trash3"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* MOBILE VIEW (CARDS) */}
        <div className="d-block d-md-none vstack gap-2 p-2">
            {data.results.map((inv: any) => (
                <div key={inv.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold text-dark small">#{inv.invoice_number}</div>
                        <Badge pill className={`border x-small fw-bold ls-1 ${getStatusBadge(inv.status)}`}>{inv.status.toUpperCase()}</Badge>
                    </div>
                    <div className="small mb-3">
                        <div className="fw-bold text-primary">{cache[inv.lease]?.renter || "..."}</div>
                        <div className="text-muted x-small fw-bold ls-1">{cache[inv.lease]?.unit || "..."}</div>
                        <div className="fw-bold text-dark mt-1 font-monospace">৳{Number(inv.amount).toLocaleString()}</div>
                    </div>
                    <div className="btn-group w-100 shadow-sm border rounded-pill overflow-hidden bg-white">
                        <button className="btn btn-white py-2 border-end" onClick={() => window.open(inv.invoice_pdf, '_blank')}><i className="bi bi-file-earmark-pdf text-danger"></i></button>
                        <button className="btn btn-white py-2 border-end" onClick={() => setActiveModal({type: 'preview', data: inv})}><i className="bi bi-speedometer2 text-primary"></i></button>
                        <button className="btn btn-white py-2 border-end" onClick={() => setActiveModal({type: 'edit', data: inv})}><i className="bi bi-pencil-square text-warning"></i></button>
                        <button className="btn btn-white py-2 text-danger" onClick={async () => { if(confirm("Purge?")) { await InvoiceService.destroy(inv.id); actions.refresh(); }}}><i className="bi bi-trash3"></i></button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* 6. MODALS */}
      {activeModal.type === 'edit' && <InvoiceModal invoice={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} onSaved={actions.refresh} />}
      {activeModal.type === 'preview' && <InvoicePreviewModal invoice={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} />}
    </div>
  );
}