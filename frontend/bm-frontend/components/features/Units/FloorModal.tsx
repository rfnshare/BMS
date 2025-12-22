import { useState } from "react";
import { Floor, FloorService } from "../../../logic/services/floorService";
import { Modal, Button, Form } from "react-bootstrap";

interface Props {
  floor: Floor | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FloorModal({ floor, onClose, onSaved }: Props) {
  // 1. Data States
  const [name, setName] = useState(floor?.name || "");
  const [number, setNumber] = useState<number | "">(floor?.number ?? "");
  const [description, setDescription] = useState(floor?.description || "");
  
  // 2. UI States (Loading and Validation)
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  // 3. Validation Logic
  const validateForm = () => {
    const newErrors: { name?: string; number?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Floor name is required";
    }
    
    if (number === "" || number === null) {
      newErrors.number = "Level number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // 4. Save Logic
  const save = async () => {
    // Stop if validation fails
    if (!validateForm()) return;

    setSaving(true);
    const payload = { 
      name: name.trim(), 
      number: Number(number), 
      description: description.trim() || null 
    };

    try {
      floor 
        ? await FloorService.update(floor.id, payload) 
        : await FloorService.create(payload);
      onSaved();
    } catch (err) {
      console.error("Failed to save floor:", err);
      // Optional: set a general error message here
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down">
      <Modal.Header closeButton className="p-3 bg-light border-0">
        <Modal.Title className="h6 fw-bold text-dark mb-0">
          {floor ? "Edit Floor" : "Add New Floor"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Floor Name Field */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold x-small text-muted text-uppercase">
            Floor Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control 
            className="bg-light border-0" 
            placeholder="e.g. Ground Floor" 
            value={name} 
            isInvalid={!!errors.name} // Highlighting the field red if error exists
            onChange={e => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" }); // Clear error on type
            }} 
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Level Number Field */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold x-small text-muted text-uppercase">
            Level Number <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control 
            type="number" 
            className="bg-light border-0" 
            placeholder="0" 
            value={number} 
            isInvalid={!!errors.number}
            onChange={e => {
              setNumber(e.target.value === "" ? "" : Number(e.target.value));
              if (errors.number) setErrors({ ...errors, number: "" }); // Clear error on type
            }} 
          />
          <Form.Control.Feedback type="invalid">
            {errors.number}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Description Field (Optional) */}
        <Form.Group>
          <Form.Label className="fw-bold x-small text-muted text-uppercase">
            Description
          </Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            className="bg-light border-0" 
            placeholder="Optional notes about this floor..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-light">
        <Button 
          variant="link" 
          className="text-decoration-none text-muted me-auto d-none d-md-block" 
          onClick={onClose}
        >
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

        <Button 
          variant="outline-secondary" 
          className="w-100 d-md-none mt-2 border-0" 
          onClick={onClose}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}