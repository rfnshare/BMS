import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { ExpenseService } from "../../../logic/services/expenseService";

interface ComplaintModalProps {
  complaint: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ComplaintModal({ complaint, onClose, onSuccess }: ComplaintModalProps) {
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

  // Load Leases
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
    try {
      if (complaint?.id) {
        await ComplaintService.update(complaint.id, formData);
      } else {
        await ComplaintService.create(formData);
      }
      alert("✅ Complaint Saved!");
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 fullscreen="sm-down" makes the modal take up the whole screen on mobile only */
    <Modal show onHide={onClose} size="lg" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-white border-bottom p-3">
        <Modal.Title className="fw-bold h6 mb-0">
          {complaint ? "Update Ticket" : "New Maintenance Request"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Row className="g-3">
             {/* Subject Field */}
             <Col xs={12}>
                <Form.Label className="small fw-bold text-muted">SUBJECT / TITLE</Form.Label>
                <Form.Control
                    type="text"
                    required
                    className="py-2 rounded-3"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Water leakage in bathroom"
                />
             </Col>

             {/* Lease Selection */}
             <Col xs={12} md={6}>
                <Form.Label className="small fw-bold text-muted">RELATED UNIT/LEASE</Form.Label>
                <Form.Select
                    className="py-2 rounded-3"
                    value={formData.lease}
                    onChange={e => setFormData({...formData, lease: e.target.value})}
                >
                    <option value="">-- Select Lease --</option>
                    {leases.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </Form.Select>
             </Col>

             {/* Priority */}
             <Col xs={6} md={3}>
                <Form.Label className="small fw-bold text-muted">PRIORITY</Form.Label>
                <Form.Select
                    className="py-2 rounded-3"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </Form.Select>
             </Col>

             {/* Status */}
             <Col xs={6} md={3}>
                <Form.Label className="small fw-bold text-muted">STATUS</Form.Label>
                <Form.Select
                    className="py-2 rounded-3"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">Working</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </Form.Select>
             </Col>

             {/* File Attachment with Camera Support */}
             <Col xs={12}>
                <Form.Label className="small fw-bold text-muted">PHOTO / ATTACHMENT</Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    /* 🔥 capture="environment" tells mobile browsers to prefer the camera */
                    capture="environment"
                    className="py-2 rounded-3"
                    onChange={handleFileChange}
                />
                <Form.Text className="text-muted small">Tap to take a photo or upload</Form.Text>
             </Col>

             {/* Description */}
             <Col xs={12}>
                <Form.Label className="small fw-bold text-muted">DESCRIPTION OF ISSUE</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    className="rounded-3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe exactly what's wrong..."
                />
             </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-top p-3 bg-light">
            <Button variant="link" className="text-muted text-decoration-none me-auto d-none d-md-block" onClick={onClose}>
                Cancel
            </Button>
            {/* 🔥 Full-width button on mobile */}
            <Button variant="primary" type="submit" className="w-100 w-md-auto rounded-pill px-4 py-2 fw-bold shadow-sm" disabled={loading}>
                {loading ? "Saving..." : complaint ? "Update Ticket" : "Submit Request"}
            </Button>
            <Button variant="outline-secondary" className="w-100 d-md-none border-0 mt-2" onClick={onClose}>
                Cancel
            </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}