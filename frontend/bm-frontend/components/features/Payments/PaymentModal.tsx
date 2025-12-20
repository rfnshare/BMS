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
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-primary text-white p-3">
        <Modal.Title className="h6 fw-bold mb-0">Record Payment: {invoice.invoice_number}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {error && <Alert variant="danger" className="py-2 small rounded-3">{error}</Alert>}

          <div className="bg-light p-3 rounded-4 mb-4 border shadow-sm">
            <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Original Invoice:</span>
                <span>৳{totalAmount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between small text-success mb-1">
                <span>Amount Already Paid:</span>
                <span>- ৳{alreadyPaid.toLocaleString()}</span>
            </div>
            <hr className="my-2 opacity-10" />
            <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Remaining:</span>
                <span className="h4 fw-bold text-primary mb-0">৳{remainingBalance.toLocaleString()}</span>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Payment Amount (৳)</Form.Label>
            <Form.Control type="number" inputMode="decimal" step="0.01" required className="py-2 rounded-3 fs-5 fw-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Method</Form.Label>
            <Form.Select className="py-2 rounded-3" value={formData.method} onChange={handleMethodChange}>
              {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted text-uppercase">Reference</Form.Label>
            <InputGroup>
                <Form.Control type="text" className="py-2" value={formData.transaction_reference} onChange={e => setFormData({...formData, transaction_reference: e.target.value})}/>
                <Button variant="outline-secondary" onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}>
                    <i className="bi bi-arrow-clockwise"></i>
                </Button>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-top p-3 bg-light">
          <Button variant="outline-secondary" className="border-0 d-md-none me-auto" onClick={onClose}>Cancel</Button>
          <Button variant="success" type="submit" disabled={loading || remainingBalance <= 0} className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm">
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}