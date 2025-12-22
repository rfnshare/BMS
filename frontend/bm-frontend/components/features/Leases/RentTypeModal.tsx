import { useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { RentType, RentTypeService } from "../../../logic/services/rentTypeService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";

interface Props {
  rentType?: RentType;
  onClose: () => void;
  onSaved: () => void;
}

export default function RentTypeModal({ rentType, onClose, onSaved }: Props) {
  const { error: notifyError } = useNotify();

  const [form, setForm] = useState({
    name: rentType?.name || "",
    code: rentType?.code || "",
    description: rentType?.description || "",
    is_active: rentType?.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.code) {
        notifyError("Validation Error: Category Name and System Code are mandatory.");
        return;
    }

    setLoading(true);
    try {
      if (rentType) {
        await RentTypeService.update(rentType.id, form);
      } else {
        await RentTypeService.create(form);
      }
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
      fullscreen="sm-down" // ✅ Mobile-friendly fullscreen
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className={`bi ${rentType ? 'bi-pencil-square text-warning' : 'bi-folder-plus text-primary'} fs-5`}></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
              {rentType ? "Modify Rent Category" : "Establish New Category"}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Financial Configuration Portal
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">

          {/* 2. FORM FIELDS: Blueprint Pill Styling */}
          <Form.Group className="mb-4">
            <Form.Label className="x-small fw-bold text-muted text-uppercase ls-1 mb-1">
              Category Identity <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
              placeholder="e.g. Service Charge, Utility"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="x-small fw-bold text-muted text-uppercase ls-1 mb-1">
              System Ledger Code <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              className="rounded-pill bg-light border-0 py-2 ps-3 font-monospace small shadow-none"
              placeholder="e.g. SRV-01"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
            />
            <div className="x-small text-muted mt-2 ps-2 italic">Used for unique identification in financial reports.</div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="x-small fw-bold text-muted text-uppercase ls-1 mb-1">Detailed Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="rounded-4 bg-light border-0 p-3 small shadow-none fw-bold"
              placeholder="Provide context for this charge type..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </Form.Group>

          {/* 3. STATUS TOGGLE: Blueprint Dashed Box */}
          <div className="bg-light p-3 rounded-4 d-flex align-items-center justify-content-between border border-dashed border-primary border-opacity-25">
            <div>
              <h6 className="mb-0 fw-bold small text-dark">Category Visibility</h6>
              <span className="text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.55rem'}}>Available in active leases</span>
            </div>
            <Form.Check
              type="switch"
              className="fs-4 custom-switch"
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
            />
          </div>
        </div>
      </Modal.Body>

      {/* 4. FOOTER: Pill Buttons */}
      <Modal.Footer className="border-0 p-3 bg-white d-flex flex-column flex-md-row justify-content-end gap-2 px-md-4">
        <Button
          variant="light"
          className="w-100 w-md-auto rounded-pill px-4 border text-muted small fw-bold ls-1"
          onClick={onClose}
        >
          DISCARD
        </Button>
        <Button
          variant={rentType ? "warning" : "primary"}
          className="w-100 w-md-auto rounded-pill px-5 fw-bold shadow-sm ls-1"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
          {rentType ? "UPDATE CATEGORY" : "ESTABLISH CATEGORY"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}