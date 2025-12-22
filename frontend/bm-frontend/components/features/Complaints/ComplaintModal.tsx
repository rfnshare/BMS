import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { ExpenseService } from "../../../logic/services/expenseService";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notification Hook

interface ComplaintModalProps {
  complaint: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ComplaintModal({ complaint, onClose, onSuccess }: ComplaintModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify(); // ✅ Initialize notifications
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

  // Load Leases (Preserved hydration logic)
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
                    return {
                        id: l.id,
                        label: `${u.name || 'Unit '+u.unit_number} - ${r.full_name}`
                    };
                } catch { return { id: l.id, label: `Lease #${l.id}` }; }
            }));
            setLeases(hydrated);
        } catch (e) { console.error(e); }
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
        notifySuccess("Ticket updated successfully!"); // ✅ Professional Notification
      } else {
        await ComplaintService.create(formData);
        notifySuccess("New maintenance request submitted!"); // ✅ Professional Notification
      }
      onSuccess(); // Triggers table refresh in Manager
      onClose();   // ✅ FIXED: Auto-close modal on success
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show
      onHide={onClose}
      size="lg"
      centered
      fullscreen="sm-down"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      <Modal.Header closeButton className="border-0 bg-white p-3">
        <Modal.Title className="fw-bold x-small text-uppercase text-muted ls-wide">
          {complaint ? "Modify Maintenance Ticket" : "Report New Issue"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto bg-white">
          {error && (
            <Alert variant="danger" className="py-2 small rounded-3 border-0 bg-danger-subtle text-danger d-flex align-items-center mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
            </Alert>
          )}

          <Row className="g-3">
             <Col xs={12}>
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Subject / Short Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text" required
                    className="bg-light border-0 py-2 rounded-3"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Broken window, Water pump failure"
                />
             </Col>

             <Col xs={12} md={6}>
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Related Unit/Lease</Form.Label>
                <Form.Select
                    className="bg-light border-0 py-2 rounded-3"
                    value={formData.lease}
                    onChange={e => setFormData({...formData, lease: e.target.value})}
                >
                    <option value="">-- General / Building-wide --</option>
                    {leases.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </Form.Select>
             </Col>

             <Col xs={6} md={3}>
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Priority</Form.Label>
                <Form.Select
                    className="bg-light border-0 py-2 rounded-3"
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
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Status</Form.Label>
                <Form.Select
                    className="bg-light border-0 py-2 rounded-3"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </Form.Select>
             </Col>

             <Col xs={12}>
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Evidence / Photo Attachment</Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="bg-light border-0 py-2 rounded-3"
                    onChange={handleFileChange}
                />
                <Form.Text className="text-muted x-small">Use your camera to snap a photo of the problem.</Form.Text>

                {complaint?.attachment && !formData.attachment && (
                   <div className="mt-2 p-2 bg-light rounded-3 d-flex align-items-center">
                      <i className="bi bi-image me-2 text-primary"></i>
                      <a href={complaint.attachment} target="_blank" rel="noreferrer" className="x-small text-primary fw-bold text-decoration-none">View Existing Attachment</a>
                   </div>
                )}
             </Col>

             <Col xs={12}>
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Detailed Description <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    className="bg-light border-0 rounded-3 small"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Please explain the issue in detail..."
                />
             </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 p-3 bg-light rounded-bottom-4">
            <Button variant="white" className="border shadow-sm rounded-pill px-4 d-md-none me-auto fw-bold" onClick={onClose}>
                Cancel
            </Button>
            <Button
                variant="primary"
                type="submit"
                className="w-100 w-md-auto rounded-pill px-5 py-2 fw-bold shadow-sm"
                disabled={loading}
            >
                {loading ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-check-circle-fill me-2"></i>}
                {loading ? "Submitting..." : complaint ? "Update Ticket" : "Submit Ticket"}
            </Button>
            <Button variant="secondary" className="d-none d-md-block rounded-pill px-4 border-0" onClick={onClose}>
                Cancel
            </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}