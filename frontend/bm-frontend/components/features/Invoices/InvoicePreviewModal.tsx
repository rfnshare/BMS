import { Modal, Badge, Button, Row, Col } from "react-bootstrap";

export default function InvoicePreviewModal({ invoice, onClose }: { invoice: any, onClose: () => void }) {
  if (!invoice) return null;

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white p-4">
        <Modal.Title className="fw-bold">
          <i className="bi bi-receipt me-2"></i> {invoice.invoice_number}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-3">
          <Row className="mb-4">
            <Col xs={6}>
              <div className="text-muted x-small text-uppercase fw-bold">Invoice Date</div>
              <div className="fw-bold">{invoice.invoice_date}</div>
            </Col>
            <Col xs={6} className="text-end">
              <Badge bg={invoice.status === 'paid' ? 'success' : 'danger'} className="px-3 py-2 rounded-pill">
                {invoice.status?.toUpperCase()}
              </Badge>
            </Col>
          </Row>

          <Row className="g-3 border-bottom pb-4 mb-4">
            <Col md={6}>
              <h6 className="fw-bold text-muted small text-uppercase">Billed To</h6>
              <div className="fw-bold fs-5">Lease ID: {invoice.lease}</div>
              <div className="text-muted small">Month: {invoice.invoice_month || "Standard Invoice"}</div>
            </Col>
            <Col md={6} className="text-md-end">
              <h6 className="fw-bold text-muted small text-uppercase">Payment Terms</h6>
              <div className="text-danger fw-bold">Due: {invoice.due_date}</div>
            </Col>
          </Row>

          <div className="bg-light p-3 rounded-4 mb-4">
            <Row>
              <Col xs={8} className="fw-bold">Description</Col>
              <Col xs={4} className="text-end fw-bold">Amount</Col>
            </Row>
            <hr />
            <Row>
              <Col xs={8}>
                <div className="fw-bold text-capitalize">{invoice.invoice_type.replace('_', ' ')}</div>
                <p className="text-muted x-small mb-0">{invoice.description || "Monthly service charge."}</p>
              </Col>
              <Col xs={4} className="text-end fw-bold fs-5">৳{Number(invoice.amount).toLocaleString()}</Col>
            </Row>
          </div>

          <Row className="text-end g-2">
            <Col xs={12}>
              <span className="text-muted me-3">Paid Amount:</span>
              <span className="fw-bold">৳{Number(invoice.paid_amount || 0).toLocaleString()}</span>
            </Col>
            <Col xs={12}>
              <span className="text-muted me-3 fs-5">Balance Due:</span>
              <span className="fw-bold text-primary fs-4">৳{Number(invoice.amount - (invoice.paid_amount || 0)).toLocaleString()}</span>
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        {invoice.invoice_pdf && (
          <Button
            variant="outline-danger"
            className="rounded-pill px-4"
            onClick={() => window.open(invoice.invoice_pdf, '_blank')}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Download PDF
          </Button>
        )}
        <Button variant="dark" className="rounded-pill px-4" onClick={onClose}>Close Preview</Button>
      </Modal.Footer>
    </Modal>
  );
}