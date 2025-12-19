import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { ExpenseService } from "../../../logic/services/expenseService"; // Reuse lease helpers

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
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{complaint ? "Update Ticket" : "New Maintenance Request"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-3">
             {/* Admin Fields */}
             <Col md={12}>
                <Form.Label className="fw-bold">Subject / Title</Form.Label>
                <Form.Control type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Leaking sink in kitchen"/>
             </Col>

             <Col md={6}>
                <Form.Label>Related Unit/Lease</Form.Label>
                <Form.Select value={formData.lease} onChange={e => setFormData({...formData, lease: e.target.value})}>
                    <option value="">-- Select Lease --</option>
                    {leases.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </Form.Select>
             </Col>

             <Col md={6}>
                <Form.Label>Priority Level</Form.Label>
                <Form.Select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">Low (Cosmetic)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Urgent)</option>
                    <option value="critical">Critical (Emergency)</option>
                </Form.Select>
             </Col>

             <Col md={6}>
                <Form.Label>Current Status</Form.Label>
                <Form.Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </Form.Select>
             </Col>

             <Col md={6}>
                <Form.Label>Photo / Attachment</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
             </Col>

             <Col md={12}>
                <Form.Label>Description of Issue</Form.Label>
                <Form.Control as="textarea" rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Submit Ticket"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}