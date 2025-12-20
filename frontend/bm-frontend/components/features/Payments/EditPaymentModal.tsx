import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface EditPaymentModalProps {
  payment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPaymentModal({ payment, onClose, onSuccess }: EditPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: payment.amount,
    method: payment.method,
    transaction_reference: payment.transaction_reference,
    notes: payment.notes
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await PaymentService.update(payment.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down">
      <Modal.Header closeButton className="p-3">
        <Modal.Title className="h6 fw-bold mb-0">Edit Payment Details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 flex-grow-1 overflow-auto">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Payment Method</Form.Label>
            <Form.Select className="py-2 rounded-3" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
              {PaymentService.getMethods().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Reference ID</Form.Label>
            <Form.Control type="text" className="py-2 rounded-3" value={formData.transaction_reference} onChange={e => setFormData({...formData, transaction_reference: e.target.value})}/>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-muted text-uppercase">Notes</Form.Label>
            <Form.Control as="textarea" rows={3} className="rounded-3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </Form.Group>

          <div className="alert alert-warning border-0 rounded-4 small py-3 d-flex gap-3">
             <i className="bi bi-exclamation-triangle-fill fs-4"></i>
             <div>
                <strong>Caution:</strong> Changing amount here doesn't auto-update invoice balances. Reverse the transaction if a full refund is needed.
             </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top p-3 bg-light">
          <Button variant="outline-secondary" className="border-0 d-md-none me-auto" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading} className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}