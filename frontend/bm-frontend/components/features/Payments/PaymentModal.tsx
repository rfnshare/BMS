import { useEffect, useState } from "react";
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

  // 🔥 STEP 1: Calculate the actual remaining balance manually
  const totalAmount = Number(invoice?.amount) || 0;
  const alreadyPaid = Number(invoice?.paid_amount) || 0;
  const remainingBalance = totalAmount - alreadyPaid;

  // Helper: Generate Smart Reference ID
  const generateTxnRef = (method: string) => {
    const prefix = method === 'mobile' ? 'MOB' : method.toUpperCase().substring(0, 3);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
  };

  const [formData, setFormData] = useState({
    // 🔥 STEP 2: Pre-fill with the calculated remaining balance
    amount: remainingBalance > 0 ? remainingBalance.toString() : "",
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

    // 🔥 Validation: Don't allow paying more than the balance
    if (Number(formData.amount) > remainingBalance) {
        setError(`Cannot pay more than the remaining balance (৳${remainingBalance.toLocaleString()})`);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await PaymentService.create({
        ...formData,
        invoice: invoice.id,
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
        <Modal.Title className="h6 fw-bold mb-0">Record Payment: {invoice.invoice_number}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          {/* 🔥 BALANCE SUMMARY CARD */}
          <div className="bg-light p-3 rounded-3 mb-4 border-start border-4 border-info">
            <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Total Invoice:</span>
                <span>৳{totalAmount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between small text-success mb-1">
                <span>Already Paid:</span>
                <span>- ৳{alreadyPaid.toLocaleString()}</span>
            </div>
            <hr className="my-1" />
            <div className="d-flex justify-content-between fw-bold text-dark">
                <span>Remaining Balance:</span>
                <span>৳{remainingBalance.toLocaleString()}</span>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Amount to Pay (৳)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              required
              max={remainingBalance} // Browser-level constraint
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Payment Method</Form.Label>
            <Form.Select value={formData.method} onChange={handleMethodChange}>
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
                    onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                </Button>
            </InputGroup>
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
          <Button variant="success" type="submit" disabled={loading || remainingBalance <= 0} className="px-4 fw-bold">
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}