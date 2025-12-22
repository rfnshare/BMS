import { useState } from "react";
import { Modal, Button, Form, Alert, InputGroup, Spinner } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notification Hook

interface PaymentModalProps {
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify(); // ✅ Initialize notifications
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

    // ✅ Existing logic preserved
    if (Number(formData.amount) > remainingBalance) {
        setError(`Limit exceeded: Balance is ৳${remainingBalance.toLocaleString()}`);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await PaymentService.create({ ...formData, invoice: invoice.id });

      // ✅ SUCCESS ACTIONS
      notifySuccess(`Payment of ৳${Number(formData.amount).toLocaleString()} recorded!`);
      onSuccess(); // Refresh parent table
      onClose();   // ✅ FIXED: Close modal after success
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg); // ✅ Error feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down" contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
      <Modal.Header closeButton className="bg-white border-bottom p-3">
        <Modal.Title className="h6 fw-bold mb-0 text-uppercase text-muted">
            Record Payment: {invoice.invoice_number}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto bg-white">
          {error && (
            <Alert variant="danger" className="py-2 small rounded-3 border-0 bg-danger-subtle text-danger d-flex align-items-center">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {error}
            </Alert>
          )}

          {/* BALANCE SUMMARY CARD */}
          <div className="bg-light p-3 rounded-4 mb-4 border-0 shadow-none text-center">
            <div className="x-small text-muted fw-bold text-uppercase mb-1">Total Remaining Balance</div>
            <h2 className="fw-bold text-primary mb-0">৳{remainingBalance.toLocaleString()}</h2>
            <div className="d-flex justify-content-center gap-3 mt-2 x-small fw-bold">
                <span className="text-muted text-uppercase">Invoice: ৳{totalAmount.toLocaleString()}</span>
                <span className="text-success text-uppercase">Paid: ৳{alreadyPaid.toLocaleString()}</span>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Payment Amount (৳)</Form.Label>
            <Form.Control
              type="number"
              inputMode="decimal"
              step="0.01"
              required
              className="py-2 rounded-3 bg-light border-0 fs-5 fw-bold"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Method</Form.Label>
            <Form.Select className="py-2 rounded-3 bg-light border-0" value={formData.method} onChange={handleMethodChange}>
              {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Transaction Reference</Form.Label>
            <InputGroup>
                <Form.Control
                  type="text"
                  className="py-2 bg-light border-0"
                  value={formData.transaction_reference}
                  onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
                />
                <Button variant="light" className="border" onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}>
                    <i className="bi bi-arrow-clockwise"></i>
                </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Internal Notes</Form.Label>
            <Form.Control
                as="textarea"
                rows={2}
                className="bg-light border-0 rounded-3 small"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 p-3 bg-light rounded-bottom-4">
          <Button variant="white" className="border-0 d-md-none me-auto fw-bold" onClick={onClose}>Cancel</Button>
          <Button
            variant="success"
            type="submit"
            disabled={loading || remainingBalance <= 0}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm"
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-check-circle-fill me-2"></i>}
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
          <Button variant="secondary" className="d-none d-md-block rounded-pill px-4 border-0" onClick={onClose}>Cancel</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}