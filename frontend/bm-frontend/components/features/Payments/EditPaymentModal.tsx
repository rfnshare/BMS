import { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added for alignment

interface EditPaymentModalProps {
  payment: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPaymentModal({ payment, onClose, onSuccess }: EditPaymentModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify(); // ✅ Initialize notifications
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: payment.amount,
    method: payment.method,
    transaction_reference: payment.transaction_reference,
    notes: payment.notes,
    // ✅ CRITICAL FIX: Include these IDs so the backend doesn't throw 'invalid'
    lease: payment.lease,
    invoice: payment.invoice
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await PaymentService.update(payment.id, formData);

      // ✅ SUCCESS ACTIONS (Aligned with PaymentModal)
      notifySuccess("Payment record updated successfully!");
      onSuccess(); // Refresh the Manager table
      onClose();   // Close the modal
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg); // Show toast error as well
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down" contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
      <Modal.Header closeButton className="border-0 bg-light p-3 rounded-top-4">
        <Modal.Title className="h6 fw-bold mb-0 text-uppercase text-muted ls-wide">
            Edit Transaction: #{payment.id}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto bg-white">
          {error && (
            <Alert variant="danger" className="py-2 small rounded-3 border-0 bg-danger-subtle text-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
            </Alert>
          )}

          <div className="alert alert-info border-0 rounded-4 small py-3 d-flex gap-3 bg-info-subtle text-info shadow-none mb-4">
             <i className="bi bi-info-circle-fill fs-4"></i>
             <div>
                <strong>Audit Note:</strong> You are modifying a historical payment record for <strong>Lease LS-{payment.lease}</strong>.
             </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Payment Amount (৳)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              required
              className="py-2 rounded-3 bg-light border-0 fw-bold"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Payment Method</Form.Label>
            <Form.Select
                className="py-2 rounded-3 bg-light border-0"
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value})}
            >
              {PaymentService.getMethods().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Reference ID</Form.Label>
            <Form.Control
                type="text"
                className="py-2 rounded-3 bg-light border-0 font-monospace"
                value={formData.transaction_reference}
                onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-muted text-uppercase">Internal Notes</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                className="rounded-3 bg-light border-0 small"
                placeholder="Why was this modified?"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </Form.Group>

          <div className="alert alert-warning border-0 rounded-4 small py-3 d-flex gap-3 bg-warning-subtle text-dark">
             <i className="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
             <div>
                <strong>Caution:</strong> Changes to the amount do not automatically adjust the invoice "paid" status in some logic flows. Re-verify the invoice balance after saving.
             </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 p-3 bg-light rounded-bottom-4">
          <Button variant="white" className="border-0 d-md-none me-auto fw-bold" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm"
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-save2 me-2"></i>}
            {loading ? "Saving Changes..." : "Save Changes"}
          </Button>
          <Button variant="secondary" className="d-none d-md-block rounded-pill px-4 border-0" onClick={onClose}>Cancel</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}