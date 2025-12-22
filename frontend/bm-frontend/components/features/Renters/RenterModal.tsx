import { useState } from "react";
import { Modal, Button, Spinner, Row, Col, Form } from "react-bootstrap";

// Logic & Services
import { Renter, RenterService } from "../../../logic/services/renterService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Integrated your hook

interface Props {
  renter: Renter | null;
  onClose: () => void;
  onSaved: () => void;
}

type Tab = "basic" | "address" | "residence" | "emergency" | "uploads";

export default function RenterModal({ renter, onClose, onSaved }: Props) {
  // --- 1. HOOKS & STATE ---
  const { success, error: notifyError } = useNotify();
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

  // --- 2. HELPERS ---
  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  /**
   * Eye-catching Label Component with Mandatory Asterisk
   */
  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="form-label x-small fw-bold text-muted text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
      {children} {required && <span className="text-danger ms-1">*</span>}
    </label>
  );

  // --- 3. SAVE LOGIC ---
  const save = async () => {
    setServerError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (profilePic) fd.append("profile_pic", profilePic);
      if (nidScan) fd.append("nid_scan", nidScan);

      renter ? await RenterService.update(renter.id, fd) : await RenterService.create(fd);

      success(renter ? "Resident profile synchronized." : "New resident registered successfully.");
      onSaved();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setServerError(msg);
      notifyError(msg); // ✅ Notification logic context
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "basic", label: "Primary", icon: "person-vcard" },
    { key: "address", label: "Location", icon: "geo-alt" },
    { key: "residence", label: "History", icon: "clock-history" },
    { key: "emergency", label: "Work", icon: "briefcase" },
    { key: "uploads", label: "Docs", icon: "shield-lock" },
  ];

  return (
    <Modal show onHide={onClose} size="xl" centered scrollable contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
      {/* HEADER */}
      <Modal.Header closeButton className="bg-white border-0 pt-4 px-4">
        <Modal.Title className="fw-bold h5 mb-0 text-dark">
          {renter ? "Edit Renter Dossier" : "Register New Resident"}
        </Modal.Title>
      </Modal.Header>

      {/* SWIPEABLE TAB NAV (Pill Design) */}
      <div className="bg-white px-4 border-bottom sticky-top" style={{ top: 0, zIndex: 1020 }}>
        <ul className="nav nav-pills nav-fill p-1 bg-light rounded-pill mb-3 overflow-auto flex-nowrap no-scrollbar border">
          {tabs.map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                className={`nav-link rounded-pill py-2 fw-bold small d-flex align-items-center justify-content-center gap-2 border-0 ${activeTab === t.key ? "active shadow-sm" : "text-secondary"}`}
                onClick={() => setActiveTab(t.key)}
              >
                <i className={`bi bi-${t.icon}`}></i>
                <span className="d-none d-md-inline">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal.Body className="p-4 pt-2">
        {serverError && <div className="alert alert-danger border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">{serverError}</div>}



        {/* TAB 1: PRIMARY INFO */}
        {activeTab === "basic" && (
          <Row className="g-3 animate__animated animate__fadeIn">
            <Col md={6}>
              <Label required>Full Name</Label>
              <input className="form-control border-light bg-light py-2 rounded-3" value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Full legal name" />
            </Col>
            <Col xs={6} md={3}>
              <Label required>Phone Number</Label>
              <input className="form-control border-light bg-light py-2 rounded-3 font-monospace" value={form.phone_number} onChange={e => update("phone_number", e.target.value)} />
            </Col>
            <Col xs={6} md={3}>
              <Label>Alt. Phone</Label>
              <input className="form-control border-light bg-light py-2 rounded-3 font-monospace" value={form.alternate_phone} onChange={e => update("alternate_phone", e.target.value)} />
            </Col>
            <Col md={6}>
              <Label>Email Address</Label>
              <input className="form-control border-light bg-light py-2 rounded-3" value={form.email} onChange={e => update("email", e.target.value)} />
            </Col>
            <Col xs={6} md={3}>
              <Label>Date of Birth</Label>
              <input type="date" className="form-control border-light bg-light py-2 rounded-3" value={form.date_of_birth} onChange={e => update("date_of_birth", e.target.value)} />
            </Col>
            <Col xs={6} md={3}>
              <Label>Gender</Label>
              <select className="form-select border-light bg-light py-2 rounded-3" value={form.gender} onChange={e => update("gender", e.target.value)}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Col>
            <Col xs={6} md={4}>
                <Label required>Marital Status</Label>
                <select className="form-select border-light bg-light py-2 rounded-3" value={form.marital_status} onChange={e => update("marital_status", e.target.value)}>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                </select>
            </Col>
            <Col xs={6} md={4}>
                <Label required>Sync Notifications</Label>
                <select className="form-select border-primary-subtle bg-white py-2 fw-bold text-primary rounded-3 shadow-sm" value={form.notification_preference} onChange={e => update("notification_preference", e.target.value)}>
                    <option value="none">Disabled</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="both">Both</option>
                </select>
            </Col>
            <Col md={4}>
                <Label>Nationality</Label>
                <input className="form-control border-light bg-light py-2 rounded-3" value={form.nationality} onChange={e => update("nationality", e.target.value)} />
            </Col>

            {form.marital_status === "married" && (
                <Col xs={12} className="bg-primary bg-opacity-10 rounded-4 p-3 border border-primary border-opacity-10 animate__animated animate__fadeInDown">
                    <Row className="g-2">
                        <Col md={6}>
                            <Label>Spouse Name</Label>
                            <input className="form-control border-0 shadow-sm" value={form.spouse_name} onChange={e => update("spouse_name", e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Label>Spouse Phone</Label>
                            <input className="form-control border-0 shadow-sm font-monospace" value={form.spouse_phone} onChange={e => update("spouse_phone", e.target.value)} />
                        </Col>
                    </Row>
                </Col>
            )}
          </Row>
        )}

        {/* TAB 2: ADDRESS */}
        {activeTab === "address" && (
            <Row className="g-3 animate__animated animate__fadeIn">
                <Col xs={12}>
                    <Label required>Present Address</Label>
                    <textarea className="form-control border-light bg-light rounded-4" rows={3} value={form.present_address} onChange={e => update("present_address", e.target.value)} />
                </Col>
                <Col xs={12}>
                    <Label>Permanent Address</Label>
                    <textarea className="form-control border-light bg-light rounded-4" rows={3} value={form.permanent_address} onChange={e => update("permanent_address", e.target.value)} />
                </Col>
            </Row>
        )}

        {/* TAB 3: RESIDENCE HISTORY */}
        {activeTab === "residence" && (
            <Row className="g-3 animate__animated animate__fadeIn">
                <Col xs={12}>
                    <Label>Previous Rental Address</Label>
                    <textarea className="form-control border-light bg-light rounded-4" rows={2} value={form.previous_address} onChange={e => update("previous_address", e.target.value)} />
                </Col>
                <Col md={6}>
                    <Label>Landlord Name</Label>
                    <input className="form-control border-light bg-light py-2 rounded-3" value={form.landlord_name} onChange={e => update("landlord_name", e.target.value)} />
                </Col>
                <Col md={6}>
                    <Label>Landlord Phone</Label>
                    <input className="form-control border-light bg-light py-2 rounded-3 font-monospace" value={form.landlord_phone} onChange={e => update("landlord_phone", e.target.value)} />
                </Col>
                <Col xs={6}>
                    <Label>Stayed From</Label>
                    <input type="date" className="form-control border-light bg-light py-2 rounded-3" value={form.from_date} onChange={e => update("from_date", e.target.value)} />
                </Col>
                <Col xs={6}>
                    <Label>Stayed To</Label>
                    <input type="date" className="form-control border-light bg-light py-2 rounded-3" value={form.to_date} onChange={e => update("to_date", e.target.value)} />
                </Col>
                <Col xs={12}>
                    <Label>Reason for Leaving</Label>
                    <input className="form-control border-light bg-light py-2 rounded-3" value={form.reason_for_leaving} onChange={e => update("reason_for_leaving", e.target.value)} />
                </Col>
            </Row>
        )}

        {/* TAB 4: WORK & EMERGENCY */}
        {activeTab === "emergency" && (
            <Row className="g-3 animate__animated animate__fadeIn">
                <Col md={6}>
                    <Label required>Occupation</Label>
                    <input className="form-control border-light bg-light py-2 rounded-3" value={form.occupation} onChange={e => update("occupation", e.target.value)} />
                </Col>
                <Col md={6}>
                    <Label>Company/Employer</Label>
                    <input className="form-control border-light bg-light py-2 rounded-3" value={form.company} onChange={e => update("company", e.target.value)} />
                </Col>
                <Col xs={12}>
                    <Label>Office Address</Label>
                    <input className="form-control border-light bg-light py-2 rounded-3" value={form.office_address} onChange={e => update("office_address", e.target.value)} />
                </Col>
                <div className="border-top my-3 opacity-10"></div>
                <Col md={4}>
                    <Label required>Emergency Contact</Label>
                    <input className="form-control border-primary border-opacity-10 bg-primary bg-opacity-10 py-2 rounded-3 fw-bold" value={form.emergency_contact_name} onChange={e => update("emergency_contact_name", e.target.value)} />
                </Col>
                <Col xs={6} md={4}>
                    <Label required>Relation</Label>
                    <input className="form-control border-primary border-opacity-10 bg-primary bg-opacity-10 py-2 rounded-3" value={form.relation} onChange={e => update("relation", e.target.value)} />
                </Col>
                <Col xs={6} md={4}>
                    <Label required>Emergency Phone</Label>
                    <input className="form-control border-primary border-opacity-10 bg-primary bg-opacity-10 py-2 rounded-3 font-monospace" value={form.emergency_contact_phone} onChange={e => update("emergency_contact_phone", e.target.value)} />
                </Col>
            </Row>
        )}

        {/* TAB 5: UPLOADS */}
        {activeTab === "uploads" && (
            <Row className="g-4 text-center animate__animated animate__fadeIn">
                <Col md={6}>
                  <div className="p-4 border-2 border-dashed rounded-4 bg-light shadow-sm">
                    <Label required>Profile Photograph</Label>
                    <div className="my-3 d-flex justify-content-center">
                        {profilePic ? (
                            <img src={URL.createObjectURL(profilePic)} className="rounded-circle shadow border border-4 border-white" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                        ) : renter?.profile_pic ? (
                            <img src={renter.profile_pic} className="rounded-circle shadow border border-4 border-white" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                        ) : (
                            <div className="rounded-circle bg-white d-flex align-items-center justify-content-center text-muted border shadow-sm fs-1" style={{ width: "120px", height: "120px" }}>
                              <i className="bi bi-person-bounding-box"></i>
                            </div>
                        )}
                    </div>
                    <input type="file" className="form-control border-0 bg-white shadow-sm btn-sm" accept="image/*" onChange={e => setProfilePic(e.target.files?.[0] || null)} />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-4 border-2 border-dashed rounded-4 bg-light h-100 d-flex flex-column justify-content-center shadow-sm">
                    <Label required>Identity Proof (NID/Passport)</Label>
                    <div className="my-4">
                      {nidScan ? (
                          <div className="badge bg-success p-3 rounded-pill shadow-sm animate__animated animate__bounceIn">
                            <i className="bi bi-check-circle-fill me-2"></i> {nidScan.name}
                          </div>
                      ) : renter?.nid_scan ? (
                          <a href={renter.nid_scan} target="_blank" rel="noreferrer" className="btn btn-primary rounded-pill px-4 shadow-sm">
                            <i className="bi bi-file-earmark-pdf me-2"></i> View Stored NID
                          </a>
                      ) : (
                          <div className="text-muted small italic">
                            <i className="bi bi-cloud-arrow-up fs-2 d-block mb-2"></i>
                            Ready for secure upload
                          </div>
                      )}
                    </div>
                    <input type="file" className="form-control border-0 bg-white shadow-sm btn-sm" accept=".pdf,.jpg,.png" onChange={e => setNidScan(e.target.files?.[0] || null)} />
                  </div>
                </Col>
            </Row>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light p-3 border-0">
        <Button variant="link" className="text-muted text-decoration-none me-auto d-none d-md-block fw-bold" onClick={onClose}>Discard Changes</Button>
        <Button
          variant="primary"
          className="rounded-pill px-5 py-2 fw-bold w-100 w-md-auto shadow-sm"
          disabled={loading}
          onClick={save}
        >
          {loading ? <Spinner size="sm" className="me-2"/> : (renter ? "Sync Profile" : "Create Resident Profile")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}