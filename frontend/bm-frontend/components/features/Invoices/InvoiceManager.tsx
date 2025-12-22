import { useState } from "react";
import { Spinner, Table, Badge, Row, Col } from "react-bootstrap";
import { useInvoices } from "../../../logic/hooks/useInvoices";
import { useNotify } from "../../../logic/context/NotificationContext";
import { InvoiceService } from "../../../logic/services/invoiceService";
import InvoiceModal from "./InvoiceModal";
import InvoicePreviewModal from "./InvoicePreviewModal";

export default function InvoiceManager() {
  const { success, error } = useNotify(); // Using your Notification Context
  const [filters, setFilters] = useState({
    status: "", search: "", page: 1, invoice_month: "", invoice_type: "", lease: ""
  });

  // ✅ Destructured 'isGenerating' to track background bulk processing
  const { data, loading, isGenerating, cache, actions } = useInvoices(filters);
  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'preview' | null, data: any }>({ type: null, data: null });

  // ✅ Functional Bulk Generate Handler
  const handleBulkGenerate = async () => {
    try {
      await actions.generate();
      success("Success! Bulk invoices generated for the current period.");
    } catch (err) {
      error("Failed to generate bulk invoices. Please check server logs.");
    }
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      paid: "bg-success-subtle text-success border-success-subtle",
      unpaid: "bg-danger-subtle text-danger border-danger-subtle",
      draft: "bg-warning-subtle text-warning border-warning-subtle",
    };
    return map[status] || "bg-light text-dark border";
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. HEADER CARD (Design Preserved) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">Invoice Manager</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold" style={{letterSpacing: '0.5px'}}>
                {isGenerating ? "Processing Bulk Run..." : "Revenue & Billing Control"}
              </p>
            </div>
            <div className="d-flex gap-2">
              {/* ✅ Generate Button made functional with Loading State */}
              <button
                className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm py-2 d-flex align-items-center gap-2"
                onClick={handleBulkGenerate}
                disabled={isGenerating || loading}
              >
                {isGenerating ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <i className="bi bi-lightning-charge-fill"></i>
                )}
                <span>{isGenerating ? "Generating..." : "Generate"}</span>
              </button>

              <button
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm py-2"
                onClick={() => setActiveModal({ type: 'edit', data: null })}
                disabled={isGenerating}
              >
                <i className="bi bi-plus-lg me-2"></i>New Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRESERVED FILTER ROW */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
        <Row className="g-2">
            <Col xs={12} md={3}>
                <input
                    type="text"
                    className="form-control bg-light border-0 px-3 rounded-pill small py-2"
                    placeholder="Search Renter/Unit..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                />
            </Col>
            <Col xs={6} md={2}>
                <select
                    className="form-select bg-light border-0 ps-3 rounded-pill small py-2"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                >
                    <option value="">Status</option>
                    <option value="draft">Draft</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                </select>
            </Col>
            <Col xs={6} md={2}>
                <input
                    type="month"
                    className="form-control bg-light border-0 px-3 rounded-pill small py-2"
                    value={filters.invoice_month}
                    onChange={(e) => setFilters({...filters, invoice_month: e.target.value, page: 1})}
                />
            </Col>
            <Col xs={6} md={3}>
                <select
                    className="form-select bg-light border-0 ps-3 rounded-pill small py-2"
                    value={filters.invoice_type}
                    onChange={(e) => setFilters({...filters, invoice_type: e.target.value, page: 1})}
                >
                    <option value="">All Types</option>
                    <option value="rent">Rent</option>
                    <option value="security_deposit">Deposit</option>
                </select>
            </Col>
            <Col xs={6} md={2}>
                <input
                    type="number"
                    className="form-control bg-light border-0 px-3 rounded-pill small py-2"
                    placeholder="Lease ID"
                    value={filters.lease}
                    onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})}
                />
            </Col>
        </Row>
      </div>

      {/* 3. TABLE/MOBILE VIEWS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white">
        <div className="table-responsive d-none d-md-block">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr className="x-small fw-bold text-muted text-uppercase">
                <th className="ps-4 py-3">Invoice Details</th>
                <th>Renter & Unit</th>
                <th>Amount</th>
                <th className="text-center">Status</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
              ) : data.results.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark small">{inv.invoice_number}</div>
                    <div className="text-muted x-small">{inv.invoice_date}</div>
                  </td>
                  <td>
                    <div className="fw-bold small text-primary">{cache[inv.lease]?.renter || "..."}</div>
                    <div className="text-muted x-small">{cache[inv.lease]?.unit || "..."} (LS-{inv.lease})</div>
                  </td>
                  <td><div className="fw-bold text-dark small">৳{Number(inv.amount).toLocaleString()}</div></td>
                  <td className="text-center">
                    <Badge pill className={`border px-3 py-2 fw-bold text-capitalize ${getStatusBadge(inv.status)}`} style={{fontSize: '0.7rem'}}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                      <button className="btn btn-sm btn-white border-end" onClick={() => window.open(inv.invoice_pdf, '_blank')}><i className="bi bi-file-earmark-pdf text-danger"></i></button>
                      <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'preview', data: inv})}><i className="bi bi-eye text-primary"></i></button>
                      <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'edit', data: inv})}><i className="bi bi-pencil-square text-warning"></i></button>
                      <button className="btn btn-sm btn-white" onClick={async () => { if(confirm("Delete?")) { await InvoiceService.destroy(inv.id); success("Invoice deleted."); actions.refresh(); }}}><i className="bi bi-trash3 text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* MOBILE CARDS */}
        <div className="d-block d-md-none">
          {data.results.map((inv: any) => (
            <div key={inv.id} className="p-3 border-bottom position-relative bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-bold text-dark">{inv.invoice_number}</div>
                <Badge pill className={`border x-small ${getStatusBadge(inv.status)}`}>{inv.status.toUpperCase()}</Badge>
              </div>
              <div className="small mb-3">
                <div className="fw-bold text-primary">{cache[inv.lease]?.renter || "..."}</div>
                <div className="text-muted x-small">{cache[inv.lease]?.unit || "..."}</div>
                <div className="fw-bold mt-1">৳{Number(inv.amount).toLocaleString()}</div>
              </div>
              <div className="btn-group w-100 shadow-sm border rounded-pill overflow-hidden bg-white">
                <button className="btn btn-white py-2 border-end" onClick={() => window.open(inv.invoice_pdf, '_blank')}><i className="bi bi-file-earmark-pdf text-danger"></i></button>
                <button className="btn btn-white py-2 border-end" onClick={() => setActiveModal({type: 'preview', data: inv})}><i className="bi bi-eye text-primary"></i></button>
                <button className="btn btn-white py-2 border-end" onClick={() => setActiveModal({type: 'edit', data: inv})}><i className="bi bi-pencil-square text-warning"></i></button>
                <button className="btn btn-white py-2 text-danger" onClick={async () => { if(confirm("Delete?")) { await InvoiceService.destroy(inv.id); success("Invoice deleted."); actions.refresh(); }}}><i className="bi bi-trash3"></i></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PAGINATION */}
      <div className="p-3 bg-white rounded-4 shadow-sm border d-flex justify-content-between align-items-center mt-3">
        <span className="text-muted x-small fw-bold">TOTAL: {data.count}</span>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</button>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
        </div>
      </div>

      {/* MODALS */}
      {activeModal.type === 'edit' && <InvoiceModal invoice={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} onSaved={actions.refresh} />}
      {activeModal.type === 'preview' && <InvoicePreviewModal invoice={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} />}
    </div>
  );
}