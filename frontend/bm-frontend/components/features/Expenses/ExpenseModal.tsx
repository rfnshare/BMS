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
  const [leases, setLeases] = useState<any[]>([]); // 🔥 Stores lease options

  const [formData, setFormData] = useState({
    title: expense?.title || "",
    category: expense?.category || "maintenance",
    amount: expense?.amount || "",
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || "",
    lease: expense?.lease || "", // 🔥 Changed from renter to lease
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
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold">{expense ? "Edit Expense" : "Record New Expense"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-3">
            <Col md={12}>
              <Form.Label className="fw-bold">Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text" required
                placeholder="e.g. Generator Fuel, AC Repair"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </Col>

            <Col md={6}>
              <Form.Label className="fw-bold">Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {ExpenseService.getCategories().map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label className="fw-bold">Amount (৳)</Form.Label>
              <Form.Control
                type="number" step="0.01" required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </Col>

            <Col md={6}>
              <Form.Label className="fw-bold">Date</Form.Label>
              <Form.Control
                type="date" required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </Col>

            <Col md={6}>
              <Form.Label>Related Lease (Optional)</Form.Label>
              <Form.Select
                value={formData.lease}
                onChange={e => setFormData({...formData, lease: e.target.value})}
              >
                <option value="">-- General Building Expense --</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">Links cost to a specific lease/tenant.</Form.Text>
            </Col>

            <Col md={12}>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </Col>

            <Col md={12}>
                <Form.Label>Attachment</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
                {expense?.attachment && !formData.attachment && (
                   <div className="mt-2 small">
                      <i className="bi bi-paperclip me-1"></i>
                      <a href={expense.attachment} target="_blank" rel="noreferrer">View Current File</a>
                   </div>
                )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading} className="px-4 fw-bold">
            {loading ? "Saving..." : "Save Expense"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}