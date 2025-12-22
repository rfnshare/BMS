import { useState } from "react";
import { Modal, Button, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";

interface EditPaymentModalProps {
  payment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPaymentModal({ payment, onClose, onSuccess }: EditPaymentModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: payment.amount,
    method: payment.method,
    transaction_reference: payment.transaction_reference,
    notes: payment.notes,
    lease: payment.lease,
    invoice: payment.invoice
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await PaymentService.update(payment.id, formData);
      notifySuccess("Financial Audit: Transaction record synchronized.");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Form.Label className="x-small fw-bold text-muted text-uppercase mb-1 ls-1">
      {children} {required && <span className="text-danger">*</span>}
    </Form.Label>
  );

  return (
    <Modal
        show onHide={onClose} centered
        fullscreen="sm-down"
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme (Audit Variant) */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-warning bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-pencil-square fs-5 text-warning"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                Edit Transaction Record
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Audit Protocol: Entry #{payment.id}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-4 bg-light">
          {error && (
            <Alert variant="danger" className="border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </Alert>
          )}

          {/* 2. AUDIT CONTEXT CARD */}
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-primary mb-4">
             <div className="d-flex align-items-center gap-3">
                <i className="bi bi-info-circle-fill text-primary fs-4"></i>
                <div className="small fw-bold text-dark ls-1">
                   Audit Note: This record is linked to <span className="text-primary">Lease LS-{payment.lease}</span>.
                   Ensure changes match bank statements.
                </div>
             </div>
          </div>

          <div className="vstack gap-3">
            <Form.Group>
                <Label required>Revised Amount (৳)</Label>
                <Form.Control
                    type="number" step="0.01" required
                    className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold text-primary shadow-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                />
            </Form.Group>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Group>
                        <Label required>Payment Method</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                            value={formData.method}
                            onChange={e => setFormData({...formData, method: e.target.value})}
                        >
                            {PaymentService.getMethods().map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Label required>Reference ID</Label>
                        <Form.Control
                            type="text"
                            className="rounded-pill bg-light border-0 py-2 ps-3 font-monospace small shadow-none"
                            value={formData.transaction_reference}
                            onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group>
                <Label>Internal Audit Notes</Label>
                <Form.Control
                    as="textarea" rows={3}
                    className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
                    placeholder="Provide justification for this correction..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                />
            </Form.Group>

            {/* 3. LOGICAL CAUTION CARD */}
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-warning mt-2">
                <div className="d-flex gap-2 align-items-center">
                    <i className="bi bi-shield-exclamation text-warning fs-5"></i>
                    <div className="x-small fw-bold text-muted ls-1 text-uppercase">
                        Logic Constraint: Changes do not re-calculate auto-invoice status.
                    </div>
                </div>
            </div>
          </div>
        </Modal.Body>

        {/* 4. FOOTER: Right-Aligned (Desktop) / Stacked (Mobile) */}
        <Modal.Footer className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row-reverse gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
          >
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
            {loading ? "SYNCING..." : "COMMIT CHANGES"}
          </Button>
          <Button
            variant="light"
            className="w-100 w-md-auto rounded-pill px-4 py-2 border text-muted small fw-bold ls-1"
            onClick={onClose}
          >
            DISCARD
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}