import { useEffect, useState } from "react";
import { ProfileService } from "../../../logic/services/profileService";
import { Spinner, Row, Col, Card, Badge, Button, Form } from "react-bootstrap";

export default function ProfileManager() {
  const [user, setUser] = useState<any>(null);
  const [renterProfile, setRenterProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await ProfileService.getMe();
      setUser(userData);

      // If user has the renter role, fetch deeper details
      if (userData.is_renter) {
        const renterData = await ProfileService.getRenterMe();
        setRenterProfile(renterData);
      }
    } catch (err) {
      console.error("Profile load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <Row>
        <Col lg={4}>
          {/* USER CARD */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 text-center p-4">
            <div className="mx-auto bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
              {renterProfile?.profile_pic ? (
                <img src={renterProfile.profile_pic} className="rounded-circle w-100 h-100 object-fit-cover" alt="Profile" />
              ) : (
                <span className="display-4 fw-bold text-primary">{user?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h4 className="fw-bold mb-1">{renterProfile?.full_name || user?.username}</h4>
            <p className="text-muted small mb-3">{user?.email}</p>
            <div className="d-flex justify-content-center gap-2">
              <Badge bg="dark" className="rounded-pill px-3">{user?.role.toUpperCase()}</Badge>
              {user?.is_superadmin && <Badge bg="danger" className="rounded-pill px-3">SUPERADMIN</Badge>}
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          {/* ACCOUNT DETAILS */}
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0">Profile Information</h5>
              {user?.is_renter && (
                <Button variant="light" size="sm" className="border rounded-pill px-3" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              )}
            </div>

            <Row className="g-4">
              <Col md={6}>
                <label className="text-muted x-small fw-bold text-uppercase">Username</label>
                <div className="fw-bold">{user?.username}</div>
              </Col>
              <Col md={6}>
                <label className="text-muted x-small fw-bold text-uppercase">Email Address</label>
                <div className="fw-bold">{user?.email}</div>
              </Col>

              {user?.is_renter && renterProfile && (
                <>
                  <Col md={6}>
                    <label className="text-muted x-small fw-bold text-uppercase">Phone Number</label>
                    <div className="fw-bold">{renterProfile.phone_number}</div>
                  </Col>
                  <Col md={6}>
                    <label className="text-muted x-small fw-bold text-uppercase">Gender</label>
                    <div className="fw-bold text-capitalize">{renterProfile.gender || 'Not specified'}</div>
                  </Col>
                  <Col md={12}>
                    <label className="text-muted x-small fw-bold text-uppercase">Present Address</label>
                    <div className="fw-bold">{renterProfile.present_address}</div>
                  </Col>
                  <Col md={6}>
                    <label className="text-muted x-small fw-bold text-uppercase">NID/Passport Number</label>
                    <div className="fw-bold">{renterProfile.nid_number || '---'}</div>
                  </Col>
                  <Col md={6}>
                    <label className="text-muted x-small fw-bold text-uppercase">Notification Preference</label>
                    <div>
                      <Badge bg="info-subtle" text="info" className="border border-info rounded-pill">
                        {renterProfile.notification_preference.toUpperCase()}
                      </Badge>
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}