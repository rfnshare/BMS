import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Renter, RenterService } from "../../../logic/services/renterService";
import { UnitService } from "../../../logic/services/unitService"; // Assuming you have this
import api from "../../../logic/services/apiClient"; // For the custom lease call
import { Badge, Spinner } from "react-bootstrap";
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

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const loadAllData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Fetch Renter
      const renterData = await RenterService.get(Number(id));
      setRenter(renterData);

      // 2. Fetch Lease for this Renter
      const leaseRes = await api.get(`/leases/leases/?renter=${id}`);
      const activeLease = leaseRes.data.results?.find((l: any) => l.status === "active") || leaseRes.data.results?.[0];

      if (activeLease) {
        setLease(activeLease);
        // 3. Fetch Unit details using the unit ID from lease
        const unitData = await UnitService.retrieve(activeLease.unit);
        setUnit(unitData);
      }
    } catch (err) {
      console.error("Load Error:", err);
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

  if (error) return <div className="alert alert-danger m-4 border-0 shadow-sm">{error}</div>;
  if (!renter) return null;

  const InfoRow = ({ label, value, icon }: { label: string; value?: any; icon?: string }) => (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="d-flex align-items-center gap-2 mb-1">
        {icon && <i className={`bi bi-${icon} text-primary opacity-75`}></i>}
        <span className="fw-bold text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div className="fs-6 text-dark fw-medium text-capitalize">{value || <span className="text-light-emphasis">Not Provided</span>}</div>
    </div>
  );

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* 1. MODERN HEADER CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="bg-primary p-5" style={{ background: 'linear-gradient(45deg, #0d6efd, #0099ff)', height: '120px' }}></div>
        <div className="card-body px-4 pt-0 pb-4">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-4" style={{ marginTop: '-60px' }}>
            <img
              src={renter.profile_pic || "/avatar.png"}
              alt={renter.full_name}
              className="rounded-circle border border-5 border-white shadow-sm"
              style={{ width: 140, height: 140, objectFit: "cover", backgroundColor: 'white' }}
            />
            <div className="flex-grow-1 text-center text-md-start pb-2">
              <div className="d-flex flex-column flex-md-row align-items-center gap-2">
                <h2 className="fw-bold mb-0">{renter.full_name}</h2>
                <div className="d-flex gap-2">
                    <Badge pill bg={renter.status === "active" ? "success" : "secondary"} className="px-3 py-2">
                    {renter.status?.toUpperCase()}
                    </Badge>
                    {renter.is_active && (
                        <Badge pill bg="primary" className="px-3 py-2">
                            <i className="bi bi-patch-check-fill me-1"></i> VERIFIED
                        </Badge>
                    )}
                </div>
              </div>
              <p className="text-muted mb-0 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                <i className="bi bi-geo-alt"></i> {renter.present_address}
              </p>
            </div>
            <div className="d-flex gap-2 pb-2">
              <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => setShowEditModal(true)}>
                <i className="bi bi-pencil-square me-2"></i>Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">

          {/* 🔥 LEASE & UNIT INFO (New Logic Integrated) */}
          {lease ? (
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden border-start border-4 border-success">
               <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="fw-bold mb-0 text-success"><i className="bi bi-house-check-fill me-2"></i>Active Lease</h5>
                        <small className="text-muted">Lease ID: #{lease.id}</small>
                    </div>
                    <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => router.push(`/admin-dashboard/leases/${lease.id}`)}>
                        View Contract <i className="bi bi-arrow-right small"></i>
                    </button>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">
                        <small className="text-muted fw-bold text-uppercase x-small d-block">Unit & Floor</small>
                        <span className="fw-bold fs-5">{unit?.name || 'Loading...'}</span>
                        <div className="small text-muted">Floor ID: {unit?.floor || lease.unit}</div>
                    </div>
                    <div className="col-md-4">
                        <small className="text-muted fw-bold text-uppercase x-small d-block">Monthly Rent</small>
                        <span className="fw-bold fs-5 text-dark">৳{Number(lease.rent_amount).toLocaleString()}</span>
                        <div className="small text-muted">Balance: ৳{lease.current_balance}</div>
                    </div>
                    <div className="col-md-4">
                        <small className="text-muted fw-bold text-uppercase x-small d-block">Lease Dates</small>
                        <span className="fw-bold">{new Date(lease.start_date).toLocaleDateString()}</span>
                        <div className="small text-muted">To: {lease.end_date || 'N/A (Open)'}</div>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="alert alert-info rounded-4 border-0 shadow-sm p-4 d-flex align-items-center mb-4">
                <i className="bi bi-info-circle-fill fs-3 me-3"></i>
                <div>
                    <h6 className="fw-bold mb-0">No Active Lease Found</h6>
                    <small>This renter is currently not assigned to any building units.</small>
                </div>
            </div>
          )}

          {/* PERSONAL & PROFESSIONAL INFO */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Identity & Profession</h5>
            </div>
            <div className="card-body p-4">
              <div className="row">
                <InfoRow label="Email Address" value={renter.email} icon="envelope" />
                <InfoRow label="Phone Number" value={renter.phone_number} icon="telephone" />
                <InfoRow label="Date of Birth" value={renter.date_of_birth} icon="calendar-event" />
                <InfoRow label="Gender" value={renter.gender} icon="person" />
                <InfoRow label="Marital Status" value={renter.marital_status} icon="heart" />
                <InfoRow label="Occupation" value={renter.occupation} icon="briefcase" />
                <InfoRow label="Company" value={renter.company} icon="building" />
                <InfoRow label="Work Address" value={renter.office_address} icon="geo" />
                <InfoRow label="Notification" value={renter.notification_preference} icon="bell" />
              </div>
            </div>
          </div>

          {/* RESIDENCE HISTORY */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Residence History</h5>
            </div>
            <div className="card-body p-4">
              <div className="row border-bottom mb-4 pb-2">
                <InfoRow label="Permanent Address" value={renter.permanent_address} icon="house-lock" />
                <InfoRow label="Previous Address" value={renter.previous_address} icon="geo-alt" />
                <InfoRow label="Previous Landlord" value={renter.landlord_name} icon="person-badge" />
              </div>
              <div className="row">
                <InfoRow label="Landlord Phone" value={renter.landlord_phone} icon="phone" />
                <InfoRow label="Reason for Leaving" value={renter.reason_for_leaving} icon="chat-left-text" />
                <InfoRow label="Stay Duration" value={`${renter.from_date || ''} to ${renter.to_date || ''}`} icon="clock-history" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-danger-subtle border-start border-danger border-4">
            <div className="card-body p-4">
              <h6 className="fw-bold text-danger mb-3">Emergency Contact</h6>
              <div className="fw-bold fs-5">{renter.emergency_contact_name}</div>
              <div className="text-danger-emphasis small mb-2">{renter.relation}</div>
              <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                <i className="bi bi-telephone-fill"></i> {renter.emergency_contact_phone}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between">
              <h5 className="fw-bold mb-0">Documents</h5>
              <i className="bi bi-shield-check text-success"></i>
            </div>
            <div className="card-body p-4">
              {renter.nid_scan && (
                 <div className="d-flex align-items-center p-3 border rounded-3 mb-3 bg-light">
                    <i className="bi bi-card-text fs-3 text-primary me-3"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold small">NID Card Scan</div>
                      <a href={renter.nid_scan} target="_blank" rel="noreferrer" className="text-decoration-none small">View Identification</a>
                    </div>
                 </div>
              )}

              {renter.documents?.map((doc: any) => (
                    <div key={doc.id} className="d-flex align-items-center p-3 border rounded-3 mb-2">
                        <i className={`bi ${doc.file.endsWith('.docx') || doc.file.endsWith('.pdf') ? 'bi-file-earmark-pdf' : 'bi-image'} fs-3 text-secondary me-3`}></i>
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold small text-capitalize text-truncate">{doc.doc_type}</div>
                            <a href={doc.file} target="_blank" rel="noreferrer" className="text-decoration-none small">Download File</a>
                        </div>
                    </div>
              ))}

              <div className="mt-4 pt-3 border-top">
                <button className="btn btn-outline-secondary w-100 rounded-pill btn-sm fw-bold" onClick={() => setShowDocModal(true)}>
                    Manage Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && <RenterModal renter={renter} onClose={() => setShowEditModal(false)} onSaved={() => loadAllData()} />}
      {showDocModal && <RenterDocumentsModal renter={renter} onClose={() => setShowDocModal(false)} />}
    </div>
  );
}