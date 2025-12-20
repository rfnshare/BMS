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

  const generateTxnRef = (method: string) => {
    const prefix = method === 'mobile' ? 'MOB' : method.toUpperCase().substring(0, 3);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${dateStr}-${random}`;
  };

  const [formData, setFormData] = useState({
    lease_id: "",
    amount: "",
    method: "cash",
    transaction_reference: generateTxnRef("cash"),
    notes: `Payment received on ${new Date().toLocaleDateString()}`
  });

  const selectedLeaseObj = leases.find(l => l.id.toString() === formData.lease_id);
  const currentBalance = selectedLeaseObj ? parseFloat(selectedLeaseObj.current_balance || "0") : 0;

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
             return { ...lease, renterName: renterRes.data.full_name, unitName: unitRes.data.name };
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

  const handleLeaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leaseId = e.target.value;
    const selected = leases.find(l => l.id.toString() === leaseId);
    setFormData(prev => ({
        ...prev,
        lease_id: leaseId,
        notes: selected ? `Bulk payment from ${selected.renterName} (${selected.unitName})` : prev.notes
    }));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value;
    setFormData(prev => ({ ...prev, method: newMethod, transaction_reference: generateTxnRef(newMethod) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lease_id) { setError("Please select a valid lease."); return; }
    setLoading(true);
    setError(null);
    try {
      await PaymentService.createBulk({ ...formData, lease_id: parseInt(formData.lease_id) });
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-success text-white p-3">
        <Modal.Title className="h6 fw-bold mb-0">Receive Payment (Bulk)</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Select Payer</Form.Label>
              <Form.Select required className="py-2 rounded-3" value={formData.lease_id} onChange={handleLeaseChange}>
                <option value="">-- Select Active Lease --</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>{l.renterName} — {l.unitName}</option>
                ))}
              </Form.Select>
            </Col>

            {formData.lease_id && (
                <Col xs={12}>
                    <div className="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
                        <div>
                            <span className="text-muted small text-uppercase fw-bold d-block" style={{fontSize: '0.6rem'}}>Current Due</span>
                            <span className={`h4 fw-bold mb-0 ${currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                ৳{currentBalance.toLocaleString()}
                            </span>
                        </div>
                        {currentBalance > 0 && (
                            <Button variant="primary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => setFormData({...formData, amount: currentBalance.toString()})}>
                                Full Pay
                            </Button>
                        )}
                    </div>
                </Col>
            )}

            <Col xs={12} md={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Amount Received (৳)</Form.Label>
              <Form.Control type="number" inputMode="decimal" step="0.01" required className="py-2 rounded-3 fs-5 fw-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}/>
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Method</Form.Label>
              <Form.Select className="py-2 rounded-3" value={formData.method} onChange={handleMethodChange}>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile (Bkash/Nagad)</option>
              </Form.Select>
            </Col>

            <Col xs={12}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Transaction Reference</Form.Label>
              <div className="input-group">
                <Form.Control type="text" className="py-2" value={formData.transaction_reference} onChange={e => setFormData({...formData, transaction_reference: e.target.value})}/>
                <Button variant="outline-secondary" onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}>
                    <i className="bi bi-arrow-clockwise"></i>
                </Button>
              </div>
            </Col>

            <Col xs={12}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Internal Notes</Form.Label>
              <Form.Control as="textarea" rows={2} className="rounded-3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-top p-3 bg-light">
          <Button variant="outline-secondary" className="border-0 d-md-none me-auto" onClick={onClose}>Cancel</Button>
          <Button variant="success" type="submit" disabled={loading} className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm">
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}