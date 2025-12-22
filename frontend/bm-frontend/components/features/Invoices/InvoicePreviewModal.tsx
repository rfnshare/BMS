import { Modal, Badge, Row, Col, Button } from "react-bootstrap";

interface Props {
  invoice: any;
  onClose: () => void;
}

export default function InvoicePreviewModal({ invoice, onClose }: Props) {
  if (!invoice) return null;

  return (
    <Modal show onHide={onClose} centered contentClassName="border-0 shadow-lg rounded-4">
      <Modal.Header closeButton className="bg-light rounded-top-4 border-0">
        <Modal.Title className="h6 fw-bold mb-0">Invoice Detail: {invoice.invoice_number}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <div className="display-6 fw-bold text-primary">৳{Number(invoice.amount).toLocaleString()}</div>
          <p className="text-muted small text-uppercase fw-bold mt-1">Total Amount Due</p>
          <Badge pill className={`px-3 py-2 border ${invoice.status === 'paid' ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
            {invoice.status.toUpperCase()}
          </Badge>
        </div>

        <hr className="border-dashed" />

        <Row className="gy-3">
          <Col xs={6}>
            <div className="x-small text-muted fw-bold text-uppercase">Renter Information</div>
            <div className="fw-bold text-dark">Lease ID: LS-{invoice.lease}</div>
          </Col>
          <Col xs={6} className="text-end">
            <div className="x-small text-muted fw-bold text-uppercase">Billing Month</div>
            <div className="fw-bold text-dark">{invoice.invoice_month}</div>
          </Col>
          <Col xs={6}>
            <div className="x-small text-muted fw-bold text-uppercase">Date Created</div>
            <div className="text-dark small">{invoice.invoice_date}</div>
          </Col>
          <Col xs={6} className="text-end">
            <div className="x-small text-muted fw-bold text-uppercase">Invoice Type</div>
            <div className="text-dark small text-capitalize">{invoice.invoice_type.replace('_', ' ')}</div>
          </Col>
        </Row>

        {invoice.notes && (
          <div className="mt-4 p-3 bg-light rounded-3 small">
            <div className="fw-bold text-muted mb-1 x-small text-uppercase">Notes:</div>
            {invoice.notes}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pb-4">
        <Button
          variant="outline-primary"
          className="rounded-pill px-4 fw-bold me-2"
          onClick={() => window.open(invoice.invoice_pdf, '_blank')}
        >
          <i className="bi bi-file-earmark-pdf me-2"></i>Download PDF
        </Button>
        <Button variant="secondary" className="rounded-pill px-4 fw-bold" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}