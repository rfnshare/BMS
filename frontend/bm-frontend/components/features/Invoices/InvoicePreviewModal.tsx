import { Modal, Badge, Button, Row, Col } from "react-bootstrap";

export default function InvoicePreviewModal({ invoice, onClose }: { invoice: any, onClose: () => void }) {
  if (!invoice) return null;

  return (
    /* 🔥 fullscreen="sm-down" makes the preview occupy the whole screen on phones */
    <Modal show onHide={onClose} size="lg" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4">
        <Modal.Title className="fw-bold h6 mb-0">
          <i className="bi bi-receipt me-2 text-warning"></i> {invoice.invoice_number}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light">
        <div className="p-3 p-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-3">
            {/* Header Row: Date & Status */}
            <Row className="mb-4 align-items-center">
              <Col xs={6}>
                <div className="text-muted x-small text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Invoice Date</div>
                <div className="fw-bold small">{invoice.invoice_date}</div>
              </Col>
              <Col xs={6} className="text-end">
                <Badge bg={invoice.status === 'paid' ? 'success' : 'danger'} className="px-3 py-2 rounded-pill shadow-sm">
                  {invoice.status?.toUpperCase()}
                </Badge>
              </Col>
            </Row>

            {/* Billing Row: Stacks vertically on mobile */}
            <Row className="g-3 border-bottom pb-4 mb-4">
              <Col xs={12} md={6}>
                <h6 className="fw-bold text-muted small text-uppercase" style={{ fontSize: '0.65rem' }}>Billed To</h6>
                <div className="fw-bold fs-6">Lease ID: {invoice.lease}</div>
                <div className="text-muted small">Month: {invoice.invoice_month || "Standard Invoice"}</div>
              </Col>
              <Col xs={12} md={6} className="text-md-end">
                <h6 className="fw-bold text-muted small text-uppercase" style={{ fontSize: '0.65rem' }}>Payment Terms</h6>
                <div className="text-danger fw-bold small">Due: {invoice.due_date}</div>
              </Col>
            </Row>

            {/* Items Section */}
            <div className="bg-light p-3 rounded-4 mb-4 border border-white">
              <div className="d-flex justify-content-between fw-bold small text-muted text-uppercase mb-2" style={{ fontSize: '0.6rem' }}>
                <span>Description</span>
                <span>Amount</span>
              </div>
              <hr className="mt-0 mb-3 opacity-10" />
              <div className="d-flex justify-content-between align-items-start">
                <div style={{ maxWidth: '70%' }}>
                  <div className="fw-bold text-capitalize small">{invoice.invoice_type.replace('_', ' ')}</div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                    {invoice.description || "Monthly service charge."}
                  </p>
                </div>
                <div className="fw-bold text-dark h5 mb-0">৳{Number(invoice.amount).toLocaleString()}</div>
              </div>
            </div>

            {/* Totals Section */}
            <div className="vstack gap-2 text-end">
              <div className="d-flex justify-content-between justify-content-md-end">
                <span className="text-muted small me-md-3">Paid Amount:</span>
                <span className="fw-bold small text-success">৳{Number(invoice.paid_amount || 0).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between justify-content-md-end align-items-center">
                <span className="text-muted fw-bold small me-md-3">Balance Due:</span>
                <span className="fw-bold text-primary h4 mb-0">৳{Number(invoice.amount - (invoice.paid_amount || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top p-3 flex-column flex-md-row">
        {invoice.invoice_pdf && (
          <Button
            variant="outline-danger"
            className="rounded-pill px-4 w-100 w-md-auto mb-2 mb-md-0 fw-bold"
            onClick={() => window.open(invoice.invoice_pdf, '_blank')}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Download PDF
          </Button>
        )}
        <Button variant="dark" className="rounded-pill px-4 w-100 w-md-auto fw-bold" onClick={onClose}>
          Close Preview
        </Button>
      </Modal.Footer>
    </Modal>
  );
}