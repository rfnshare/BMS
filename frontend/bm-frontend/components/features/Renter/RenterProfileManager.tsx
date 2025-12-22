import { useEffect, useState } from "react";
import { RenterService } from "../../../logic/services/renterService";
import { Row, Col, Card, Spinner, Badge, Image, Button } from "react-bootstrap";

export default function RenterProfileManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await RenterService.getProfile();
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

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="x-small fw-bold text-muted text-uppercase mb-1 ls-1 d-block">
      {children}
    </label>
  );

  if (loading) return (
    <div className="text-center py-5 vstack gap-3 animate__animated animate__fadeIn">
      <Spinner animation="grow" variant="primary" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Retrieving Registry Data...</p>
    </div>
  );

  if (!profile) return (
    <div className="alert bg-warning bg-opacity-10 border-warning text-warning rounded-4 p-4 fw-bold ls-1">
      <i className="bi bi-exclamation-shield me-2"></i> RESIDENT DATA NOT FOUND IN LOCAL REGISTRY.
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">

      {/* 1. INDUSTRIAL HEADER (Blueprint DNA) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary border border-primary border-opacity-10 d-none d-md-block">
                <i className="bi bi-person-vcard fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Resident Registry</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                    Official Verification & Identity Record
                </p>
              </div>
            </div>
            <div className="ms-md-auto d-flex gap-2">
                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-10 px-3 py-2 rounded-pill x-small fw-bold ls-1">
                    <i className="bi bi-patch-check-fill me-1"></i> VERIFIED RESIDENT
                </Badge>
            </div>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* 2. IDENTITY SUMMARY CARD */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white border-start border-4 border-primary h-100">
            <div className="position-relative" style={{ height: '100px', background: 'linear-gradient(45deg, #1a1a1a, #333)' }}>
               <div className="position-absolute start-50 top-100 translate-middle">
                  <div className="bg-white p-1 rounded-circle shadow-sm border border-4 border-white">
                    <div className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center"
                         style={{ width: '100px', height: '100px' }}>
                        {profile.profile_pic ? (
                            <Image src={profile.profile_pic} className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <span className="display-6 fw-bold text-primary opacity-25">{profile.full_name?.charAt(0)}</span>
                        )}
                    </div>
                  </div>
               </div>
            </div>

            <Card.Body className="pt-5 mt-4 text-center px-4 pb-4">
              <h5 className="fw-bold mb-0 text-dark ls-1">{profile.full_name.toUpperCase()}</h5>
              <div className="text-muted x-small fw-bold font-monospace ls-1 mb-3">REG-ID: #00{profile.id}</div>

              <div className="vstack gap-4 pt-4 border-top text-start">
                 <div className="row g-2">
                    <Col xs={6}>
                        <Label>Marital Status</Label>
                        <div className="fw-bold text-dark small text-uppercase">{profile.marital_status}</div>
                    </Col>
                    <Col xs={6}>
                        <Label>Gender</Label>
                        <div className="fw-bold text-dark small text-uppercase">{profile.gender}</div>
                    </Col>
                 </div>

                 <div>
                    <Label>Emergency Response Contact</Label>
                    <div className="p-3 bg-light rounded-4 border border-dashed">
                        <div className="fw-bold text-primary small text-uppercase mb-1">{profile.emergency_contact_name}</div>
                        <div className="x-small text-muted fw-bold ls-1 mb-2">RELATION: {profile.relation?.toUpperCase()}</div>
                        <div className="fw-bold font-monospace text-dark small"><i className="bi bi-phone me-1"></i>{profile.emergency_contact_phone}</div>
                    </div>
                 </div>

                 <div>
                    <Label>Member Since</Label>
                    <div className="fw-bold text-dark font-monospace small">{new Date(profile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                 </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 3. PROFESSIONAL & LEGAL REGISTRY */}
        <Col lg={8}>
          <div className="vstack gap-4">

            {/* Professional & Contact Details */}
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-info">
              <h6 className="fw-bold text-info mb-4 text-uppercase ls-1 border-bottom pb-2">
                <i className="bi bi-briefcase me-2"></i>Professional & Contact Protocol
              </h6>
              <Row className="g-4">
                <Col md={6}>
                    <div className="vstack gap-4">
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-light p-2 rounded-3 text-info border"><i className="bi bi-phone"></i></div>
                            <div>
                                <Label>Contact Channel</Label>
                                <div className="fw-bold text-dark font-monospace">{profile.phone_number}</div>
                                {profile.alternate_phone && <small className="text-muted font-monospace x-small">ALT: {profile.alternate_phone}</small>}
                            </div>
                        </div>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-light p-2 rounded-3 text-info border"><i className="bi bi-envelope-at"></i></div>
                            <div>
                                <Label>Electronic Mail</Label>
                                <div className="fw-bold text-dark small">{profile.email}</div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="vstack gap-4">
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-light p-2 rounded-3 text-info border"><i className="bi bi-building-gear"></i></div>
                            <div>
                                <Label>Career / Occupation</Label>
                                <div className="fw-bold text-dark small text-uppercase">{profile.occupation}</div>
                                <div className="text-muted x-small fw-bold opacity-75">{profile.company?.toUpperCase()}</div>
                            </div>
                        </div>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-light p-2 rounded-3 text-info border"><i className="bi bi-geo"></i></div>
                            <div>
                                <Label>Address Registry</Label>
                                <div className="x-small fw-bold text-dark mb-1">PRESENT: {profile.present_address}</div>
                                <div className="x-small text-muted fw-bold">PERM: {profile.permanent_address}</div>
                            </div>
                        </div>
                    </div>
                </Col>
              </Row>
            </Card>

            {/* Legal Identification Documents */}
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-dark">
              <h6 className="fw-bold text-dark mb-4 text-uppercase ls-1 border-bottom pb-2">
                <i className="bi bi-shield-lock me-2"></i>Identification Documents
              </h6>
              <Row className="g-4 align-items-center">
                <Col md={5}>
                   <Label>Government NID Audit</Label>
                   {profile.nid_scan ? (
                     <div className="position-relative group">
                        <Image src={profile.nid_scan} className="rounded-4 border shadow-sm img-fluid" style={{ maxHeight: '200px' }} />
                        <a href={profile.nid_scan} target="_blank" rel="noreferrer"
                           className="position-absolute top-50 start-50 translate-middle btn btn-dark btn-sm rounded-pill px-3 opacity-0 group-hover-opacity-100 transition-all shadow-lg">
                           <i className="bi bi-zoom-in me-1"></i> VIEW FULL SCAN
                        </a>
                     </div>
                   ) : (
                     <div className="p-4 bg-light rounded-4 text-center border border-dashed vstack gap-2">
                       <i className="bi bi-file-earmark-x text-muted fs-3"></i>
                       <div className="x-small fw-bold text-muted text-uppercase ls-1">No NID Record Logged</div>
                     </div>
                   )}
                </Col>
                <Col md={7}>
                  <div className="bg-light p-4 rounded-4 border">
                    <h6 className="fw-bold x-small text-uppercase ls-1 mb-3 text-primary">
                        <i className="bi bi-clock-history me-2"></i>Residency History Audit
                    </h6>
                    <div className="vstack gap-3">
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="x-small fw-bold text-muted text-uppercase ls-1">Previous Registry</span>
                            <span className="fw-bold text-dark small text-end">{profile.previous_address || 'None Logged'}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="x-small fw-bold text-muted text-uppercase ls-1">Tenancy Span</span>
                            <span className="fw-bold text-dark font-monospace small">{profile.from_date} <i className="bi bi-arrow-right mx-1"></i> {profile.to_date}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="x-small fw-bold text-muted text-uppercase ls-1">Landlord Registry</span>
                            <span className="fw-bold text-dark small">{profile.landlord_name || 'N/A'}</span>
                        </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}