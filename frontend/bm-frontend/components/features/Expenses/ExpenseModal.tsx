import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";
import api from "../../../logic/services/apiClient";

interface ExpenseModalProps {
  expense: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseModal({ expense, onClose, onSuccess }: ExpenseModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leases, setLeases] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: expense?.title || "",
    category: expense?.category || "maintenance",
    amount: expense?.amount || "",
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || "",
    lease: expense?.lease || "",
    attachment: null as File | null,
  });

  useEffect(() => {
    (async () => {
        try {
            const rawLeases = await ExpenseService.getActiveLeases();
            const hydrated = await Promise.all(rawLeases.map(async (l: any) => {
                try {
                    const [r, u] = await Promise.all([
                        ExpenseService.getRenter(l.renter),
                        ExpenseService.getUnit(l.unit)
                    ]);
                    return { id: l.id, label: `${r.full_name} (${u.name})` };
                } catch { return { id: l.id, label: `Lease #${l.id}` }; }
            }));
            setLeases(hydrated);
        } catch (e) { console.error("Lease Hydration Error", e); }
    })();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (expense?.id) {
        await ExpenseService.update(expense.id, formData);
        notifySuccess("Expense record synchronized.");
      } else {
        await ExpenseService.create(formData);
        notifySuccess("Expense committed to ledger.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally { setLoading(false); }
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
      {/* 1. HEADER: Blueprint Dark Theme (Expense Variant) */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-danger bg-opacity-20 rounded-3 p-2">
            <i className={`bi ${expense ? 'bi-pencil-square text-warning' : 'bi-wallet2 text-danger'} fs-5`}></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                {expense ? "Modify Expense Entry" : "Record Operational Cost"}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                Operational Expenditure Portal
            </div>
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-4 bg-light">
          {error && (
            <Alert variant="danger" className="border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </Alert>
          )}

          <div className="vstack gap-4">
            {/* 2. COST IDENTIFICATION CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-primary">
                <h6 className="fw-bold text-primary mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-tag me-2"></i>Expense Identification
                </h6>
                <Row className="g-3">
                    <Col xs={12}>
                        <Label required>Title / Subject</Label>
                        <Form.Control
                            type="text" required
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                            placeholder="e.g. Electrician Bill, Lift Repair"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </Col>
                    <Col md={6}>
                        <Label required>Category</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            {ExpenseService.getCategories().map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Label>Associated Lease (Optional)</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 small shadow-none"
                            value={formData.lease}
                            onChange={e => setFormData({...formData, lease: e.target.value})}
                        >
                            <option value="">General Property Expense</option>
                            {leases.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* 3. FINANCIAL EVIDENCE CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-danger">
                <h6 className="fw-bold text-danger mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-cash-coin me-2"></i>Financial Specifications
                </h6>
                <Row className="g-3">
                    <Col xs={6}>
                        <Label required>Amount (৳)</Label>
                        <Form.Control
                            type="number" step="0.01" required
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold text-danger shadow-none"
                            value={formData.amount}
                            onChange={e => setFormData({...formData, amount: e.target.value})}
                        />
                    </Col>
                    <Col xs={6}>
                        <Label required>Date of Expense</Label>
                        <Form.Control
                            type="date" required
                            className="rounded-pill bg-light border-0 py-2 ps-3 small shadow-none fw-bold"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </Col>
                    <Col xs={12}>
                        <Label>Digital Receipt Attachment</Label>
                        <Form.Control
                            type="file" accept="image/*" capture="environment"
                            className="rounded-pill bg-light border-0 py-2 ps-3 small"
                            onChange={handleFileChange}
                        />
                        {expense?.attachment && !formData.attachment && (
                            <div className="mt-2 text-end">
                                <a href={expense.attachment} target="_blank" rel="noreferrer" className="x-small text-danger fw-bold text-uppercase ls-1 text-decoration-none">
                                    <i className="bi bi-eye me-1"></i>View Current Record
                                </a>
                            </div>
                        )}
                    </Col>
                    <Col xs={12}>
                        <Label>Detailed Description</Label>
                        <Form.Control
                            as="textarea" rows={2}
                            className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
                            placeholder="Provide cost breakdown..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </Col>
                </Row>
            </div>
          </div>
        </Modal.Body>

        {/* 4. FOOTER: Right-Aligned (Desktop) / Stacked (Mobile) */}
        <Modal.Footer className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row-reverse gap-2 px-md-5">
          <Button
            variant="danger"
            type="submit"
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
            {expense ? "SYNC RECORD" : "COMMIT EXPENSE"}
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