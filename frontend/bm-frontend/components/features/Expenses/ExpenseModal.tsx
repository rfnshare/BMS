import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Notification Integration

interface ExpenseModalProps {
  expense: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseModal({ expense, onClose, onSuccess }: ExpenseModalProps) {
  const { success: notifySuccess, error: notifyError } = useNotify(); // ✅ Use context
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

  // Hydrate Lease Dropdown
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
        notifySuccess("Expense updated successfully!"); // ✅ Professional Notification
      } else {
        await ExpenseService.create(formData);
        notifySuccess("Expense record saved!"); // ✅ Professional Notification
      }
      onSuccess(); // Triggers table refresh
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
            {expense ? "Modify Expense Entry" : "Record New Operational Cost"}
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
              <Form.Label className="x-small fw-bold text-muted text-uppercase">Title / Subject <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text" required
                className="bg-light border-0 py-2 rounded-3"
                placeholder="e.g. Electrician Bill, Lift Servicing"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="x-small fw-bold text-muted text-uppercase">Category</Form.Label>
              <Form.Select
                className="bg-light border-0 py-2 rounded-3 shadow-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {ExpenseService.getCategories().map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="x-small fw-bold text-muted text-uppercase">Amount (৳)</Form.Label>
              <Form.Control
                type="number" step="0.01" required
                className="bg-light border-0 py-2 rounded-3 fw-bold text-danger"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </Col>

            <Col xs={6} md={6}>
              <Form.Label className="x-small fw-bold text-muted text-uppercase">Date of Expense</Form.Label>
              <Form.Control
                type="date" required
                className="bg-light border-0 py-2 rounded-3"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </Col>

            <Col xs={6} md={6}>
              <Form.Label className="x-small fw-bold text-muted text-uppercase">Link to Lease (Optional)</Form.Label>
              <Form.Select
                className="bg-light border-0 py-2 rounded-3"
                value={formData.lease}
                onChange={e => setFormData({...formData, lease: e.target.value})}
              >
                <option value="">General Expense</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12}>
                <Form.Label className="x-small fw-bold text-muted text-uppercase">Receipt Image</Form.Label>
                <Form.Control
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="bg-light border-0 py-2 rounded-3"
                    onChange={handleFileChange}
                />
                <Form.Text className="text-muted x-small">Snap a photo of the receipt using your camera.</Form.Text>

                {expense?.attachment && !formData.attachment && (
                   <div className="mt-2 p-2 bg-danger-subtle rounded-3 d-flex align-items-center">
                      <i className="bi bi-paperclip me-2 text-danger"></i>
                      <a href={expense.attachment} target="_blank" rel="noreferrer" className="x-small text-danger fw-bold text-decoration-none">Review Current Receipt</a>
                   </div>
                )}
            </Col>

            <Col xs={12}>
              <Form.Label className="x-small fw-bold text-muted text-uppercase">Description</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                className="bg-light border-0 rounded-3 small"
                placeholder="Breakdown of costs..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-0 p-3 bg-light rounded-bottom-4">
          <Button variant="white" className="border shadow-sm rounded-pill px-4 d-md-none me-auto fw-bold" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={loading}
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm"
          >
            {loading ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-save2 me-2"></i>}
            {loading ? "Processing..." : expense ? "Update Entry" : "Record Expense"}
          </Button>
          <Button variant="secondary" onClick={onClose} className="d-none d-md-block rounded-pill px-4 border-0">
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}