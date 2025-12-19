import { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { PermissionService } from "../../../logic/services/permissionService";

export default function PermissionModal({ rule, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    role: rule?.role || 'staff',
    app_label: rule?.app_label || '',
    model_name: rule?.model_name || '',
    can_create: rule?.can_create ?? false,
    can_read: rule?.can_read ?? true,
    can_update: rule?.can_update ?? false,
    can_delete: rule?.can_delete ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (rule?.id) await PermissionService.update(rule.id, formData);
      else await PermissionService.create(formData);
      onSuccess();
    } catch (err) { alert("Error saving permission"); }
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">{rule ? "Edit Permission" : "New Permission Rule"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="small fw-bold">System Role</Form.Label>
              <Form.Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="staff">Staff / Manager</option>
                <option value="renter">Renter</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold">App Label</Form.Label>
              <Form.Control placeholder="e.g. expenses" value={formData.app_label} onChange={e => setFormData({...formData, app_label: e.target.value})} required />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold">Model Name</Form.Label>
              <Form.Control placeholder="e.g. expense" value={formData.model_name} onChange={e => setFormData({...formData, model_name: e.target.value})} required />
            </Col>

            <Col md={12} className="mt-4">
               <div className="bg-light p-3 rounded-4 d-flex justify-content-between">
                  {['create', 'read', 'update', 'delete'].map(action => (
                    <Form.Check
                      key={action}
                      type="switch"
                      label={`Can ${action.toUpperCase()}`}
                      checked={(formData as any)[`can_${action}`]}
                      onChange={e => setFormData({...formData, [`can_${action}`]: e.target.checked})}
                    />
                  ))}
               </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" className="px-4 rounded-pill">Save Policy</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}