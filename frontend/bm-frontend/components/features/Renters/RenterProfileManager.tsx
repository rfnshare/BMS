import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Renter, RenterService } from "../../../logic/services/renterService";

export default function RenterProfileManager() {
  const router = useRouter();
  const { id } = router.query;

  const [renter, setRenter] = useState<Renter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await RenterService.get(Number(id));
        setRenter(data);
      } catch {
        setError("Failed to load renter profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router.isReady, id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status"></div>
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
      <div className="fs-6 text-dark fw-medium">{value || <span className="text-light-emphasis">Not Provided</span>}</div>
    </div>
  );

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">

      {/* 1. MODERN HEADER CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="bg-primary p-5" style={{ height: '120px' }}></div>
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
                <span className={`badge rounded-pill px-3 py-2 ${
                  renter.status === "active" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"
                }`}>
                  {renter.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-muted mb-0 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                <i className="bi bi-geo-alt"></i> {renter.present_address}
              </p>
            </div>
            <div className="d-flex gap-2 pb-2">
              <button className="btn btn-outline-primary rounded-pill px-4">Message</button>
              <button className="btn btn-primary rounded-pill px-4">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: Contact & Work */}
        <div className="col-lg-8">

          {/* PERSONAL INFO SECTION */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Personal Information</h5>
            </div>
            <div className="card-body p-4">
              <div className="row">
                <InfoRow label="Email Address" value={renter.email} icon="envelope" />
                <InfoRow label="Phone Number" value={renter.phone_number} icon="telephone" />
                <InfoRow label="Date of Birth" value={renter.date_of_birth} icon="calendar-event" />
                <InfoRow label="Gender" value={renter.gender} icon="person" />
                <InfoRow label="Nationality" value={renter.nationality} icon="globe" />
                <InfoRow label="Occupation" value={renter.occupation} icon="briefcase" />
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
                <InfoRow label="Previous Landlord" value={renter.landlord_name} icon="person-badge" />
                <InfoRow label="Landlord Phone" value={renter.landlord_phone} icon="phone" />
              </div>
              <div className="row">
                <InfoRow label="Reason for Leaving" value={renter.reason_for_leaving} />
                <InfoRow label="Duration" value={`${renter.from_date || ''} to ${renter.to_date || ''}`} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Emergency & Documents */}
        <div className="col-lg-4">

          {/* EMERGENCY CONTACT */}
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

          {/* DOCUMENTS CARD */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Documents</h5>
            </div>
            <div className="card-body p-4">
              {renter.nid_scan ? (
                 <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
                    <i className="bi bi-file-earmark-pdf fs-2 text-danger me-3"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold small">NID Document</div>
                      <a href={renter.nid_scan} target="_blank" rel="noreferrer" className="text-decoration-none small">Click to View</a>
                    </div>
                 </div>
              ) : (
                <p className="text-muted small italic">No documents uploaded.</p>
              )}

              <div className="mt-3">
                <button className="btn btn-light w-100 rounded-pill text-primary fw-bold">Manage Documents</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}