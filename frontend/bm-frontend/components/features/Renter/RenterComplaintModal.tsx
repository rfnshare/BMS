import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { ComplaintService } from "../../../logic/services/complaintService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface RenterComplaintModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenterComplaintModal({ onClose, onSuccess }: RenterComplaintModalProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLeaseId, setActiveLeaseId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    attachment: null as File | null,
  });

  // 🔥 Step 1: Fetch the renter's active lease on mount
  useEffect(() => {
    const fetchLease = async () => {
      try {
        const lease = await ComplaintService.getRenterActiveLease();
        if (lease) {
          setActiveLeaseId(lease.id);
        } else {
          setError("No active lease found. You must have an active lease to report issues.");
        }
      } catch (err) {
        setError("Could not verify your residency status.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLease();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLeaseId) {
      setError("Cannot submit: No active lease linked to your account.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 🔥 Step 2: Pass the lease ID to the service
      await ComplaintService.create({ ...formData, lease: activeLeaseId });
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">New Maintenance Request</Modal.Title>
      </Modal.Header>

      {initialLoading ? (
        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <p className="text-muted small mb-4">
              Your request will be linked to your current unit automatically.
            </p>

            {error && <Alert variant="danger" className="small py-2">{error}</Alert>}

            <Row className="g-3">
               <Col md={12}>
                  <Form.Label className="fw-bold small">What is the issue?</Form.Label>
                  <Form.Control
                      type="text" required className="bg-light border-0 py-2 shadow-none"
                      placeholder="e.g. Broken AC, Water leak"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                  />
               </Col>

               <Col md={6}>
                  <Form.Label className="fw-bold small">Priority Level</Form.Label>
                  <Form.Select
                      className="bg-light border-0 py-2 shadow-none"
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                  </Form.Select>
               </Col>

               <Col md={6}>
                  <Form.Label className="fw-bold small">Photo (Optional)</Form.Label>
                  <Form.Control
                      type="file" accept="image/*" className="bg-light border-0 py-2 shadow-none"
                      onChange={(e: any) => setFormData({...formData, attachment: e.target.files[0]})}
                  />
               </Col>

               <Col md={12}>
                  <Form.Label className="fw-bold small">Details</Form.Label>
                  <Form.Control
                      as="textarea" rows={4} required className="bg-light border-0 shadow-none"
                      placeholder="Explain the problem in detail..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                  />
               </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
              <Button variant="light" className="px-4 rounded-pill border" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit" className="px-5 rounded-pill fw-bold shadow-sm" disabled={loading || !activeLeaseId}>
                  {loading ? "Submitting..." : "Send Request"}
              </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
}