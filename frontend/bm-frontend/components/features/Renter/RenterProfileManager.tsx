import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

export default function RenterProfileManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // In your backend, this endpoint should return the Renter object
      // linked to the currently authenticated User.
      const res = await api.get("/renters/me/");
      setProfile(res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  if (!profile) return <div className="alert alert-warning">Profile data not found.</div>;

  return (
    <div className="row g-4 animate__animated animate__fadeIn">
      {/* LEFT COLUMN: AVATAR & STATUS */}
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm rounded-4 text-center p-4 bg-white">
          <div className="position-relative d-inline-block mx-auto mb-3">
            <img
              src={profile.profile_pic || "/avatar.png"}
              className="rounded-circle border border-4 border-white shadow-sm"
              style={{ width: 140, height: 140, objectFit: "cover" }}
              alt="Profile"
            />
            <span className={`position-absolute bottom-0 end-0 badge rounded-pill border border-white p-2 ${profile.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
              <span className="visually-hidden">Status</span>
            </span>
          </div>
          <h4 className="fw-bold mb-1 text-dark">{profile.full_name}</h4>
          <p className="text-muted small mb-3 text-uppercase fw-bold">{profile.status} Tenant</p>

          <div className="d-grid gap-2 mt-2">
            <div className="p-2 bg-light rounded-3 small fw-bold text-primary border border-primary-subtle">
              <i className="bi bi-calendar-event me-2"></i>
              Joined: {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES (Real data from your Django model choices) */}
        <div className="card border-0 shadow-sm rounded-4 mt-4 p-4 bg-white">
          <h6 className="fw-bold mb-3 small text-uppercase text-muted">Alert Preferences</h6>
          <div className="vstack gap-3">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small fw-medium"><i className="bi bi-envelope me-2 text-primary"></i>Email Notifications</span>
              <i className={`bi bi-${profile.prefers_email ? 'check-circle-fill text-success' : 'dash-circle text-muted'}`}></i>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <span className="small fw-medium"><i className="bi bi-whatsapp me-2 text-success"></i>WhatsApp Alerts</span>
              <i className={`bi bi-${profile.prefers_whatsapp ? 'check-circle-fill text-success' : 'dash-circle text-muted'}`}></i>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILED INFO */}
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between">
            <h5 className="fw-bold mb-0">Identity & Contact</h5>
            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">Request Update</button>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Phone Number</label>
                <div className="p-3 bg-light rounded-3 fw-bold">{profile.phone_number}</div>
              </div>
              <div className="col-md-6">
                <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Email Address</label>
                <div className="p-3 bg-light rounded-3 fw-bold">{profile.email || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Emergency Contact</label>
                <div className="p-3 bg-light rounded-3 fw-bold">{profile.emergency_contact_name || 'N/A'}</div>
              </div>
              <div className="col-md-6">
                <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Emergency Phone</label>
                <div className="p-3 bg-light rounded-3 fw-bold">{profile.emergency_contact_phone || 'N/A'}</div>
              </div>
              <div className="col-12">
                <label className="x-small text-muted fw-bold text-uppercase d-block mb-1">Permanent Address</label>
                <div className="p-3 bg-light rounded-3 small fw-medium">{profile.permanent_address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFIED DOCUMENTS */}
        <div className="card border-0 shadow-sm rounded-4 mt-4 bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4">
            <h5 className="fw-bold mb-0">Legal Documents</h5>
          </div>
          <div className="card-body p-4 pt-2">
            <div className="d-flex align-items-center p-3 border rounded-4 bg-light bg-opacity-50">
              <div className="bg-white p-2 rounded-3 me-3 shadow-sm text-danger">
                 <i className="bi bi-file-earmark-pdf fs-3"></i>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold small">Verified National ID (NID)</div>
                <div className="text-muted x-small text-uppercase fw-bold">Status: Digitally Verified</div>
              </div>
              <a href={profile.nid_scan} target="_blank" className="btn btn-sm btn-primary rounded-pill px-4 shadow-sm fw-bold">View File</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}