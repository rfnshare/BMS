import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { PermissionService } from "../../../logic/services/permissionService";
import api from "../../../logic/services/apiClient";

// Mapping backend Apps to their Models based on your project structure
const APP_MODELS: Record<string, string[]> = {
  buildings: ["Unit", "Floor"],
  expenses: ["Expense"],
  invoices: ["Invoice"],
  leases: ["Lease", "RentType"],
  payments: ["Payment"],
  complaints: ["Complaint"],
  renters: ["Renter"],
  notifications: ["Notification"],
  reports: ["Report"]
};

export default function PermissionModal({ rule, onClose, onSuccess }: any) {
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    role: rule?.role || 'staff',
    app_label: rule?.app_label || '',
    model_name: rule?.model_name || '',
    can_create: rule?.can_create ?? false,
    can_read: rule?.can_read ?? true,
    can_update: rule?.can_update ?? false,
    can_delete: rule?.can_delete ?? false,
    assigned_to: rule?.assigned_to || [],
  });

  useEffect(() => {
    api.get("/accounts/staff/").then(res => setStaff(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.app_label || !formData.model_name) return alert("Select App and Model");

    try {
      if (rule?.id) await PermissionService.update(rule.id, formData);
      else await PermissionService.create(formData);
      onSuccess();
    } catch (err) { alert("Policy already exists or server error"); }
  };

  const toggleUser = (userId: number) => {
    const current = [...formData.assigned_to];
    const idx = current.indexOf(userId);
    if (idx > -1) current.splice(idx, 1);
    else current.push(userId);
    setFormData({ ...formData, assigned_to: current });
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">{rule ? "Edit Policy" : "New Security Rule"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="small fw-bold">1. System Role</Form.Label>
              <Form.Select className="rounded-3" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="staff">Staff / Manager</option>
                <option value="renter">Renter</option>
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label className="small fw-bold">2. Module (App)</Form.Label>
              <Form.Select className="rounded-3" value={formData.app_label} onChange={e => setFormData({...formData, app_label: e.target.value, model_name: APP_MODELS[e.target.value]?.[0] || ''})}>
                <option value="">Select App...</option>
                {Object.keys(APP_MODELS).map(app => <option key={app} value={app}>{app.toUpperCase()}</option>)}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label className="small fw-bold">3. Resource (Model)</Form.Label>
              <Form.Select className="rounded-3" value={formData.model_name} disabled={!formData.app_label} onChange={e => setFormData({...formData, model_name: e.target.value})}>
                <option value="">Select Model...</option>
                {formData.app_label && APP_MODELS[formData.app_label].map(m => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
            </Col>

            <Col md={12} className="mt-4">
               <div className="bg-light p-3 rounded-4 d-flex justify-content-between border">
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

            <Col md={12} className="mt-4">
              <Form.Label className="small fw-bold">4. Assign to Staff Members</Form.Label>
              <div className="d-flex flex-wrap gap-2 p-3 border rounded-4" style={{minHeight: '80px'}}>
                {staff.map(u => (
                  <Badge
                    key={u.id}
                    bg={formData.assigned_to.includes(u.id) ? "primary" : "light"}
                    className={`p-2 cursor-pointer border ${formData.assigned_to.includes(u.id) ? "" : "text-dark"}`}
                    onClick={() => toggleUser(u.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {u.username} ({u.role})
                  </Badge>
                ))}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="dark" type="submit" className="px-5 rounded-pill shadow-sm">Save Access Policy</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}