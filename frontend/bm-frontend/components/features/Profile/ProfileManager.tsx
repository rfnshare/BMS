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

  const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return "";
    return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
  };

  return (
    <div className="animate__animated animate__fadeIn px-1 px-md-3">
      {message && (
        <Alert variant={message.type} className="rounded-4 mb-4 small border-0 shadow-sm animate__animated animate__headShake">
          {message.text}
        </Alert>
      )}

      <Row className="g-3 g-md-4">
        {/* IDENTITY SECTION: Top on mobile, Left on desktop */}
        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Cover Banner */}
            <div className="position-relative" style={{ height: '100px', background: 'linear-gradient(45deg, #1a1a1a, #4a4a4a)' }}>
               <div className="position-absolute start-50 top-100 translate-middle">
                  <div className="bg-white p-1 rounded-circle shadow-sm">
                    <div className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center shadow-inner"
                         style={{ width: '100px', height: '100px' }}>
                        {userData?.profile_picture ? (
                            <img
                                src={getImageUrl(userData.profile_picture)}
                                className="w-100 h-100 object-fit-cover"
                                alt="Profile"
                            />
                        ) : (
                            <span className="display-6 fw-bold text-muted opacity-50">
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
                  <input type="file" ref={fileInputRef} hidden accept="image/*" capture="user" />
               </div>
            </div>

            <Card.Body className="pt-5 mt-3 text-center">
              <h5 className="fw-bold mb-0 text-dark">{userData?.first_name} {userData?.last_name}</h5>
              <p className="text-muted small mb-2">@{userData?.username}</p>

              <Badge bg="dark" className="rounded-pill px-3 py-2 text-uppercase mb-3" style={{fontSize: '0.65rem'}}>
                {userData?.role}
              </Badge>

              <ListGroup variant="flush" className="text-start small border-top">
                <ListGroup.Item className="px-1 py-3 border-0 d-flex justify-content-between align-items-center">
                    <span className="text-muted"><i className="bi bi-envelope me-2"></i>Email:</span>
                    <span className="fw-bold text-truncate ms-2" style={{maxWidth: '60%'}}>{userData?.email}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-1 py-3 border-0 d-flex justify-content-between align-items-center">
                    <span className="text-muted"><i className="bi bi-calendar-check me-2"></i>Since:</span>
                    <span className="fw-bold">{userData?.date_joined}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* DETAILS SECTION: Bottom on mobile, Right on desktop */}
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-3 p-md-4">
            <Form onSubmit={handleUpdate}>
              <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 pb-md-3 border-bottom">
                <h6 className="fw-bold m-0 text-dark text-uppercase small" style={{letterSpacing: '0.5px'}}>Account Details</h6>
                <Button
                    variant={isEditing ? "light" : "outline-primary"}
                    size="sm"
                    className="rounded-pill px-3 px-md-4 fw-bold"
                    onClick={() => { if(isEditing) setIsEditing(false); else setIsEditing(true); }}
                    type={isEditing ? "button" : "submit"}
                    disabled={submitting}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>

              <Row className="g-2 g-md-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">First Name</Form.Label>
                    <Form.Control
                        name="first_name"
                        defaultValue={userData?.first_name}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-2 py-2 fw-bold shadow-none" : "py-2 rounded-3"}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">Last Name</Form.Label>
                    <Form.Control
                        name="last_name"
                        defaultValue={userData?.last_name}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-2 py-2 fw-bold shadow-none" : "py-2 rounded-3"}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">Phone Number</Form.Label>
                    <Form.Control
                        name="phone_number"
                        inputMode="tel"
                        defaultValue={userData?.phone_number}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-2 py-2 fw-bold shadow-none" : "py-2 rounded-3"}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="text-muted x-small fw-bold text-uppercase">About Me (Bio)</Form.Label>
                    <Form.Control
                        as="textarea" rows={3}
                        name="bio"
                        defaultValue={userData?.bio}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-light border-0 px-2 py-2 fw-bold shadow-none" : "py-2 rounded-3"}
                        placeholder="Share something about yourself..."
                    />
                  </Form.Group>
                </Col>

                {isEditing && (
                  <Col xs={12} className="mt-4 pt-3 border-top">
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