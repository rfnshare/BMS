import { useState, useEffect } from "react";
import { Renter, RenterService } from "../../../logic/services/renterService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  renter: Renter | null;
  onClose: () => void;
  onSaved: () => void;
}

type Tab = "basic" | "address" | "residence" | "emergency" | "uploads";

export default function RenterModal({ renter, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const [form, setForm] = useState<any>({
    full_name: renter?.full_name ?? "",
    email: renter?.email ?? "",
    phone_number: renter?.phone_number ?? "",
    alternate_phone: renter?.alternate_phone ?? "",
    date_of_birth: renter?.date_of_birth ?? "",
    gender: renter?.gender ?? "",
    marital_status: renter?.marital_status ?? "single",
    spouse_name: renter?.spouse_name ?? "",
    spouse_phone: renter?.spouse_phone ?? "",
    nationality: renter?.nationality ?? "",
    status: renter?.status ?? "prospective",
    notification_preference: renter?.notification_preference ?? "none",
    present_address: renter?.present_address ?? "",
    permanent_address: renter?.permanent_address ?? "",
    previous_address: renter?.previous_address ?? "",
    from_date: renter?.from_date ?? "",
    to_date: renter?.to_date ?? "",
    landlord_name: renter?.landlord_name ?? "",
    landlord_phone: renter?.landlord_phone ?? "",
    reason_for_leaving: renter?.reason_for_leaving ?? "",
    emergency_contact_name: renter?.emergency_contact_name ?? "",
    relation: renter?.relation ?? "",
    emergency_contact_phone: renter?.emergency_contact_phone ?? "",
    occupation: renter?.occupation ?? "",
    company: renter?.company ?? "",
    office_address: renter?.office_address ?? "",
    monthly_income: renter?.monthly_income ?? "",
  });

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [nidScan, setNidScan] = useState<File | null>(null);

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (profilePic) fd.append("profile_pic", profilePic);
      if (nidScan) fd.append("nid_scan", nidScan);

      renter ? await RenterService.update(renter.id, fd) : await RenterService.create(fd);
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(5px)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

          {/* HEADER */}
          <div className="modal-header border-0 bg-white pt-4 px-4">
            <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              {renter ? "✏️ Update Renter Profile" : "👤 Register New Tenant"}
            </h5>
            <button className="btn-close shadow-none" onClick={onClose} />
          </div>

          {/* TABS NAVIGATION */}
          <div className="bg-white px-4 border-bottom">
            <ul className="nav nav-pills nav-fill p-1 bg-light rounded-pill mb-3">
              {[
                ["basic", "Primary"],
                ["address", "Address"],
                ["residence", "History"],
                ["emergency", "Work/Emergency"],
                ["uploads", "Identity Docs"],
              ].map(([key, label]) => (
                <li className="nav-item" key={key}>
                  <button
                    className={`nav-link rounded-pill py-2 fw-bold small ${activeTab === key ? "active bg-primary shadow-sm" : "text-secondary"}`}
                    onClick={() => setActiveTab(key as Tab)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* BODY */}
          <div className="modal-body p-4 pt-2">
            {error && (
               <div className="alert alert-danger border-0 shadow-sm mb-4">
                 <ul className="mb-0 small fw-bold">
                   {error.split("|").map((err, i) => <li key={i}>{err}</li>)}
                 </ul>
               </div>
            )}

            {/* TAB: BASIC */}
{activeTab === "basic" && (
  <div className="row g-4">
    <div className="col-md-6">
      <label className="form-label small fw-bold text-muted text-uppercase">Full Name</label>
      <input className="form-control border-2 bg-light" value={form.full_name} onChange={e => update("full_name", e.target.value)} />
    </div>
    <div className="col-md-3">
      <label className="form-label small fw-bold text-muted text-uppercase">Phone Number</label>
      <input className="form-control border-2 bg-light font-monospace" value={form.phone_number} onChange={e => update("phone_number", e.target.value)} />
    </div>
    <div className="col-md-3">
      <label className="form-label small fw-bold text-muted text-uppercase">Date of Birth</label>
      <input type="date" className="form-control border-2 bg-light" value={form.date_of_birth} onChange={e => update("date_of_birth", e.target.value)} />
    </div>

    <div className="col-md-6">
      <label className="form-label small fw-bold text-muted text-uppercase">Email Address</label>
      <input className="form-control border-2 bg-light" value={form.email} onChange={e => update("email", e.target.value)} />
    </div>

    {/* 🔥 NOTIFICATION PREFERENCE: Updated to match your Django Choices */}
    <div className="col-md-6">
      <label className="form-label small fw-bold text-primary text-uppercase">
        <i className="bi bi-whatsapp me-2"></i>Notification Channel
      </label>
      <select
        className="form-select border-2 border-primary-subtle bg-white fw-bold"
        value={form.notification_preference}
        onChange={e => update("notification_preference", e.target.value)}
      >
        <option value="none">None (Manual Tracking)</option>
        <option value="email">Email Only</option>
        <option value="whatsapp">WhatsApp Only</option>
        <option value="both">Both Email & WhatsApp</option>
      </select>
      <div className="form-text x-small text-muted italic">Used for automated invoicing and receipts.</div>
    </div>

    <div className="col-md-4">
      <label className="form-label small fw-bold text-muted text-uppercase">Gender</label>
      <select className="form-select border-2 bg-light" value={form.gender} onChange={e => update("gender", e.target.value)}>
        <option value="">Select...</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div className="col-md-4">
      <label className="form-label small fw-bold text-muted text-uppercase">Marital Status</label>
      <select className="form-select border-2 bg-light" value={form.marital_status} onChange={e => update("marital_status", e.target.value)}>
        <option value="single">Single</option>
        <option value="married">Married</option>
        <option value="divorced">Divorced</option>
        <option value="widowed">Widowed</option> {/* Added to match your model */}
      </select>
    </div>

    <div className="col-md-4">
      <label className="form-label small fw-bold text-muted text-uppercase">Current Status</label>
      <select className="form-select border-2 bg-light fw-bold" value={form.status} onChange={e => update("status", e.target.value)}>
        <option value="prospective">Prospective</option>
        <option value="active">Active</option>
        <option value="former">Former</option>
      </select>
    </div>

    {/* Dynamic Spouse Info */}
    {form.marital_status === "married" && (
      <div className="col-12 p-3 bg-primary-subtle rounded-4 row g-3 mx-0 animate__animated animate__fadeIn">
        <div className="col-md-6">
          <label className="form-label small fw-bold text-primary text-uppercase">Spouse Name</label>
          <input className="form-control border-primary-subtle" value={form.spouse_name} onChange={e => update("spouse_name", e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-primary text-uppercase">Spouse Phone</label>
          <input className="form-control border-primary-subtle font-monospace" value={form.spouse_phone} onChange={e => update("spouse_phone", e.target.value)} />
        </div>
      </div>
    )}
  </div>
)}

            {/* TAB: ADDRESS */}
            {activeTab === "address" && (
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Present Address</label>
                  <textarea className="form-control border-2 bg-light" rows={5} value={form.present_address} onChange={e => update("present_address", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Permanent Address</label>
                  <textarea className="form-control border-2 bg-light" rows={5} value={form.permanent_address} onChange={e => update("permanent_address", e.target.value)} />
                </div>
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === "residence" && (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Previous Rental Address</label>
                  <textarea className="form-control border-2 bg-light" rows={2} value={form.previous_address} onChange={e => update("previous_address", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Previous Landlord</label>
                  <input className="form-control border-2 bg-light" value={form.landlord_name} onChange={e => update("landlord_name", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Stayed From</label>
                  <input type="date" className="form-control border-2 bg-light" value={form.from_date} onChange={e => update("from_date", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Stayed To</label>
                  <input type="date" className="form-control border-2 bg-light" value={form.to_date} onChange={e => update("to_date", e.target.value)} />
                </div>
              </div>
            )}

            {/* TAB: EMERGENCY & WORK */}
            {activeTab === "emergency" && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Occupation</label>
                  <input className="form-control border-2 bg-light" value={form.occupation} onChange={e => update("occupation", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Company/Employer</label>
                  <input className="form-control border-2 bg-light" value={form.company} onChange={e => update("company", e.target.value)} />
                </div>
                <hr className="my-4 opacity-10" />
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Emergency Contact</label>
                  <input className="form-control border-2 bg-light" value={form.emergency_contact_name} onChange={e => update("emergency_contact_name", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Relationship</label>
                  <input className="form-control border-2 bg-light" value={form.relation} onChange={e => update("relation", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Emergency Phone</label>
                  <input className="form-control border-2 bg-light" value={form.emergency_contact_phone} onChange={e => update("emergency_contact_phone", e.target.value)} />
                </div>
              </div>
            )}

            {/* TAB: UPLOADS */}
            {activeTab === "uploads" && (
              <div className="row g-4 text-center">
                <div className="col-md-6">
                  <div className="p-4 border border-2 border-dashed rounded-4 bg-light shadow-sm transition-all h-100">
                    <label className="form-label fw-bold text-primary mb-3 text-uppercase small">Profile Photograph</label>
                    <div className="mb-3 d-flex justify-content-center">
                      {profilePic ? (
                        <img src={URL.createObjectURL(profilePic)} className="rounded-circle border border-4 border-white shadow-sm" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                      ) : renter?.profile_pic ? (
                        <img src={renter.profile_pic} className="rounded-circle border border-4 border-white shadow-sm" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                      ) : (
                        <div className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center text-muted border" style={{ width: "120px", height: "120px" }}>No Photo</div>
                      )}
                    </div>
                    <input type="file" className="form-control border-0 shadow-none" accept="image/*" onChange={e => setProfilePic(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-4 border border-2 border-dashed rounded-4 bg-light shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                      <label className="form-label fw-bold text-primary mb-3 text-uppercase small">NID / ID Card Scan</label>
                      <div className="mb-3">
                        {nidScan ? (
                          <div className="alert alert-success py-4 mb-0 fw-bold small">✅ {nidScan.name} Selected</div>
                        ) : renter?.nid_scan ? (
                          <a href={renter.nid_scan} target="_blank" rel="noreferrer" className="btn btn-outline-primary py-4 w-100 fw-bold shadow-sm">📂 View Stored NID Document</a>
                        ) : (
                          <div className="py-4 border rounded bg-white text-muted small italic">No NID file uploaded yet.</div>
                        )}
                      </div>
                    </div>
                    <input type="file" className="form-control border-0 shadow-none" accept=".pdf,.jpg,.png" onChange={e => setNidScan(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0 bg-light py-3 px-4">
            <button className="btn btn-link text-decoration-none text-secondary fw-bold px-4" onClick={onClose}>Discard</button>
            <button className="btn btn-primary px-5 py-2 fw-bold shadow-sm rounded-pill" disabled={loading} onClick={save}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Saving Profile...</>
              ) : (
                renter ? "Update Renter Data" : "Register & Create Renter"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}