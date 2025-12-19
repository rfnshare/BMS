import { useEffect, useState } from "react";
import { RenterService } from "../../../logic/services/renterService";
import { Row, Col, Card, Spinner, ListGroup, Badge } from "react-bootstrap";

export default function RenterProfileManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await RenterService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Profile load failed", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  if (!profile) return <div className="alert alert-warning">Profile information not found.</div>;

  return (
    <Row className="g-4">
      {/* 1. Personal Identity Card */}
      <Col lg={4}>
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="bg-primary p-4 text-center text-white">
            <div className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-person-fill display-4"></i>
            </div>
            <h5 className="fw-bold mb-0">{profile.full_name}</h5>
            <small className="opacity-75">Member since {new Date(profile.created_at).getFullYear()}</small>
          </div>
          <Card.Body className="p-4">
            <div className="text-center mb-4">
               <Badge bg={profile.is_active ? "success-subtle" : "danger-subtle"} className={`text-${profile.is_active ? 'success' : 'danger'} rounded-pill px-3 py-2 border`}>
                 Status: {profile.is_active ? 'Verified Renter' : 'Inactive'}
               </Badge>
            </div>
            <div className="vstack gap-3">
               <div>
                  <label className="x-small text-muted fw-bold text-uppercase">NID Number</label>
                  <div className="fw-bold text-dark">{profile.nid_number || 'Not Provided'}</div>
               </div>
               <div>
                  <label className="x-small text-muted fw-bold text-uppercase">Emergency Contact</label>
                  <div className="fw-bold text-dark">{profile.emergency_contact_name}</div>
                  <div className="small text-muted">{profile.emergency_contact_phone}</div>
               </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* 2. Contact & Details Card */}
      <Col lg={8}>
        <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
          <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">Contact & Professional Details</h6>
          <Row className="g-4">
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-light p-2 rounded-3"><i className="bi bi-telephone text-primary"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Phone Number</div>
                  <div className="fw-bold">{profile.phone_number}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3"><i className="bi bi-envelope text-primary"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Email Address</div>
                  <div className="fw-bold">{profile.email}</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-light p-2 rounded-3"><i className="bi bi-briefcase text-primary"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Profession</div>
                  <div className="fw-bold">{profile.profession || 'N/A'}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3"><i className="bi bi-geo-alt text-primary"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Permanent Address</div>
                  <div className="small fw-bold lh-sm">{profile.permanent_address}</div>
                </div>
              </div>
            </Col>
          </Row>

          <div className="mt-5 p-3 rounded-4 bg-light border-start border-4 border-primary">
             <h6 className="fw-bold small mb-2"><i className="bi bi-info-circle me-2"></i>Note to Manager</h6>
             <p className="small text-muted mb-0">
               {profile.remarks || "No special instructions recorded for this profile."}
             </p>
          </div>
        </Card>
      </Col>
    </Row>
  );
}