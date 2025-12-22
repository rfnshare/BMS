import { Modal, Badge, Row, Col, Button } from "react-bootstrap";

interface Props {
  invoice: any;
  onClose: () => void;
}

export default function InvoicePreviewModal({ invoice, onClose }: Props) {
  if (!invoice) return null;

  // Standardized Status Mapping
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-success-subtle text-success border-success",
      unpaid: "bg-danger-subtle text-danger border-danger",
      draft: "bg-warning-subtle text-warning border-warning",
    };
    return map[status?.toLowerCase()] || "bg-light text-muted border";
  };

  const InfoRow = ({ label, value, color = "dark" }: any) => (
    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom border-light">
      <span className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{label}</span>
      <span className={`fw-bold text-${color} small`}>{value || "N/A"}</span>
    </div>
  );

  return (
    <Modal
      show={!!invoice}
      onHide={onClose}
      centered
      fullscreen="sm-down" // ✅ Mobile Fullscreen
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-receipt fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                Invoice Asset Preview
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Financial Record #{invoice.invoice_number}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {/* 2. FINANCIAL IMPACT SUMMARY */}
        <div className="text-center mb-4 bg-white p-4 rounded-4 shadow-sm border-bottom border-4 border-primary">
          <div className="text-muted fw-bold text-uppercase ls-1 mb-1" style={{ fontSize: '0.65rem' }}>Total Outstanding Amount</div>
          <div className="display-6 fw-bold text-primary mb-2">৳{Number(invoice.amount).toLocaleString()}</div>
          <Badge pill className={`px-3 py-2 border x-small ls-1 fw-bold ${getStatusBadge(invoice.status)}`}>
            {invoice.status?.toUpperCase()}
          </Badge>
        </div>

        <Row className="g-3">
          {/* 3. ALLOCATION CARD (Primary) */}
          <Col xs={12} md={6}>
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-primary h-100">
                <h6 className="fw-bold text-primary x-small text-uppercase ls-1 mb-3 border-bottom pb-1">
                    <i className="bi bi-person-badge me-2"></i>Target Allocation
                </h6>
                <InfoRow label="Lease Reference" value={`#LS-${invoice.lease}`} color="primary" />
                <InfoRow label="Billing Month" value={invoice.invoice_month} />
            </div>
          </Col>

          {/* 4. SPECIFICATION CARD (Success) */}
          <Col xs={12} md={6}>
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-success h-100">
                <h6 className="fw-bold text-success x-small text-uppercase ls-1 mb-3 border-bottom pb-1">
                    <i className="bi bi-calendar-check me-2"></i>Record Specs
                </h6>
                <InfoRow label="Generation Date" value={invoice.invoice_date} />
                <InfoRow label="Invoice Category" value={invoice.invoice_type?.replace('_', ' ')} />
            </div>
          </Col>

          {/* 5. INTERNAL REMARKS */}
          {invoice.description && (
            <Col xs={12}>
                <div className="p-3 bg-white shadow-sm rounded-4 border-start border-4 border-info">
                    <small className="fw-bold d-block text-uppercase ls-1 text-muted mb-1" style={{ fontSize: '0.6rem' }}>Administrative Remarks</small>
                    <p className="small text-secondary mb-0 italic">"{invoice.description}"</p>
                </div>
            </Col>
          )}
        </Row>
      </Modal.Body>

      {/* 6. FOOTER: Blueprint Pill Buttons */}
      <Modal.Footer className="border-0 p-3 p-md-4 bg-white d-flex flex-column flex-md-row justify-content-center gap-2">
        <Button
          variant="primary"
          className="rounded-pill px-4 py-2 fw-bold shadow-sm order-md-2"
          onClick={() => window.open(invoice.invoice_pdf, '_blank')}
        >
          <i className="bi bi-file-earmark-pdf me-2"></i>DOWNLOAD OFFICIAL PDF
        </Button>
        <Button
            variant="light"
            className="rounded-pill px-4 py-2 border text-muted small fw-bold order-md-1"
            onClick={onClose}
        >
          Exit Preview
        </Button>
      </Modal.Footer>
    </Modal>
  );
}