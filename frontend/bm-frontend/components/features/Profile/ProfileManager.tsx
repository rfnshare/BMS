import { useEffect, useState, useRef } from "react";
import { ProfileService } from "../../../logic/services/profileService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Row, Col, Card, Badge, Button, Form, Alert, ListGroup } from "react-bootstrap";

export default function ProfileManager() {
  // 1. STATE
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. DATA FETCHING
  const loadProfile = async () => {
    setLoading(true);
    try {
      // Hits http://127.0.0.1:8000/api/accounts/profile/detailed/
      const data = await ProfileService.getDetailedProfile();
      setUserData(data);
    } catch (err) {
      setMessage({ type: 'danger', text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // 3. UPDATE LOGIC
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(formData.entries());

    // Key must be 'profile_picture' to match your serializer
    if (fileInputRef.current?.files?.[0]) {
      payload.profile_picture = fileInputRef.current.files[0];
    }

    try {
      await ProfileService.updateDetailedProfile(payload);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile successfully updated!' });
      await loadProfile();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Update failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // 4. LOADING GUARD
  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted small">Loading Profile...</p>
    </div>
  );

  // Helper to get full URL for image if it's a relative path
  const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ""; // Returning an empty string is safe for the 'src' prop
  return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
};

  return (
    <div className="animate__animated animate__fadeIn">
      {message && (
        <Alert variant={message.type} className="rounded-4 mb-4 small border-0 shadow-sm">
          {message.text}
        </Alert>
      )}

      <Row className="g-4">
        {/* LEFT COLUMN: IDENTITY CARD */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="position-relative" style={{ height: '120px', background: 'linear-gradient(45deg, #1a1a1a, #4a4a4a)' }}>
               <div className="position-absolute start-50 top-100 translate-middle">
                  <div className="bg-white p-1 rounded-circle shadow">
                    <div className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center shadow-inner" style={{ width: '110px', height: '110px' }}>
                        {userData?.profile_picture ? (
                            <img
                                src={getImageUrl(userData.profile_picture)}
                                className="w-100 h-100 object-fit-cover"
                                alt="Profile"
                            />
                        ) : (
                            <span className="display-4 fw-bold text-muted opacity-50">
                                {userData?.username?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                        size="sm" variant="primary"
                        className="position-absolute bottom-0 end-0 rounded-circle p-2 border-white border-2 shadow"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <i className="bi bi-camera-fill"></i>
                    </Button>
                  )}
                  <input type="file" ref={fileInputRef} hidden accept="image/*" />
               </div>
            </div>

            <Card.Body className="pt-5 mt-4 text-center">
              <h4 className="fw-bold mb-0 text-dark">{userData?.first_name} {userData?.last_name}</h4>
              <p className="text-muted small mb-3">@{userData?.username}</p>

              <Badge bg="dark" className="rounded-pill px-3 py-2 text-uppercase mb-4" style={{fontSize: '0.7rem'}}>
                {userData?.role}
              </Badge>

              <ListGroup variant="flush" className="text-start small border-top">
                <ListGroup.Item className="px-0 border-0 d-flex justify-content-between">
                    <span className="text-muted">Email:</span>
                    <span className="fw-bold">{userData?.email}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 border-0 d-flex justify-content-between">
                    <span className="text-muted">Member Since:</span>
                    <span className="fw-bold">{userData?.date_joined}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN: EDITABLE DETAILS */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4">
            <Form onSubmit={handleUpdate}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h5 className="fw-bold m-0 text-dark">Account Details</h5>
                <Button
                    variant={isEditing ? "light" : "outline-primary"}
                    size="sm"
                    className="rounded-pill px-4 fw-bold"
                    onClick={() => { if(isEditing) setIsEditing(false); else setIsEditing(true); }}
                    type={isEditing ? "button" : "submit"}
                    disabled={submitting}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">First Name</Form.Label>
                    <Form.Control
                        name="first_name"
                        defaultValue={userData?.first_name}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-0 fw-bold shadow-none" : "rounded-3"}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">Last Name</Form.Label>
                    <Form.Control
                        name="last_name"
                        defaultValue={userData?.last_name}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-0 fw-bold shadow-none" : "rounded-3"}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">Phone Number</Form.Label>
                    <Form.Control
                        name="phone_number"
                        defaultValue={userData?.phone_number}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-0 fw-bold shadow-none" : "rounded-3"}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">About Me (Bio)</Form.Label>
                    <Form.Control
                        as="textarea" rows={3}
                        name="bio"
                        defaultValue={userData?.bio}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-0 fw-bold shadow-none" : "rounded-3"}
                        placeholder="Share something about yourself..."
                    />
                  </Form.Group>
                </Col>

                {isEditing && (
                  <Col md={12} className="mt-4 pt-3 border-top">
                    <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2 shadow-sm" disabled={submitting}>
                      {submitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                      Save Changes
                    </Button>
                  </Col>
                )}
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}