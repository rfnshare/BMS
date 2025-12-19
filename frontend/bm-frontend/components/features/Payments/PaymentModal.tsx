import { useState } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface PaymentModalProps {
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Generate Smart Reference ID (e.g., CASH-251219-4821)
  const generateTxnRef = (method: string) => {
    const prefix = method === 'mobile' ? 'MOB' : method.toUpperCase().substring(0, 3);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
  };

  const [formData, setFormData] = useState({
    amount: invoice?.balance_due || invoice?.amount || "", // 🔥 Prefer 'balance_due' if available
    method: "cash",
    transaction_reference: generateTxnRef("cash"),
    notes: `Payment for Invoice ${invoice?.invoice_number || 'Unknown'}`
  });

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value;
    setFormData(prev => ({
        ...prev,
        method: newMethod,
        transaction_reference: generateTxnRef(newMethod)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // POST /api/payments/
      await PaymentService.create({
        ...formData,
        invoice: invoice.id,
        // ❌ REMOVED: lease: invoice.lease
        // We MUST NOT send lease when sending invoice, or backend throws "Provide only one" error.
      });
      alert("✅ Payment Recorded Successfully!");
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h6 fw-bold mb-0">Record Payment for {invoice.invoice_number}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Payment Amount (৳)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
            <Form.Text className="text-muted">
               Total Due: ৳{invoice.balance_due || invoice.amount}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Payment Method</Form.Label>
            <Form.Select
              value={formData.method}
              onChange={handleMethodChange}
            >
              {PaymentService.getMethods().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Transaction Ref / Receipt No.</Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    value={formData.transaction_reference}
                    onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
                />
                <Button
                    variant="outline-secondary"
                    title="Regenerate ID"
                    onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </Button>
            </InputGroup>
            <Form.Text className="text-muted">Auto-generated based on method.</Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="success" type="submit" disabled={loading} className="px-4 fw-bold">
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}