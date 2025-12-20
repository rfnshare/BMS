import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Renter, RenterService } from "../../../logic/services/renterService";
import { UnitService } from "../../../logic/services/unitService";
import api from "../../../logic/services/apiClient";
import { Badge, Spinner, Row, Col, Card } from "react-bootstrap";
import RenterModal from "./RenterModal";
import RenterDocumentsModal from "./RenterDocumentsModal";

export default function RenterProfileManager() {
  const router = useRouter();
  const { id } = router.query;

  const [renter, setRenter] = useState<any | null>(null);
  const [lease, setLease] = useState<any | null>(null);
  const [unit, setUnit] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const loadAllData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const renterData = await RenterService.get(Number(id));
      setRenter(renterData);

      const leaseRes = await api.get(`/leases/leases/?renter=${id}`);
      const results = leaseRes.data.results || [];
      const activeLease = results.find((l: any) => l.status === "active");
      const lastTerminated = !activeLease ? results.find((l: any) => l.status === "terminated") : null;
      const displayLease = activeLease || lastTerminated;

      if (displayLease) {
        setLease(displayLease);
        const unitData = await UnitService.retrieve(displayLease.unit);
        setUnit(unitData);
      } else {
        setLease(null);
        setUnit(null);
      }
    } catch (err) {
      setError("Failed to load full profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) loadAllData();
  }, [router.isReady, id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!renter) return null;

  const InfoBlock = ({ label, value, icon }: { label: string; value?: any; icon: string }) => (
    <div className="col-12 col-md-6 col-lg-4 mb-3 mb-md-4">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className={`bi bi-${icon} text-primary opacity-75 small`}></i>
        <span className="fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div className="small text-dark fw-bold text-capitalize">
        {value || <span className="text-muted fw-normal italic">N/A</span>}
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3 bg-light min-vh-100 px-2 px-md-3">
      {/* 1. COMPACT MOBILE HEADER */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
        <div className="bg-primary" style={{ background: 'linear-gradient(45deg, #0d6efd, #0099ff)', height: '80px' }}></div>
        <div className="card-body px-3 pt-0 pb-3">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-3" style={{ marginTop: '-40px' }}>
            <img
              src={renter.profile_pic || "/avatar.png"}
              alt={renter.full_name}
              className="rounded-circle border border-4 border-white shadow-sm bg-white"
              style={{ width: 100, height: 100, objectFit: "cover" }}
            />
            <div className="flex-grow-1 text-center text-md-start pb-1">
              <h4 className="fw-bold mb-1">{renter.full_name}</h4>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                <Badge pill bg={renter.status === "active" ? "success" : "secondary"} className="x-small">
                  {renter.status?.toUpperCase()}
                </Badge>
                {renter.is_active && <Badge pill bg="primary" className="x-small">VERIFIED</Badge>}
              </div>
            </div>
            <button className="btn btn-primary rounded-pill px-4 btn-sm fw-bold w-100 w-md-auto" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <Row className="g-3">
        <Col lg={8}>
          {/* LEASE CARD */}
          {lease ? (
            <div className={`card border-0 shadow-sm rounded-4 mb-3 border-start border-4 ${lease.status === 'active' ? 'border-success' : 'border-secondary'}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0"><i className="bi bi-house-door me-2"></i>Current Unit</h6>
                  <button className="btn btn-sm btn-light border rounded-pill px-3 x-small fw-bold" onClick={() => router.push(`/admin-dashboard/leases?viewId=${lease.id}`)}>
                    Details
                  </button>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted x-small fw-bold text-uppercase d-block">Unit</small>
                    <div className="fw-bold small">{unit?.name || '---'}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted x-small fw-bold text-uppercase d-block">Rent</small>
                    <div className="fw-bold small text-danger">৳{Number(lease.rent_amount).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info rounded-4 border-0 p-3 small mb-3">
              <i className="bi bi-info-circle me-2"></i> No active lease found.
            </div>
          )}

          {/* IDENTITY & PROFESSION */}
          <div className="card border-0 shadow-sm rounded-4 mb-3 p-3">
            <h6 className="fw-bold mb-3 text-uppercase small text-primary">Identity & Profession</h6>
            <div className="row">
              <InfoBlock label="Email" value={renter.email} icon="envelope" />
              <InfoBlock label="Phone" value={renter.phone_number} icon="telephone" />
              <InfoBlock label="Occupation" value={renter.occupation} icon="briefcase" />
              <InfoBlock label="Company" value={renter.company} icon="building" />
            </div>
          </div>

          {/* RESIDENCE HISTORY */}
          <div className="card border-0 shadow-sm rounded-4 mb-3 p-3">
            <h6 className="fw-bold mb-3 text-uppercase small text-primary">Residence History</h6>
            <InfoBlock label="Permanent Address" value={renter.permanent_address} icon="house-lock" />
            <InfoBlock label="Previous Landlord" value={renter.landlord_name} icon="person-badge" />
            <InfoBlock label="Landlord Phone" value={renter.landlord_phone} icon="phone" />
          </div>
        </Col>

        {/* RIGHT COLUMN */}
        <Col lg={4}>
          <div className="card border-0 shadow-sm rounded-4 mb-3 bg-danger-subtle border-start border-danger border-4 p-3">
            <h6 className="fw-bold text-danger x-small text-uppercase mb-2">Emergency Contact</h6>
            <div className="fw-bold small">{renter.emergency_contact_name} ({renter.relation})</div>
            <div className="fw-bold mt-1 small"><i className="bi bi-telephone-fill me-1"></i> {renter.emergency_contact_phone}</div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-3">
            <div className="d-flex justify-content-between mb-3">
              <h6 className="fw-bold mb-0 small text-uppercase">Documents</h6>
              <i className="bi bi-shield-check text-success"></i>
            </div>
            <div className="vstack gap-2">
              {renter.nid_scan && (
                <a href={renter.nid_scan} target="_blank" rel="noreferrer" className="p-2 border rounded-3 bg-light text-decoration-none d-flex align-items-center gap-2">
                  <i className="bi bi-card-text text-primary fs-5"></i>
                  <span className="small fw-bold text-dark">NID Card</span>
                </a>
              )}
              {renter.documents?.map((doc: any) => (
                <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer" className="p-2 border rounded-3 text-decoration-none d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-secondary fs-5"></i>
                  <span className="small text-dark text-truncate">{doc.doc_type}</span>
                </a>
              ))}
              <button className="btn btn-outline-secondary w-100 rounded-pill btn-sm fw-bold mt-2" onClick={() => setShowDocModal(true)}>
                Manage Docs
              </button>
            </div>
          </div>
        </Col>
      </Row>

      {showEditModal && <RenterModal renter={renter} onClose={() => setShowEditModal(false)} onSaved={() => loadAllData()} />}
      {showDocModal && <RenterDocumentsModal renter={renter} onClose={() => setShowDocModal(false)} />}
    </div>
  );
}