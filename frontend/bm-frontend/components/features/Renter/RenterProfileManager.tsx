import { useEffect, useState } from "react";
import { RenterService } from "../../../logic/services/renterService";
import { Row, Col, Card, Spinner, Badge, Image } from "react-bootstrap";

export default function RenterProfileManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await RenterService.getProfile();
        // 🔥 Fix: Since response has a 'results' array, we take the first item
        const renterData = data.results ? data.results[0] : data;
        setProfile(renterData);
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
            <div className="position-relative d-inline-block mb-3">
              {/* 🔥 Updated: Using profile_pic from response */}
              {profile.profile_pic ? (
                <Image
                  src={profile.profile_pic}
                  roundedCircle
                  className="shadow-sm border border-3 border-white"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-person-fill display-4"></i>
                </div>
              )}
            </div>
            <h5 className="fw-bold mb-0">{profile.full_name}</h5>
            <small className="opacity-75">ID: #00{profile.id} | {profile.gender}</small>
          </div>
          <Card.Body className="p-4">
            <div className="text-center mb-4 vstack gap-2">
               <Badge bg={profile.status === 'active' ? "success-subtle" : "warning-subtle"} className={`text-${profile.status === 'active' ? 'success' : 'warning'} rounded-pill px-3 py-2 border`}>
                 {profile.status.toUpperCase()}
               </Badge>
               <small className="text-muted">Member since {new Date(profile.created_at).toLocaleDateString()}</small>
            </div>

            <div className="vstack gap-3 pt-3 border-top">
               <div>
                  <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Marital Status</label>
                  <div className="fw-bold text-dark text-capitalize">{profile.marital_status}</div>
               </div>
               <div>
                  <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Date of Birth</label>
                  <div className="fw-bold text-dark">{profile.date_of_birth || 'N/A'}</div>
               </div>
               <div>
                  <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Emergency Contact</label>
                  <div className="fw-bold text-dark">{profile.emergency_contact_name} ({profile.relation})</div>
                  <div className="small text-muted">{profile.emergency_contact_phone}</div>
               </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* 2. Detailed Information */}
      <Col lg={8}>
        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
          <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">Contact & Professional Details</h6>
          <Row className="g-4">
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-light p-2 rounded-3 text-primary"><i className="bi bi-telephone-fill"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Phone Number</div>
                  <div className="fw-bold">{profile.phone_number}</div>
                  {profile.alternate_phone && <small className="text-muted">Alt: {profile.alternate_phone}</small>}
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3 text-primary"><i className="bi bi-envelope-fill"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Email Address</div>
                  <div className="fw-bold">{profile.email}</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-light p-2 rounded-3 text-primary"><i className="bi bi-briefcase-fill"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Occupation</div>
                  <div className="fw-bold">{profile.occupation}</div>
                  <small className="text-muted">{profile.company}</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light p-2 rounded-3 text-primary"><i className="bi bi-geo-alt-fill"></i></div>
                <div>
                  <div className="text-muted x-small fw-bold">Addresses</div>
                  <div className="small fw-bold lh-sm mb-1">Present: {profile.present_address}</div>
                  <div className="small text-muted lh-sm">Perm: {profile.permanent_address}</div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 3. Documents & NID Section */}
        <Card className="border-0 shadow-sm rounded-4 p-4">
          <h6 className="fw-bold text-dark mb-4 pb-2 border-bottom">Identification Documents</h6>
          <Row className="align-items-center">
            <Col md={6}>
               <div className="mb-3">
                  <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">NID Scan Copy</label>
                  {profile.nid_scan ? (
                    <a href={profile.nid_scan} target="_blank" rel="noreferrer">
                      <Image
                        src={profile.nid_scan}
                        className="rounded-3 border shadow-sm img-fluid"
                        style={{ maxHeight: '180px' }}
                      />
                    </a>
                  ) : (
                    <div className="p-4 bg-light rounded-3 text-center border border-dashed">
                      <i className="bi bi-file-earmark-text display-6 text-muted"></i>
                      <div className="small text-muted mt-2">No NID uploaded</div>
                    </div>
                  )}
               </div>
            </Col>
            <Col md={6}>
              <div className="bg-light p-4 rounded-4">
                <h6 className="fw-bold small mb-3"><i className="bi bi-clock-history me-2"></i>Previous Residency</h6>
                <div className="vstack gap-2 small">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Previous Address:</span>
                    <span className="fw-bold">{profile.previous_address || 'None'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Stay Duration:</span>
                    <span>{profile.from_date} to {profile.to_date}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Previous Landlord:</span>
                    <span className="fw-bold">{profile.landlord_name}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}