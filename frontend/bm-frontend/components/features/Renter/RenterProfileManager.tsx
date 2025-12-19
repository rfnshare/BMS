import { useEffect, useState } from "react";
import { ProfileService } from "../../../logic/services/profileService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Form, Button, Row, Col, Alert } from "react-bootstrap";

export default function RenterProfileManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    notification_preference: "both",
    profile_pic: null as File | string | null,
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await ProfileService.getRenterProfile();
      setFormData({
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
        notification_preference: data.notification_preference,
        profile_pic: data.profile_pic
      });
    } catch (err) {
      setMessage({ type: "danger", text: "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ProfileService.updateRenterProfile(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "danger", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
      <h5 className="fw-bold mb-5">My Account Settings</h5>

      {message && <Alert variant={message.type} dismissible>{message.text}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* PROFILE PICTURE SECTION */}
        <div className="d-flex flex-column align-items-center mb-5">
          <div className="position-relative">
            <div className="bg-light rounded-circle border overflow-hidden shadow-sm d-flex align-items-center justify-content-center"
                 style={{ width: '130px', height: '130px' }}>
              {typeof formData.profile_pic === 'string' && formData.profile_pic ? (
                <img src={formData.profile_pic} className="w-100 h-100 object-fit-cover" alt="Profile" />
              ) : (
                <span className="text-muted small">Profile</span>
              )}
            </div>
            <Form.Label htmlFor="pic-upload" className="btn btn-dark btn-sm rounded-circle position-absolute bottom-0 end-0 m-1 shadow">
              <i className="bi bi-camera"></i>
            </Form.Label>
            <input id="pic-upload" type="file" hidden accept="image/*"
                   onChange={(e) => e.target.files && setFormData({...formData, profile_pic: e.target.files[0]})} />
          </div>
        </div>

        {/* INPUT GRID */}
        <Row className="gy-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Full Name</Form.Label>
              <Form.Control
                className="bg-light border-0 py-2 px-3"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Phone Number (Login ID)</Form.Label>
              <Form.Control
                className="bg-light border-0 py-2 px-3"
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Email Address</Form.Label>
              <Form.Control
                className="bg-white py-2 px-3"
                value={formData.email}
                disabled
              />
              <Form.Text className="text-muted x-small">Contact admin to change registered email.</Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Notification Preference</Form.Label>
              <Form.Select
                className="bg-light border-0 py-2 px-3"
                value={formData.notification_preference}
                onChange={e => setFormData({...formData, notification_preference: e.target.value})}
              >
                <option value="email">Email Only</option>
                <option value="whatsapp">WhatsApp Only</option>
                <option value="both">Both</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={12} className="text-end mt-5">
            <Button type="submit" variant="primary" className="rounded-pill px-5 py-2 fw-bold" disabled={saving}>
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}