import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface ExpenseModalProps {
  expense: any; // If null, create mode
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseModal({ expense, onClose, onSuccess }: ExpenseModalProps) {
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

  // Load Active Leases & Hydrate Names for Dropdown
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
                    return {
                        id: l.id,
                        label: `${r.full_name} (${u.name || 'Unit '+u.unit_number})`
                    };
                } catch {
                    return { id: l.id, label: `Lease #${l.id}` };
                }
            }));
            setLeases(hydrated);
        } catch (e) {
            console.error("Failed to load leases", e);
        }
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
      } else {
        await ExpenseService.create(formData);
      }
      alert("✅ Expense Saved!");
      onSuccess();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 fullscreen="sm-down" turns the modal into a full-page view on mobile */
    <Modal show onHide={onClose} size="lg" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-white border-bottom p-3">
        <Modal.Title className="fw-bold h6 mb-0">
            {expense ? "Edit Expense" : "Record New Expense"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="small fw-bold text-muted">TITLE <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text" required
                className="py-2 rounded-3"
                placeholder="e.g. Generator Fuel, AC Repair"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="small fw-bold text-muted">CATEGORY</Form.Label>
              <Form.Select
                className="py-2 rounded-3 shadow-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {ExpenseService.getCategories().map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="small fw-bold text-muted">AMOUNT (৳)</Form.Label>
              <Form.Control
                type="number" step="0.01" required
                className="py-2 rounded-3"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </Col>

            <Col xs={6} md={6}>
              <Form.Label className="small fw-bold text-muted">DATE</Form.Label>
              <Form.Control
                type="date" required
                className="py-2 rounded-3"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </Col>

            <Col xs={6} md={6}>
              <Form.Label className="small fw-bold text-muted">RELATED LEASE</Form.Label>
              <Form.Select
                className="py-2 rounded-3"
                value={formData.lease}
                onChange={e => setFormData({...formData, lease: e.target.value})}
              >
                <option value="">-- General --</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12}>
                {/* 🔥 capture="environment" enables mobile camera for direct receipt photo */}
                <Form.Label className="small fw-bold text-muted">RECEIPT / ATTACHMENT</Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="py-2 rounded-3"
                    onChange={handleFileChange}
                />
                <Form.Text className="text-muted small">Snap a photo of the bill or receipt.</Form.Text>

                {expense?.attachment && !formData.attachment && (
                   <div className="mt-2 p-2 bg-light rounded-3 d-flex align-items-center">
                      <i className="bi bi-paperclip me-2 text-primary"></i>
                      <a href={expense.attachment} target="_blank" rel="noreferrer" className="small text-decoration-none">View Existing Receipt</a>
                   </div>
                )}
            </Col>

            <Col xs={12}>
              <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                className="rounded-3"
                placeholder="Optional notes..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-top p-3 bg-light">
          <Button variant="outline-secondary" className="border-0 d-md-none me-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={loading}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm"
          >
            {loading ? "Saving..." : expense ? "Update Expense" : "Save Record"}
          </Button>
          <Button variant="secondary" onClick={onClose} className="d-none d-md-block">
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}