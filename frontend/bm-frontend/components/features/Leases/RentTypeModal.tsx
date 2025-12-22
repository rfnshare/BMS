import { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { RentType, RentTypeService } from "../../../logic/services/rentTypeService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify

interface Props {
  rentType?: RentType;
  onClose: () => void;
  onSaved: () => void;
}

export default function RentTypeModal({ rentType, onClose, onSaved }: Props) {
  const { error: notifyError } = useNotify(); // ✅ Professional Error Handling

  const [form, setForm] = useState({
    name: rentType?.name || "",
    code: rentType?.code || "",
    description: rentType?.description || "",
    is_active: rentType?.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);

  // 1. Logic: Handle Data Submission
  const handleSave = async () => {
    // SQA Best Practice: Client-side validation
    if (!form.name || !form.code) {
        notifyError("Both Name and System Code are required.");
        return;
    }

    setLoading(true);
    try {
      if (rentType) {
        await RentTypeService.update(rentType.id, form);
      } else {
        await RentTypeService.create(form);
      }
      // Manager handles the success toast, refresh, and closing
      onSaved();
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show
      onHide={onClose}
      centered
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 2. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-2">
            <i className={`bi ${rentType ? 'bi-pencil-square text-warning' : 'bi-folder-plus text-primary'} fs-5`}></i>
            <Modal.Title className="h6 fw-bold mb-0">
              {rentType ? "Modify Rent Category" : "Configure New Category"}
            </Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-white">
        {/* 3. FORM FIELDS: Blueprint Pill Styling */}
        <div className="mb-4">
          <Form.Label className="text-muted small fw-bold text-uppercase ls-1">1. Category Name</Form.Label>
          <Form.Control
            className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
            placeholder="e.g., Security Deposit, Service Charge"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <Form.Label className="text-muted small fw-bold text-uppercase ls-1">2. System Code</Form.Label>
          <Form.Control
            className="rounded-pill bg-light border-0 py-2 ps-3 font-monospace small shadow-none"
            placeholder="e.g., SD-01, UT-GAS"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
          />
          <div className="x-small text-muted mt-2 ps-2">Unique identifier used for ledger reporting.</div>
        </div>

        <div className="mb-4">
          <Form.Label className="text-muted small fw-bold text-uppercase ls-1">3. Detailed Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            className="rounded-4 bg-light border-0 p-3 small shadow-none"
            placeholder="What does this specific charge cover?"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* 4. STATUS TOGGLE: Blueprint Dashed Box */}
        <div className="bg-light p-3 rounded-4 d-flex align-items-center justify-content-between border border-dashed">
          <div>
            <h6 className="mb-0 fw-bold small">Category Visibility</h6>
            <span className="text-muted" style={{fontSize: '0.65rem'}}>Visible during lease creation</span>
          </div>
          <Form.Check
            type="switch"
            className="fs-4"
            checked={form.is_active}
            onChange={e => setForm({ ...form, is_active: e.target.checked })}
          />
        </div>
      </Modal.Body>

      {/* 5. FOOTER: Pill Buttons */}
      <Modal.Footer className="border-0 p-3 bg-white d-flex justify-content-end gap-2 px-md-4">
        <Button variant="light" className="rounded-pill px-4 border text-muted small fw-bold" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={rentType ? "warning" : "primary"}
          className="rounded-pill px-5 fw-bold shadow-sm"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
          {rentType ? "Update Category" : "Establish Category"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}