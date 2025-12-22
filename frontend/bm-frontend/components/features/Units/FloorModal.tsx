import { Modal, Button, Form } from "react-bootstrap";
import { Floor } from "../../../logic/services/floorService";
import { useFloorForm } from "../../../logic/hooks/useFloorForm";

interface Props {
  floor: Floor | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FloorModal({ floor, onClose, onSaved }: Props) {
  // All logic is now imported from our hook
  const { form, setters, errors, saving, save } = useFloorForm(floor, onSaved, onClose);

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down">
      <Modal.Header closeButton className="p-3 bg-light border-0">
        <Modal.Title className="h6 fw-bold text-dark mb-0">
          {floor ? "Edit Floor" : "Add New Floor"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Floor Name */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold x-small text-muted text-uppercase">
            Floor Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            className="bg-light border-0"
            placeholder="e.g. Ground Floor"
            value={form.name}
            isInvalid={!!errors.name}
            onChange={e => setters.updateName(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>

        {/* Level Number */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold x-small text-muted text-uppercase">
            Level Number <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="number"
            className="bg-light border-0"
            placeholder="0"
            value={form.number}
            isInvalid={!!errors.number}
            onChange={e => setters.updateNumber(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">{errors.number}</Form.Control.Feedback>
        </Form.Group>

        {/* Description */}
        <Form.Group>
          <Form.Label className="fw-bold x-small text-muted text-uppercase">Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            className="bg-light border-0"
            placeholder="Optional notes..."
            value={form.description}
            onChange={e => setters.setDescription(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-light">
        <Button variant="link" className="text-decoration-none text-muted me-auto d-none d-md-block" onClick={onClose}>
            Cancel
        </Button>
        <Button
          variant="primary"
          className="w-100 w-md-auto px-5 fw-bold rounded-pill shadow-sm"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving..." : (floor ? "Update Floor" : "Create Floor")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}