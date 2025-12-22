import { useState } from "react";
import {Modal, Button, Form, Alert, InputGroup, Spinner, Row, Col, Badge} from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";

interface PaymentModalProps {
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = Number(invoice?.amount) || 0;
  const alreadyPaid = Number(invoice?.paid_amount) || 0;
  const remainingBalance = totalAmount - alreadyPaid;

  const generateTxnRef = (method: string) => {
    const prefix = method === 'mobile' ? 'MOB' : method.toUpperCase().substring(0, 3);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
  };

  const [formData, setFormData] = useState({
    amount: remainingBalance > 0 ? remainingBalance.toString() : "",
    method: "cash",
    transaction_reference: generateTxnRef("cash"),
    notes: `Payment for Invoice ${invoice?.invoice_number || 'Unknown'}`
  });

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value;
    setFormData(prev => ({ ...prev, method: newMethod, transaction_reference: generateTxnRef(newMethod) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.amount) > remainingBalance) {
        setError(`Limit exceeded: Balance is ৳${remainingBalance.toLocaleString()}`);
        return;
    }
    setLoading(true);
    setError(null);

    try {
      await PaymentService.create({ ...formData, invoice: invoice.id });
      notifySuccess(`Payment of ৳${Number(formData.amount).toLocaleString()} recorded!`);
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
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-cash-coin fs-5 text-success"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                Record Revenue Collection
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Ledger Entry: {invoice?.invoice_number}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-4 bg-light">
          {error && (
            <Alert variant="danger" className="border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">
                <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
            </Alert>
          )}

          {/* 2. BALANCE SUMMARY CARD (Blueprint Money Style) */}
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-white border-start border-4 border-success text-center">
            <div className="text-muted fw-bold text-uppercase ls-1 mb-1" style={{ fontSize: '0.65rem' }}>Outstanding Dues</div>
            <h2 className="fw-bold text-dark mb-2">৳{remainingBalance.toLocaleString()}</h2>
            <div className="d-flex justify-content-center gap-3 mt-1">
                <Badge bg="light" className="text-muted border fw-bold x-small ls-1">INVOICE: ৳{totalAmount.toLocaleString()}</Badge>
                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 fw-bold x-small ls-1">PAID: ৳{alreadyPaid.toLocaleString()}</Badge>
            </div>
          </div>

          <div className="vstack gap-3">
            <Form.Group>
                <Label required>Payment Amount (৳)</Label>
                <Form.Control
                    type="number" inputMode="decimal" step="0.01" required
                    className="rounded-pill bg-light border-0 py-2 ps-3 fs-5 fw-bold text-primary shadow-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                />
            </Form.Group>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Group>
                        <Label required>Collection Method</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                            value={formData.method} onChange={handleMethodChange}
                        >
                            {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Label required>Transaction Reference</Label>
                        <InputGroup className="bg-light rounded-pill overflow-hidden border-0">
                            <Form.Control
                                type="text"
                                className="bg-light border-0 py-2 ps-3 small fw-bold shadow-none"
                                value={formData.transaction_reference}
                                onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
                            />
                            <Button variant="light" className="border-0 bg-white bg-opacity-50" onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}>
                                <i className="bi bi-arrow-clockwise text-primary"></i>
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group>
                <Label>Internal Collection Notes</Label>
                <Form.Control
                    as="textarea" rows={2}
                    className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
                    placeholder="e.g. Received via bKash, late fee included..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                />
            </Form.Group>
          </div>
        </Modal.Body>

        {/* 3. FOOTER: Right-Aligned (Desktop) / Stacked (Mobile) */}
        <Modal.Footer className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row-reverse gap-2">
          <Button
            variant="success"
            type="submit"
            disabled={loading || remainingBalance <= 0}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
          >
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
            {loading ? "PROCESSING..." : "CONFIRM RECEIPT"}
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