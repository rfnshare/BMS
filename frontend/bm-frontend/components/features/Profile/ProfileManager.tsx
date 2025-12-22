import { useEffect, useState, useRef } from "react";
import { ProfileService } from "../../../logic/services/profileService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Row, Col, Card, Badge, Button, Form, Toast, ToastContainer, ListGroup } from "react-bootstrap";

export default function ProfileManager() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", variant: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await ProfileService.getDetailedProfile();
      setUserData(data);
    } catch (err) {
      triggerNotify(getErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const triggerNotify = (message: string, variant: string = "success") => {
    setToastConfig({ message, variant });
    setShowToast(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(formData.entries());

    if (fileInputRef.current?.files?.[0]) {
      payload.profile_picture = fileInputRef.current.files[0];
    }

    try {
      await ProfileService.updateDetailedProfile(payload);
      triggerNotify("System Identity Synchronized.");
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      triggerNotify("Synchronization failed. Check network.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return "";
    return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <Form.Label className="x-small fw-bold text-muted text-uppercase mb-1 ls-1">
      {children}
    </Form.Label>
  );

  if (loading) return (
    <div className="text-center py-5 vstack gap-3 animate__animated animate__fadeIn">
      <Spinner animation="grow" variant="primary" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Retrieving Identity Data...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">
      {/* 1. NOTIFICATION SYSTEM */}
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastConfig.variant} className="border-0 shadow-lg rounded-pill">
          <Toast.Body className="text-white text-center py-2 px-4">
            <span className="fw-bold small ls-1 text-uppercase">{toastConfig.message}</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* 2. INDUSTRIAL HEADER */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-person-badge fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">System Profile</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Identity & Security Authorization</p>
              </div>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
              {!isEditing ? (
                <Button variant="outline-primary" className="rounded-pill px-4 fw-bold small ls-1 shadow-sm flex-grow-1" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil-square me-2"></i>EDIT PROFILE
                </Button>
              ) : (
                <Button variant="light" className="rounded-pill px-4 fw-bold small border ls-1 flex-grow-1" onClick={() => setIsEditing(false)}>
                  CANCEL
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* 3. IDENTITY CARD */}
        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white border-start border-4 border-primary h-100">
            <div className="position-relative" style={{ height: '120px', background: 'linear-gradient(45deg, #0d6efd, #0a58ca)' }}>
               <div className="position-absolute start-50 top-100 translate-middle">
                  <div className="bg-white p-1 rounded-circle shadow-sm border border-4 border-white">
                    <div className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center shadow-inner"
                         style={{ width: '110px', height: '110px' }}>
                        {userData?.profile_picture ? (
                            <img src={getImageUrl(userData.profile_picture)} className="w-100 h-100 object-fit-cover" alt="User" />
                        ) : (
                            <span className="display-6 fw-bold text-primary opacity-25">{userData?.username?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                  </div>
                  {isEditing && (
                    <Button variant="primary" size="sm" className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow border-white" onClick={() => fileInputRef.current?.click()}>
                        <i className="bi bi-camera"></i>
                    </Button>
                  )}
                  <input type="file" ref={fileInputRef} hidden accept="image/*" />
               </div>
            </div>

            <Card.Body className="pt-5 mt-4 text-center">
              <h5 className="fw-bold mb-0 text-dark ls-1">{(userData?.first_name + ' ' + userData?.last_name).toUpperCase()}</h5>
              <div className="text-muted small fw-bold font-monospace opacity-75 mb-3">ID: @{userData?.username}</div>

              <Badge pill bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-2 text-uppercase ls-1 x-small mb-4">
                {userData?.role} AUTHORIZATION
              </Badge>

              <ListGroup variant="flush" className="text-start x-small border-top">
                <div className="py-3 vstack gap-2">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-muted fw-bold ls-1 text-uppercase">Email Endpoint</span>
                        <span className="fw-bold text-dark text-truncate ps-3">{userData?.email}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-1">
                        <span className="text-muted fw-bold ls-1 text-uppercase">Registry Since</span>
                        <span className="fw-bold text-dark">{userData?.date_joined}</span>
                    </div>
                </div>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* 4. DETAILS CARD */}
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-info h-100">
            <Form onSubmit={handleUpdate}>
              <h6 className="fw-bold text-primary mb-4 text-uppercase ls-1 border-bottom pb-2">
                <i className="bi bi-gear-wide-connected me-2"></i>Account Configuration
              </h6>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Label>Given Name</Label>
                    <Form.Control name="first_name" defaultValue={userData?.first_name} readOnly={!isEditing}
                        className={`rounded-pill ${!isEditing ? "bg-light border-0 px-3 py-2 fw-bold" : "py-2 px-3 fw-bold border"}`} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Label>Surname</Label>
                    <Form.Control name="last_name" defaultValue={userData?.last_name} readOnly={!isEditing}
                        className={`rounded-pill ${!isEditing ? "bg-light border-0 px-3 py-2 fw-bold" : "py-2 px-3 fw-bold border"}`} />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Label>Contact Protocol (Phone)</Label>
                    <Form.Control name="phone_number" defaultValue={userData?.phone_number} readOnly={!isEditing}
                        className={`rounded-pill ${!isEditing ? "bg-light border-0 px-3 py-2 fw-bold font-monospace" : "py-2 px-3 fw-bold border font-monospace"}`} />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Label>Professional Bio / Profile</Label>
                    <Form.Control as="textarea" rows={4} name="bio" defaultValue={userData?.bio} readOnly={!isEditing}
                        className={`rounded-4 p-3 fw-bold small ${!isEditing ? "bg-light border-0" : "bg-white border"}`}
                        placeholder="Define system role and bio..." />
                  </Form.Group>
                </Col>

                {isEditing && (
                  <Col xs={12} className="mt-4 vstack gap-2">
                    <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2 shadow-sm ls-1" disabled={submitting}>
                      {submitting ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-shield-lock me-2"></i>}
                      COMMIT IDENTITY UPDATES
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