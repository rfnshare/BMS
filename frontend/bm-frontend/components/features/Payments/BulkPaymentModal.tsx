import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface BulkPaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkPaymentModal({ onClose, onSuccess }: BulkPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [leases, setLeases] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper: Generate Smart Reference ID
  const generateTxnRef = (method: string) => {
    const prefix = method === 'mobile' ? 'MOB' : method.toUpperCase().substring(0, 3);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
  };

  const [formData, setFormData] = useState({
    lease_id: "", // 🔥 FIXED: This matches backend expectation
    amount: "",
    method: "cash",
    transaction_reference: generateTxnRef("cash"),
    notes: `Payment received on ${new Date().toLocaleDateString()}`
  });

  // Derived state: Use lease_id to find the object
  // 🔥 FIXED: Check formData.lease_id, not formData.lease
  const selectedLeaseObj = leases.find(l => l.id.toString() === formData.lease_id);
  const currentBalance = selectedLeaseObj ? parseFloat(selectedLeaseObj.current_balance || "0") : 0;

  // 1. Load Active Leases
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/leases/leases/", { params: { status: "active", page_size: 100 } });
        const hydrated = await Promise.all(data.results.map(async (lease: any) => {
          try {
             const [renterRes, unitRes] = await Promise.all([
               api.get(`/renters/${lease.renter}/`),
               api.get(`/buildings/units/${lease.unit}/`)
             ]);
             return {
               ...lease,
               renterName: renterRes.data.full_name,
               unitName: unitRes.data.name
             };
          } catch (e) {
            return { ...lease, renterName: "Unknown", unitName: "Unknown" };
          }
        }));
        setLeases(hydrated);
      } catch (err) {
        console.error("Failed to load leases", err);
      }
    })();
  }, []);

  // 2. Handlers
  const handleLeaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leaseId = e.target.value;
    const selected = leases.find(l => l.id.toString() === leaseId);

    setFormData(prev => ({
        ...prev,
        lease_id: leaseId, // 🔥 FIXED: Updating lease_id correctly
        notes: selected
            ? `Bulk payment from ${selected.renterName} (${selected.unitName})`
            : `Payment received on ${new Date().toLocaleDateString()}`
    }));
  };

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

    // Validate integer
    if (!formData.lease_id) {
        setError("Please select a valid lease.");
        return;
    }

    try {
      // Logic: Ensure amount is a string/number, lease_id is integer
      await PaymentService.createBulk({
        ...formData,
        lease_id: parseInt(formData.lease_id) // Ensure integer
      });

      alert("✅ Payment Processed! The amount has been distributed to unpaid invoices.");
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>Receive Payment (Bulk)</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-3">
            <Col md={12}>
              <Form.Label className="fw-bold">Select Payer (Renter / Lease)</Form.Label>
              <Form.Select
                required
                value={formData.lease_id} // 🔥 FIXED: bind to lease_id
                onChange={handleLeaseChange}
              >
                <option value="">-- Select Active Lease --</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.renterName} — {l.unitName} (Lease #{l.id})
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Balance Display Area */}
            {formData.lease_id && (
                <Col md={12}>
                    <div className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                        <div>
                            <span className="text-muted small text-uppercase fw-bold d-block">Current Due Balance</span>
                            <span className={`fs-4 fw-bold ${currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                ৳{currentBalance.toLocaleString()}
                            </span>
                        </div>
                        {currentBalance > 0 && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setFormData({...formData, amount: currentBalance.toString()})}
                            >
                                Pay Full Balance
                            </Button>
                        )}
                    </div>
                </Col>
            )}

            <Col md={6}>
              <Form.Label className="fw-bold">Amount Received (৳)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                required
                placeholder="e.g. 15000"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </Col>

            <Col md={6}>
              <Form.Label className="fw-bold">Payment Method</Form.Label>
              <Form.Select
                value={formData.method}
                onChange={handleMethodChange}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Banking (Bkash/Nagad)</option>
                <option value="card">Card</option>
                <option value="adjustment">Security Deposit Adjustment</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Transaction / Receipt ID</Form.Label>
              <div className="input-group">
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
              </div>
              <Form.Text className="text-muted">Auto-generated based on method.</Form.Text>
            </Col>

            <Col md={12}>
              <Form.Label>Internal Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </Col>
          </Row>
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