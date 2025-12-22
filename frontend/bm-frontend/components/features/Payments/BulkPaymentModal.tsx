import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, InputGroup, Spinner, Badge } from "react-bootstrap";
import { PaymentService } from "../../../logic/services/paymentService";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";

interface BulkPaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkPaymentModal({ onClose, onSuccess }: BulkPaymentModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [leases, setLeases] = useState<any[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

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
    notes: `Bulk settlement logged on ${new Date().toLocaleDateString()}`
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
        console.error("Hydration Error", err);
      }
    })();
  }, []);

  const handleLeaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leaseId = e.target.value;
    const selected = leases.find(l => l.id.toString() === leaseId);
    setFormData(prev => ({
        ...prev,
        lease_id: leaseId,
        notes: selected ? `Settlement: ${selected.renterName} (${selected.unitName})` : prev.notes
    }));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMethod = e.target.value;
    setFormData(prev => ({ ...prev, method: newMethod, transaction_reference: generateTxnRef(newMethod) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lease_id) { setServerError("Missing Payer Allocation"); return; }
    setLoading(true);
    setServerError(null);
    try {
      await PaymentService.createBulk({ ...formData, lease_id: parseInt(formData.lease_id) });
      notifySuccess("Revenue Pipeline: Bulk payment committed successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setServerError(msg);
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
      show onHide={onClose} size="lg" centered
      fullscreen="sm-down"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-cash-stack fs-5 text-success"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">Bulk Receipt Intake</Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase mt-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Financial Operations Portal
            </div>
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-4 bg-light">
          {serverError && (
            <Alert variant="danger" className="border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">
                <i className="bi bi-exclamation-octagon-fill me-2"></i>{serverError}
            </Alert>
          )}

          <div className="vstack gap-4">
            {/* 2. PAYER ALLOCATION CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-primary">
                <h6 className="fw-bold text-primary mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-person-badge me-2"></i>Payer Allocation
                </h6>
                <Form.Group className="mb-3">
                    <Label required>Active Agreement</Label>
                    <Form.Select
                        required
                        className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                        value={formData.lease_id}
                        onChange={handleLeaseChange}
                    >
                        <option value="">-- Select Lease Source --</option>
                        {leases.map(l => (
                            <option key={l.id} value={l.id}>{l.renterName} — {l.unitName} (LS-{l.id})</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {formData.lease_id && (
                    <div className="bg-light p-3 rounded-4 border border-dashed d-flex justify-content-between align-items-center animate__animated animate__fadeIn">
                        <div>
                            <span className="text-muted fw-bold text-uppercase ls-1 d-block mb-1" style={{fontSize: '0.55rem'}}>Total Ledger Due</span>
                            <span className={`h4 fw-bold mb-0 ${currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                ৳{currentBalance.toLocaleString()}
                            </span>
                        </div>
                        {currentBalance > 0 && (
                            <Button
                                variant="primary" size="sm"
                                className="rounded-pill px-4 fw-bold shadow-sm ls-1"
                                onClick={() => setFormData({...formData, amount: currentBalance.toString()})}
                            >
                                <i className="bi bi-lightning-fill me-1"></i>AUTO-FILL
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* 3. FINANCIAL SPECIFICATIONS CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-success">
                <h6 className="fw-bold text-success mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-currency-exchange me-2"></i>Collection Specs
                </h6>
                <Row className="g-3">
                    <Col md={6}>
                        <Label required>Amount Received (৳)</Label>
                        <Form.Control
                            type="number" inputMode="decimal" step="0.01" required
                            className="rounded-pill bg-light border-0 py-2 ps-3 fs-5 fw-bold text-primary shadow-none"
                            value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                        />
                    </Col>
                    <Col md={6}>
                        <Label required>Collection Method</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                            value={formData.method} onChange={handleMethodChange}
                        >
                            <option value="cash">Physical Cash</option>
                            <option value="bank">Bank Transfer / EFT</option>
                            <option value="mobile">Mobile (bKash / Nagad)</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12}>
                        <Label required>System Reference ID</Label>
                        <InputGroup className="bg-light rounded-pill overflow-hidden border-0">
                            <Form.Control
                                type="text"
                                className="bg-light border-0 py-2 ps-3 font-monospace small fw-bold shadow-none"
                                value={formData.transaction_reference} onChange={e => setFormData({...formData, transaction_reference: e.target.value})}
                            />
                            <Button
                                variant="light"
                                className="border-0 bg-white bg-opacity-50 px-3"
                                onClick={() => setFormData(prev => ({...prev, transaction_reference: generateTxnRef(prev.method)}))}
                            >
                                <i className="bi bi-arrow-clockwise text-primary"></i>
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col xs={12}>
                        <Label>Internal Settlement Notes</Label>
                        <Form.Control
                            as="textarea" rows={2}
                            className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
                            value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </Col>
                </Row>
            </div>
          </div>
        </Modal.Body>

        {/* 4. FOOTER: Blueprint Standard */}
        <Modal.Footer className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row-reverse gap-2">
          <Button
            variant="success" type="submit" disabled={loading}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
          >
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
            {loading ? "COMMITTING..." : "CONFIRM RECEIPT"}
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