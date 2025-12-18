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

  // 1. Initialize form with all fields to ensure Edit mode shows existing data
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

    // Address Fields
    present_address: renter?.present_address ?? "",
    permanent_address: renter?.permanent_address ?? "",

    // History Fields
    previous_address: renter?.previous_address ?? "",
    from_date: renter?.from_date ?? "",
    to_date: renter?.to_date ?? "",
    landlord_name: renter?.landlord_name ?? "",
    landlord_phone: renter?.landlord_phone ?? "",
    reason_for_leaving: renter?.reason_for_leaving ?? "",

    // Emergency & Work
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

      // Send all form fields (including empty strings to allow clearing data)
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v));
      });

      if (profilePic) fd.append("profile_pic", profilePic);
      if (nidScan) fd.append("nid_scan", nidScan);

      renter
        ? await RenterService.update(renter.id, fd)
        : await RenterService.create(fd);

      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0">

          {/* HEADER */}
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold text-primary">
              {renter ? "✏️ Edit Renter Profile" : "👤 Register New Renter"}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* TABS NAVIGATION */}
          <div className="bg-light border-bottom">
            <ul className="nav nav-pills nav-fill p-2 mx-2">
              {[
                ["basic", "Basic Info"],
                ["address", "Address"],
                ["residence", "History"],
                ["emergency", "Work & Emergency"],
                ["uploads", "Documents"],
              ].map(([key, label]) => (
                <li className="nav-item" key={key}>
                  <button
                    className={`nav-link py-2 ${activeTab === key ? "active fw-bold" : "text-secondary"}`}
                    onClick={() => setActiveTab(key as Tab)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* BODY */}
          <div className="modal-body p-4">
            {error && (
               <div className="alert alert-danger shadow-sm">
                 <ul className="mb-0">
                   {error.split("|").map((err, i) => <li key={i}>{err}</li>)}
                 </ul>
               </div>
            )}

            {/* BASIC INFO TAB */}
            {activeTab === "basic" && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input className="form-control" value={form.full_name} onChange={e => update("full_name", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input className="form-control" value={form.phone_number} onChange={e => update("phone_number", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Date of Birth</label>
                  <input type="date" className="form-control" value={form.date_of_birth} onChange={e => update("date_of_birth", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input className="form-control" value={form.email} onChange={e => update("email", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => update("gender", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Marital Status</label>
                  <select className="form-select" value={form.marital_status} onChange={e => update("marital_status", e.target.value)}>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>
              </div>
            )}

            {/* ADDRESS TAB */}
            {activeTab === "address" && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Present Address</label>
                  <textarea className="form-control" rows={4} value={form.present_address} onChange={e => update("present_address", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Permanent Address</label>
                  <textarea className="form-control" rows={4} value={form.permanent_address} onChange={e => update("permanent_address", e.target.value)} />
                </div>
              </div>
            )}

            {/* RESIDENCE HISTORY */}
            {activeTab === "residence" && (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Previous Rental Address</label>
                  <textarea className="form-control" rows={2} value={form.previous_address} onChange={e => update("previous_address", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Previous Landlord Name</label>
                  <input className="form-control" value={form.landlord_name} onChange={e => update("landlord_name", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Landlord Phone</label>
                  <input className="form-control" value={form.landlord_phone} onChange={e => update("landlord_phone", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Stayed From</label>
                  <input type="date" className="form-control" value={form.from_date} onChange={e => update("from_date", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Stayed To</label>
                  <input type="date" className="form-control" value={form.to_date} onChange={e => update("to_date", e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Reason for Leaving</label>
                  <input className="form-control" value={form.reason_for_leaving} onChange={e => update("reason_for_leaving", e.target.value)} />
                </div>
              </div>
            )}

            {/* EMERGENCY & WORK */}
            {activeTab === "emergency" && (
              <div className="row g-3">
                <div className="col-12"><h6 className="text-muted border-bottom pb-2">Work Information</h6></div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Occupation</label>
                  <input className="form-control" value={form.occupation} onChange={e => update("occupation", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Monthly Income</label>
                  <input type="number" className="form-control" value={form.monthly_income} onChange={e => update("monthly_income", e.target.value)} />
                </div>

                <div className="col-12 mt-4"><h6 className="text-muted border-bottom pb-2">Emergency Contact</h6></div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Contact Name</label>
                  <input className="form-control" value={form.emergency_contact_name} onChange={e => update("emergency_contact_name", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Relation</label>
                  <input className="form-control" value={form.relation} onChange={e => update("relation", e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Phone</label>
                  <input className="form-control" value={form.emergency_contact_phone} onChange={e => update("emergency_contact_phone", e.target.value)} />
                </div>
              </div>
            )}

            {/* UPLOADS */}
            {activeTab === "uploads" && (
              <div className="row g-4 text-center">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Profile Picture</label>
                  <div className="border rounded p-3 bg-light">
                    {/* Preview Logic */}
                    <div className="mb-3">
                      {profilePic ? (
                        <img src={URL.createObjectURL(profilePic)} alt="Preview" className="img-thumbnail" style={{ height: "150px" }} />
                      ) : renter?.profile_pic ? (
                        <img src={renter.profile_pic} alt="Current" className="img-thumbnail" style={{ height: "150px" }} />
                      ) : (
                        <div className="text-muted py-5 border">No Photo</div>
                      )}
                    </div>
                    <input type="file" className="form-control" accept="image/*" onChange={e => setProfilePic(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">NID Scan</label>
                  <div className="border rounded p-3 bg-light">
                    {/* Preview Logic for NID */}
                    <div className="mb-3">
                      {nidScan ? (
                        <div className="alert alert-info py-4">Selected: {nidScan.name}</div>
                      ) : renter?.nid_scan ? (
                        <a href={renter.nid_scan} target="_blank" rel="noreferrer" className="btn btn-outline-primary py-4 w-100">
                          View Current NID
                        </a>
                      ) : (
                        <div className="text-muted py-5 border">No Document</div>
                      )}
                    </div>
                    <input type="file" className="form-control" accept=".pdf,.jpg,.png" onChange={e => setNidScan(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer bg-light border-top">
            <button className="btn btn-outline-secondary px-4" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary px-5 fw-bold shadow-sm" disabled={loading} onClick={save}>
              {loading ? "Saving..." : renter ? "Update Renter" : "Save Renter"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}