import { useState } from "react";
import { Renter, RenterService } from "../../../logic/services/renterService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Modal, Button, Spinner } from "react-bootstrap";

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

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "basic", label: "Info", icon: "person" },
    { key: "address", label: "Address", icon: "geo-alt" },
    { key: "residence", label: "History", icon: "clock-history" },
    { key: "emergency", label: "Work", icon: "briefcase" },
    { key: "uploads", label: "Docs", icon: "shield-check" },
  ];

  return (
    <Modal show onHide={onClose} size="xl" centered scrollable fullscreen="sm-down">
      <Modal.Header closeButton className="bg-white border-0 pt-4 px-3 px-md-4">
        <Modal.Title className="fw-bold h5 mb-0">
          {renter ? "Update Renter" : "Add Renter"}
        </Modal.Title>
      </Modal.Header>

      <div className="bg-white px-2 px-md-4 border-bottom sticky-top" style={{ top: 0, zIndex: 1020 }}>
        <ul className="nav nav-pills nav-fill p-1 bg-light rounded-pill mb-3 overflow-auto flex-nowrap">
          {tabs.map((tab) => (
            <li className="nav-item" key={tab.key}>
              <button
                className={`nav-link rounded-pill py-2 fw-bold small d-flex align-items-center justify-content-center gap-2 ${activeTab === tab.key ? "active shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`bi bi-${tab.icon}`}></i>
                <span className="d-none d-sm-inline">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal.Body className="p-3 p-md-4">
        {error && <div className="alert alert-danger border-0 small mb-4">{error}</div>}

        {activeTab === "basic" && (
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-muted text-uppercase">Full Name</label>
              <input className="form-control bg-light py-2" value={form.full_name} onChange={e => update("full_name", e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold text-muted text-uppercase">Phone</label>
              <input className="form-control bg-light py-2" type="tel" value={form.phone_number} onChange={e => update("phone_number", e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold text-muted text-uppercase">Status</label>
              <select className="form-select bg-light py-2 fw-bold" value={form.status} onChange={e => update("status", e.target.value)}>
                <option value="prospective">Prospective</option>
                <option value="active">Active</option>
                <option value="former">Former</option>
              </select>
            </div>
            <div className="col-12">
               <label className="form-label small fw-bold text-primary text-uppercase">Notify Via</label>
               <select className="form-select border-primary-subtle py-2" value={form.notification_preference} onChange={e => update("notification_preference", e.target.value)}>
                <option value="none">None</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        )}

        {/* Other tabs follow same 'row g-3' and 'col-12 col-md-X' pattern */}
        {activeTab === "address" && (
            <div className="row g-3">
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Present Address</label>
                    <textarea className="form-control bg-light" rows={3} value={form.present_address} onChange={e => update("present_address", e.target.value)} />
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Permanent Address</label>
                    <textarea className="form-control bg-light" rows={3} value={form.permanent_address} onChange={e => update("permanent_address", e.target.value)} />
                </div>
            </div>
        )}

        {activeTab === "uploads" && (
            <div className="row g-4 text-center">
                <div className="col-12 col-md-6">
                  <div className="p-3 border border-2 border-dashed rounded-4 bg-light">
                    <label className="form-label fw-bold text-primary small text-uppercase mb-3">Profile Photo</label>
                    <input type="file" className="form-control border-0 bg-transparent mb-2" accept="image/*" capture="user" onChange={e => setProfilePic(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-3 border border-2 border-dashed rounded-4 bg-light">
                    <label className="form-label fw-bold text-primary small text-uppercase mb-3">NID Scan</label>
                    <input type="file" className="form-control border-0 bg-transparent" accept=".pdf,.jpg" onChange={e => setNidScan(e.target.files?.[0] || null)} />
                  </div>
                </div>
            </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light p-3 border-0">
        <Button variant="link" className="text-muted text-decoration-none me-auto d-none d-md-block" onClick={onClose}>Discard</Button>
        <Button variant="primary" className="rounded-pill px-5 py-2 fw-bold w-100 w-md-auto shadow-sm" disabled={loading} onClick={save}>
          {loading ? <Spinner size="sm" className="me-2"/> : (renter ? "Update" : "Save")}
        </Button>
        <Button variant="outline-secondary" className="border-0 w-100 d-md-none mt-2" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}