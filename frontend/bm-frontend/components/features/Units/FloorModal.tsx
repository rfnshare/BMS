import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { Floor } from "../../../logic/services/floorService";
import { useFloorForm } from "../../../logic/hooks/useFloorForm";

interface Props {
    floor: Floor | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function FloorModal({floor, onClose, onSaved}: Props) {
    const {form, setters, errors, saving, save} = useFloorForm(floor, onSaved, onClose);

    return (
        <Modal
          show onHide={onClose} centered
          contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
        >
            {/* HEADER: Blueprint Dark Theme */}
            <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-20 rounded-3 p-2">
                        <i className={`bi ${floor ? 'bi-pencil-square text-warning' : 'bi-layers-fill text-primary'} fs-5`}></i>
                    </div>
                    <div>
                        <Modal.Title className="h6 fw-bold mb-0">
                            {floor ? "Edit Floor Level" : "Add New Floor"}
                        </Modal.Title>
                        <div className="text-white opacity-50 fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>
                            Infrastructure Hierarchy
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-4 bg-light">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                    {/* Floor Name */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold x-small text-muted text-uppercase ls-1 mb-1">
                            Floor Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            className={`rounded-pill bg-light border-0 py-2 ps-3 fw-bold small ${errors.name ? 'is-invalid' : ''}`}
                            placeholder="e.g. Ground Floor"
                            value={form.name}
                            onChange={e => setters.updateName(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid" className="ps-2">
                            {errors.name && errors.name[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Level Number */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold x-small text-muted text-uppercase ls-1 mb-1">
                            Level Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            className={`rounded-pill bg-light border-0 py-2 ps-3 fw-bold small ${errors.number ? 'is-invalid' : ''}`}
                            placeholder="e.g. 0"
                            value={form.number}
                            onChange={e => setters.updateNumber(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid" className="ps-2">
                            {errors.number && errors.number[0]}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Description */}
                    <Form.Group>
                        <Form.Label className="fw-bold x-small text-muted text-uppercase ls-1 mb-1">Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="rounded-4 bg-light border-0 p-3 small fw-bold"
                            placeholder="Optional notes about this floor level..."
                            value={form.description}
                            onChange={e => setters.setDescription(e.target.value)}
                        />
                    </Form.Group>
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-white border-top p-3 d-flex justify-content-end gap-2 px-md-4">
                <Button variant="light" className="px-4 rounded-pill border text-muted small fw-bold" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant={floor ? "warning" : "primary"}
                    className="px-5 fw-bold rounded-pill shadow-sm"
                    onClick={save}
                    disabled={saving}
                >
                    {saving ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-check-lg me-2"></i>}
                    {floor ? "Update Floor" : "Create Floor"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}