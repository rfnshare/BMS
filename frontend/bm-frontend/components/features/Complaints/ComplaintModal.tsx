import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner, Badge } from "react-bootstrap";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { ExpenseService } from "../../../logic/services/expenseService";
import { useNotify } from "../../../logic/context/NotificationContext";

interface ComplaintModalProps {
  complaint: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ComplaintModal({ complaint, onClose, onSuccess }: ComplaintModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leases, setLeases] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: complaint?.title || "",
    description: complaint?.description || "",
    lease: complaint?.lease || "",
    priority: complaint?.priority || "medium",
    status: complaint?.status || "pending",
    attachment: null as File | null,
  });

  useEffect(() => {
    (async () => {
        try {
            const rawLeases = await ComplaintService.getActiveLeases();
            const hydrated = await Promise.all(rawLeases.map(async (l: any) => {
                try {
                    const [r, u] = await Promise.all([
                        ExpenseService.getRenter(l.renter),
                        ExpenseService.getUnit(l.unit)
                    ]);
                    return { id: l.id, label: `${u.name} — ${r.full_name}` };
                } catch { return { id: l.id, label: `Lease #${l.id}` }; }
            }));
            setLeases(hydrated);
        } catch (e) { console.error("Ticket Hydration Error", e); }
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
      if (complaint?.id) {
        await ComplaintService.update(complaint.id, formData);
        notifySuccess("Ticket record synchronized.");
      } else {
        await ComplaintService.create(formData);
        notifySuccess("Maintenance request logged in system.");
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
      {/* 1. HEADER: Blueprint Dark Theme (Maintenance Variant) */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-warning bg-opacity-20 rounded-3 p-2">
            <i className={`bi ${complaint ? 'bi-pencil-square text-warning' : 'bi-tools text-warning'} fs-5`}></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
              {complaint ? "Modify Maintenance Ticket" : "Log Incident Report"}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                Operational Infrastructure Incident Portal
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
            {/* 2. INCIDENT ALLOCATION CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-primary">
                <h6 className="fw-bold text-primary mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-geo-alt me-2"></i>Target Allocation & Severity
                </h6>
                <Row className="g-3">
                    <Col md={6}>
                        <Label>Affected Unit/Lease</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold shadow-none"
                            value={formData.lease}
                            onChange={e => setFormData({...formData, lease: e.target.value})}
                        >
                            <option value="">-- General Building Issue --</option>
                            {leases.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={3}>
                        <Label>Priority Level</Label>
                        <Form.Select
                            className={`rounded-pill border-0 py-2 ps-3 small fw-bold shadow-none ${formData.priority === 'critical' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light'}`}
                            value={formData.priority}
                            onChange={e => setFormData({...formData, priority: e.target.value})}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={3}>
                        <Label>Current Status</Label>
                        <Form.Select
                            className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold shadow-none"
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* 3. ISSUE SPECIFICATION CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-warning">
                <h6 className="fw-bold text-warning mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-info-circle me-2"></i>Issue Specifications
                </h6>
                <Row className="g-3">
                    <Col xs={12}>
                        <Label required>Short Title / Subject</Label>
                        <Form.Control
                            type="text" required
                            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                            placeholder="e.g. Roof Leak, Lift Sensor Malfunction"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </Col>
                    <Col xs={12}>
                        <Label>Detailed Evidence (Image)</Label>
                        <Form.Control
                            type="file" accept="image/*" capture="environment"
                            className="rounded-pill bg-light border-0 py-2 ps-3 small"
                            onChange={handleFileChange}
                        />
                        {complaint?.attachment && !formData.attachment && (
                            <div className="mt-2 text-end">
                                <a href={complaint.attachment} target="_blank" rel="noreferrer" className="x-small text-primary fw-bold text-uppercase ls-1 text-decoration-none">
                                    <i className="bi bi-eye me-1"></i>Review Stored Evidence
                                </a>
                            </div>
                        )}
                    </Col>
                    <Col xs={12}>
                        <Label required>Full Description</Label>
                        <Form.Control
                            as="textarea" rows={4} required
                            className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
                            placeholder="Provide comprehensive details of the issue..."
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
            variant="primary"
            type="submit"
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
            {complaint ? "SYNC TICKET" : "SUBMIT REPORT"}
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