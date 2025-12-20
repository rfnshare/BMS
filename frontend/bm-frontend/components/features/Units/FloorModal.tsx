import { useState } from "react";
import { Floor, FloorService } from "../../../logic/services/floorService";
import { Modal, Button, Form } from "react-bootstrap";

interface Props {
  floor: Floor | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FloorModal({ floor, onClose, onSaved }: Props) {
  const [name, setName] = useState(floor?.name || "");
  const [number, setNumber] = useState<number | "">(floor?.number ?? "");
  const [description, setDescription] = useState(floor?.description || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name || number === "") return;
    setSaving(true);
    const payload = { name, number: Number(number), description: description || null };
    try {
      floor ? await FloorService.update(floor.id, payload) : await FloorService.create(payload);
      onSaved();
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
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold x-small text-muted text-uppercase">Floor Name</Form.Label>
          <Form.Control className="bg-light border-0" placeholder="e.g. Ground Floor" value={name} onChange={e => setName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold x-small text-muted text-uppercase">Level Number</Form.Label>
          <Form.Control type="number" className="bg-light border-0" placeholder="0" value={number} onChange={e => setNumber(Number(e.target.value))} />
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-bold x-small text-muted text-uppercase">Description</Form.Label>
          <Form.Control as="textarea" rows={3} className="bg-light border-0" placeholder="Notes..." value={description} onChange={e => setDescription(e.target.value)} />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-light">
        <Button variant="link" className="text-decoration-none text-muted me-auto d-none d-md-block" onClick={onClose}>Cancel</Button>
        <Button variant="primary" className="w-100 w-md-auto px-5 fw-bold rounded-pill shadow-sm" onClick={save} disabled={saving}>
          {saving ? "Saving..." : (floor ? "Update" : "Create")}
        </Button>
        <Button variant="outline-secondary" className="w-100 d-md-none mt-2 border-0" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}