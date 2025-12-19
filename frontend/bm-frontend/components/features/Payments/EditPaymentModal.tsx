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
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Payment Details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              value={formData.method}
              onChange={e => setFormData({...formData, method: e.target.value})}
            >
              {PaymentService.getMethods().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reference / Transaction ID</Form.Label>
            <Form.Control
              type="text"
              value={formData.transaction_reference}
              onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Internal Notes</Form.Label>
            <Form.Control
              as="textarea" rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </Form.Group>

          <Alert variant="warning" className="small">
             ⚠️ Note: Changing the amount here might not automatically update the associated invoice balance depending on system settings. Use "Reverse" to fully refund if needed.
          </Alert>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}