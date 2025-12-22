import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner, Badge } from "react-bootstrap";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notifications

interface RenterComplaintModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenterComplaintModal({ onClose, onSuccess }: RenterComplaintModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify(); // ✅ Initialize
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLeaseId, setActiveLeaseId] = useState<number | null>(null);
  const [leaseInfo, setLeaseInfo] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    attachment: null as File | null,
  });

  // Step 1: Residency Verification
  useEffect(() => {
    const fetchLease = async () => {
      try {
        const lease = await ComplaintService.getRenterActiveLease();
        if (lease) {
          setActiveLeaseId(lease.id);
          // Set friendly unit name for the verification card
          setLeaseInfo(`Unit ${lease.unit_name || lease.unit}`);
        } else {
          setError("No active residency found. Reporting is restricted to active residents.");
        }
      } catch (err) {
        setError("Identity Sync Error: Could not verify residency status.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLease();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeaseId) {
      notifyError("Security Alert: No active lease linked to this account.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ComplaintService.create({ ...formData, lease: activeLeaseId });
      notifySuccess("Maintenance Ticket Logged Successfully."); // ✅ Success Feedback
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
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
      {/* 1. HEADER: Blueprint Dark Theme (Maintenance Variant) */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-warning bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-tools fs-5 text-warning"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                Log Maintenance Incident
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Resident Support Request Portal
            </div>
          </div>
        </div>
      </Modal.Header>

      {initialLoading ? (
        <Modal.Body className="p-5 text-center bg-light">
            <Spinner animation="grow" variant="primary" size="sm" />
            <div className="x-small fw-bold text-muted text-uppercase ls-1 mt-3">Verifying Residency...</div>
        </Modal.Body>
      ) : (
        <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
          <Modal.Body className="p-4 bg-light">
            {error && (
              <Alert variant="danger" className="border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">
                  <i className="bi bi-shield-exclamation me-2"></i>{error}
              </Alert>
            )}

            <div className="vstack gap-4">
                {/* 2. VERIFICATION CARD */}
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white border-start border-4 border-success">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-patch-check-fill text-success fs-4"></i>
                            <div>
                                <div className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>Resident Verification</div>
                                <div className="fw-bold text-dark small">Linked to: {leaseInfo}</div>
                            </div>
                        </div>
                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-10 px-3 py-2 rounded-pill x-small fw-bold ls-1">
                            ACTIVE
                        </Badge>
                    </div>
                </div>

                {/* 3. INCIDENT SPECIFICATION CARD */}
                <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-warning">
                    <h6 className="fw-bold text-warning mb-3 text-uppercase small ls-1 border-bottom pb-2">
                        <i className="bi bi-info-circle me-2"></i>Issue Specifications
                    </h6>
                    <Row className="g-3">
                        <Col xs={12}>
                            <Label required>Subject / Short Title</Label>
                            <Form.Control
                                type="text" required
                                className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                                placeholder="e.g. Bathroom Leak, AC not cooling..."
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </Col>

                        <Col md={6}>
                            <Label required>Priority Level</Label>
                            <Form.Select
                                className={`rounded-pill border-0 py-2 ps-3 small fw-bold shadow-none ${formData.priority === 'critical' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light'}`}
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="low">Low - General Improvement</option>
                                <option value="medium">Medium - Standard Repair</option>
                                <option value="high">High - Urgent Attention</option>
                                <option value="critical">Critical - Emergency Response</option>
                            </Form.Select>
                        </Col>

                        <Col md={6}>
                            <Label>Photo Evidence (Optional)</Label>
                            <Form.Control
                                type="file" accept="image/*" capture="environment"
                                className="rounded-pill bg-light border-0 py-2 ps-3 small shadow-none"
                                onChange={(e: any) => setFormData({...formData, attachment: e.target.files[0]})}
                            />
                        </Col>

                        <Col md={12}>
                            <Label required>Comprehensive Details</Label>
                            <Form.Control
                                as="textarea" rows={4} required
                                className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
                                placeholder="Please describe the issue so we can bring the right tools..."
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
                disabled={loading || !activeLeaseId}
              >
                  {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-send-check me-2"></i>}
                  {loading ? "PROCESSING..." : "SUBMIT REPORT"}
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
      )}
    </Modal>
  );
}