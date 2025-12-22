import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import { PermissionService } from "../../../logic/services/permissionService";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Unified Notification Hook
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
  const { success: notifySuccess, error: notifyError } = useNotify();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    api.get("/api/accounts/staff/").then(res => setStaff(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.app_label || !formData.model_name) {
      return notifyError("Validation Error: Module and Resource are mandatory.");
    }

    setLoading(true);
    try {
      if (rule?.id) await PermissionService.update(rule.id, formData);
      else await PermissionService.create(formData);

      notifySuccess(rule ? "Security Policy Synchronized." : "New Access Rule Established.");
      onSuccess();
    } catch (err) {
      notifyError("Conflict: This specific policy overlap already exists.");
    } finally {
      setLoading(true);
    }
  };

  const toggleUser = (userId: number) => {
    const current = [...formData.assigned_to];
    const idx = current.indexOf(userId);
    if (idx > -1) current.splice(idx, 1);
    else current.push(userId);
    setFormData({ ...formData, assigned_to: current });
  };

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Form.Label className="x-small fw-bold text-muted text-uppercase mb-1 ls-1">
      {children} {required && <span className="text-danger">*</span>}
    </Form.Label>
  );

  return (
    <Modal
      show onHide={onClose} centered size="lg"
      fullscreen="sm-down"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme (Security Variant) */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-shield-lock fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                {rule ? "Modify Access Policy" : "Establish Security Rule"}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Governance & Permission Configuration
            </div>
          </div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-4 bg-light">
          <div className="vstack gap-4">

            {/* 2. RULE TARGETING CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-primary">
                <h6 className="fw-bold text-primary mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-target me-2"></i>Resource Targeting
                </h6>
                <Row className="g-3">
                    <Col xs={12} md={4}>
                        <Label required>System Role</Label>
                        <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="staff">Administrative / Staff</option>
                            <option value="renter">Resident / Renter</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={4}>
                        <Label required>System Module</Label>
                        <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={formData.app_label} onChange={e => setFormData({...formData, app_label: e.target.value, model_name: APP_MODELS[e.target.value]?.[0] || ''})}>
                            <option value="">Select App...</option>
                            {Object.keys(APP_MODELS).map(app => <option key={app} value={app}>{app.toUpperCase()}</option>)}
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={4}>
                        <Label required>Specific Resource</Label>
                        <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={formData.model_name} disabled={!formData.app_label} onChange={e => setFormData({...formData, model_name: e.target.value})}>
                            <option value="">Select Model...</option>
                            {formData.app_label && APP_MODELS[formData.app_label].map(m => <option key={m} value={m}>{m}</option>)}
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* 3. PERMISSION MATRIX CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-warning">
                <h6 className="fw-bold text-warning mb-3 text-uppercase small ls-1 border-bottom pb-2">
                    <i className="bi bi-key me-2"></i>Capability Matrix
                </h6>
                <div className="bg-light p-3 rounded-4 border border-dashed">
                    <Row className="g-3">
                      {['create', 'read', 'update', 'delete'].map(action => (
                        <Col xs={6} md={3} key={action}>
                          <Form.Check
                            type="switch"
                            id={`switch-${action}`}
                            className="fw-bold x-small ls-1 text-uppercase text-muted custom-switch"
                            label={`CAN ${action}`}
                            checked={(formData as any)[`can_${action}`]}
                            onChange={e => setFormData({...formData, [`can_${action}`]: e.target.checked})}
                          />
                        </Col>
                      ))}
                    </Row>
                </div>
            </div>

            {/* 4. USER ASSIGNMENT CARD */}
            <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-info">
                <h6 className="fw-bold text-info mb-1 text-uppercase small ls-1">
                    <i className="bi bi-people me-2"></i>Individual Overrides
                </h6>
                <p className="text-muted x-small mb-3">Optional: Explicitly bind this rule to specific accounts.</p>

                <div className="d-flex flex-wrap gap-2 p-3 border rounded-4 bg-light bg-opacity-50" style={{minHeight: '80px'}}>
                  {staff.map(u => (
                    <Badge
                      key={u.id}
                      pill
                      bg={formData.assigned_to.includes(u.id) ? "primary" : "white"}
                      className={`px-3 py-2 border shadow-sm ls-1 fw-bold x-small d-flex align-items-center gap-2 ${formData.assigned_to.includes(u.id) ? "text-white" : "text-muted"}`}
                      onClick={() => toggleUser(u.id)}
                      style={{ cursor: 'pointer', transition: '0.2s' }}
                    >
                      <i className={`bi bi-${formData.assigned_to.includes(u.id) ? 'check-circle-fill' : 'circle'}`}></i>
                      {u.username.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <Form.Text className="text-muted x-small italic mt-2">
                    <i className="bi bi-info-circle me-1"></i> If no users are selected, this policy applies globally to the chosen role.
                </Form.Text>
            </div>
          </div>
        </Modal.Body>

        {/* 5. FOOTER: Right-Aligned (Desktop) / Stacked (Mobile) */}
        <Modal.Footer className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row-reverse gap-2 px-md-5">
          <Button
            variant="primary"
            type="submit"
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-check me-2"></i>}
            {rule ? "UPDATE POLICY" : "ESTABLISH RULE"}
          </Button>
          <Button
            variant="light"
            className="w-100 w-md-auto rounded-pill px-4 py-2 border text-muted small fw-bold ls-1"
            onClick={onClose}
          >
            DISCARD
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}