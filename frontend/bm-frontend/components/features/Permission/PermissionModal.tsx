import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { PermissionService } from "../../../logic/services/permissionService";
import api from "../../../logic/services/apiClient";

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
    <Modal show onHide={onClose} centered size="lg" fullscreen="sm-down">
      <Modal.Header closeButton className="border-bottom p-3">
        <Modal.Title className="h6 fw-bold mb-0">
            {rule ? "Edit Policy" : "New Security Rule"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto">
          <Row className="g-3">
            <Col xs={12} md={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase">1. System Role</Form.Label>
              <Form.Select className="py-2 rounded-3" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="staff">Staff / Manager</option>
                <option value="renter">Renter</option>
              </Form.Select>
            </Col>

            <Col xs={6} md={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase">2. Module (App)</Form.Label>
              <Form.Select className="py-2 rounded-3" value={formData.app_label} onChange={e => setFormData({...formData, app_label: e.target.value, model_name: APP_MODELS[e.target.value]?.[0] || ''})}>
                <option value="">Select App...</option>
                {Object.keys(APP_MODELS).map(app => <option key={app} value={app}>{app.toUpperCase()}</option>)}
              </Form.Select>
            </Col>

            <Col xs={6} md={4}>
              <Form.Label className="small fw-bold text-muted text-uppercase">3. Resource</Form.Label>
              <Form.Select className="py-2 rounded-3" value={formData.model_name} disabled={!formData.app_label} onChange={e => setFormData({...formData, model_name: e.target.value})}>
                <option value="">Select Model...</option>
                {formData.app_label && APP_MODELS[formData.app_label].map(m => <option key={m} value={m}>{m}</option>)}
              </Form.Select>
            </Col>

            <Col xs={12} className="mt-4">
               <div className="bg-light p-3 rounded-4 border border-dashed">
                  <div className="row g-3">
                    {['create', 'read', 'update', 'delete'].map(action => (
                      <Col xs={6} key={action}>
                        <Form.Check
                          type="switch"
                          className="fw-bold small"
                          label={`CAN ${action.toUpperCase()}`}
                          checked={(formData as any)[`can_${action}`]}
                          onChange={e => setFormData({...formData, [`can_${action}`]: e.target.checked})}
                        />
                      </Col>
                    ))}
                  </div>
               </div>
            </Col>

            <Col xs={12} className="mt-4">
              <Form.Label className="small fw-bold text-muted text-uppercase">4. Assign to Staff Members</Form.Label>
              <div className="d-flex flex-wrap gap-2 p-3 border rounded-4 bg-light bg-opacity-50" style={{minHeight: '80px'}}>
                {staff.map(u => (
                  <Badge
                    key={u.id}
                    bg={formData.assigned_to.includes(u.id) ? "primary" : "white"}
                    className={`p-2 border rounded-pill ${formData.assigned_to.includes(u.id) ? "" : "text-dark"}`}
                    onClick={() => toggleUser(u.id)}
                    style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    {u.username} <span className="opacity-50 ms-1">({u.role})</span>
                  </Badge>
                ))}
              </div>
              <Form.Text className="text-muted x-small">Empty selection means policy applies to ALL users of that role.</Form.Text>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="p-3 bg-light border-top">
          <Button variant="outline-secondary" className="border-0 d-md-none me-auto" onClick={onClose}>Cancel</Button>
          <Button variant="dark" type="submit" className="w-100 w-md-auto px-5 py-2 rounded-pill fw-bold shadow-sm">
            Save Access Policy
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}