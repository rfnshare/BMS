import { useState } from "react";
import {Modal, Button, Spinner, Row, Col, Form, Badge} from "react-bootstrap";

// Logic & Services
import { Renter, RenterService } from "../../../logic/services/renterService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";

interface Props {
  renter: Renter | null;
  onClose: () => void;
  onSaved: () => void;
}

type Tab = "basic" | "address" | "residence" | "emergency" | "uploads";

export default function RenterModal({ renter, onClose, onSaved }: Props) {
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

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  // Blueprint Typography Label
  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <Form.Label className="x-small fw-bold text-muted text-uppercase mb-1 ls-1">
      {children} {required && <span className="text-danger">*</span>}
    </Form.Label>
  );

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
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "basic", label: "Identity", icon: "person-vcard" },
    { key: "address", label: "Location", icon: "geo-alt" },
    { key: "residence", label: "History", icon: "clock-history" },
    { key: "emergency", label: "Work", icon: "briefcase" },
    { key: "uploads", label: "Vault", icon: "shield-lock" },
  ];

  return (
    <Modal
        show onHide={onClose} size="xl" centered
        fullscreen="sm-down" // ✅ Mobile Fullscreen
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className={`bi bi-person-bounding-box fs-5 text-primary`}></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
              {renter ? "Modify Renter Dossier" : "Register New Resident"}
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Identity & Residency Management Logic
            </div>
          </div>
        </div>
      </Modal.Header>

      {/* 2. TAB NAV: Segmented Control Style */}
      <div className="bg-white px-3 px-md-4 border-bottom sticky-top" style={{ top: 0, zIndex: 1020 }}>
        <ul className="nav nav-pills nav-fill p-1 bg-light rounded-pill my-3 border overflow-auto flex-nowrap no-scrollbar">
          {tabs.map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                className={`nav-link rounded-pill py-2 fw-bold x-small d-flex align-items-center justify-content-center gap-2 border-0 ls-1 ${activeTab === t.key ? "active shadow-sm" : "text-muted"}`}
                onClick={() => setActiveTab(t.key)}
              >
                <i className={`bi bi-${t.icon}`}></i>
                <span className="text-uppercase">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal.Body className="p-4 bg-light">
        {serverError && <div className="alert alert-danger border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">{serverError}</div>}

        <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white">
            {/* TAB 1: PRIMARY IDENTITY */}
            {activeTab === "basic" && (
            <Row className="g-3 animate__animated animate__fadeIn">
                <Col md={6}>
                <Label required>Full Legal Name</Label>
                <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Enter full name" />
                </Col>
                <Col xs={6} md={3}>
                <Label required>Phone Number</Label>
                <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 font-monospace small shadow-none" value={form.phone_number} onChange={e => update("phone_number", e.target.value)} />
                </Col>
                <Col xs={6} md={3}>
                <Label>Alt. Phone</Label>
                <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 font-monospace small shadow-none" value={form.alternate_phone} onChange={e => update("alternate_phone", e.target.value)} />
                </Col>
                <Col md={6}>
                <Label>Email Address</Label>
                <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={form.email} onChange={e => update("email", e.target.value)} />
                </Col>
                <Col xs={6} md={3}>
                <Label>Date of Birth</Label>
                <Form.Control type="date" className="rounded-pill bg-light border-0 py-2 ps-3 small shadow-none" value={form.date_of_birth} onChange={e => update("date_of_birth", e.target.value)} />
                </Col>
                <Col xs={6} md={3}>
                <Label>Gender</Label>
                <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={form.gender} onChange={e => update("gender", e.target.value)}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </Form.Select>
                </Col>
                <Col xs={6} md={4}>
                    <Label required>Marital Status</Label>
                    <Form.Select className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={form.marital_status} onChange={e => update("marital_status", e.target.value)}>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                    </Form.Select>
                </Col>
                <Col xs={6} md={4}>
                    <Label required>Sync Notifications</Label>
                    <Form.Select className="rounded-pill border-primary-subtle bg-white py-2 fw-bold text-primary small shadow-sm" value={form.notification_preference} onChange={e => update("notification_preference", e.target.value)}>
                        <option value="none">Disabled</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Label>Nationality</Label>
                    <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 small shadow-none" value={form.nationality} onChange={e => update("nationality", e.target.value)} />
                </Col>

                {form.marital_status === "married" && (
                    <Col xs={12} className="bg-primary bg-opacity-10 rounded-4 p-3 border border-primary border-opacity-10 mt-3">
                        <Row className="g-2">
                            <Col md={6}>
                                <Label>Spouse Name</Label>
                                <Form.Control className="rounded-pill bg-white border-0 py-2 ps-3 small shadow-sm" value={form.spouse_name} onChange={e => update("spouse_name", e.target.value)} />
                            </Col>
                            <Col md={6}>
                                <Label>Spouse Phone</Label>
                                <Form.Control className="rounded-pill bg-white border-0 py-2 ps-3 font-monospace small shadow-sm" value={form.spouse_phone} onChange={e => update("spouse_phone", e.target.value)} />
                            </Col>
                        </Row>
                    </Col>
                )}
            </Row>
            )}

            {/* TAB 2: GEOGRAPHIC LOCATION */}
            {activeTab === "address" && (
                <Row className="g-4 animate__animated animate__fadeIn">
                    <Col xs={12}>
                        <Label required>Present Residential Address</Label>
                        <Form.Control as="textarea" className="rounded-4 bg-light border-0 p-3 small fw-bold shadow-none" rows={3} value={form.present_address} onChange={e => update("present_address", e.target.value)} />
                    </Col>
                    <Col xs={12}>
                        <Label>Permanent Legal Address</Label>
                        <Form.Control as="textarea" className="rounded-4 bg-light border-0 p-3 small fw-bold shadow-none" rows={3} value={form.permanent_address} onChange={e => update("permanent_address", e.target.value)} />
                    </Col>
                </Row>
            )}

            {/* TAB 4: PROFESSIONAL & EMERGENCY */}
            {activeTab === "emergency" && (
                <Row className="g-3 animate__animated animate__fadeIn">
                    <Col md={6}>
                        <Label required>Current Occupation</Label>
                        <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={form.occupation} onChange={e => update("occupation", e.target.value)} />
                    </Col>
                    <Col md={6}>
                        <Label>Company/Employer</Label>
                        <Form.Control className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none" value={form.company} onChange={e => update("company", e.target.value)} />
                    </Col>
                    <Col xs={12} className="mt-4 pt-3 border-top">
                        <h6 className="fw-bold text-danger x-small text-uppercase ls-1 mb-3"><i className="bi bi-telephone-outbound me-2"></i>Emergency Response Protocol</h6>
                        <Row className="g-2">
                            <Col md={4}>
                                <Label required>Primary Contact</Label>
                                <Form.Control className="rounded-pill bg-danger bg-opacity-10 border-0 py-2 ps-3 fw-bold small shadow-none text-danger" value={form.emergency_contact_name} onChange={e => update("emergency_contact_name", e.target.value)} />
                            </Col>
                            <Col xs={6} md={4}>
                                <Label required>Relation</Label>
                                <Form.Control className="rounded-pill bg-danger bg-opacity-10 border-0 py-2 ps-3 fw-bold small shadow-none text-danger" value={form.relation} onChange={e => update("relation", e.target.value)} />
                            </Col>
                            <Col xs={6} md={4}>
                                <Label required>Emergency Phone</Label>
                                <Form.Control className="rounded-pill bg-danger bg-opacity-10 border-0 py-2 ps-3 font-monospace fw-bold small shadow-none text-danger" value={form.emergency_contact_phone} onChange={e => update("emergency_contact_phone", e.target.value)} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )}

            {/* TAB 5: SECURE VAULT (UPLOADS) */}
            {activeTab === "uploads" && (
                <Row className="g-4 animate__animated animate__fadeIn">
                    <Col md={6}>
                    <div className="p-4 border-2 border-dashed rounded-4 bg-light shadow-sm text-center">
                        <Label required>Biometric Photograph</Label>
                        <div className="my-3 d-flex justify-content-center">
                            {profilePic ? (
                                <img src={URL.createObjectURL(profilePic)} className="rounded-circle shadow border border-4 border-white" style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                            ) : (
                                <div className="rounded-circle bg-white d-flex align-items-center justify-content-center text-muted border shadow-sm fs-1" style={{ width: "100px", height: "100px" }}>
                                <i className="bi bi-person-badge"></i>
                                </div>
                            )}
                        </div>
                        <Form.Control type="file" size="sm" className="rounded-pill border-0 bg-white shadow-sm" accept="image/*" onChange={e => setProfilePic((e.target as any).files?.[0] || null)} />
                    </div>
                    </Col>
                    <Col md={6}>
                    <div className="p-4 border-2 border-dashed rounded-4 bg-light shadow-sm text-center h-100 d-flex flex-column justify-content-center">
                        <Label required>Identity Verification (NID)</Label>
                        <div className="my-3">
                        {nidScan ? (
                            <Badge bg="success" className="p-3 rounded-pill shadow-sm ls-1"><i className="bi bi-check-circle me-2"></i> READY FOR SYNC</Badge>
                        ) : (
                            <div className="text-muted small italic opacity-50"><i className="bi bi-cloud-arrow-up fs-2 d-block mb-1"></i>Select PDF/Image</div>
                        )}
                        </div>
                        <Form.Control type="file" size="sm" className="rounded-pill border-0 bg-white shadow-sm" accept=".pdf,.jpg,.png" onChange={e => setNidScan((e.target as any).files?.[0] || null)} />
                    </div>
                    </Col>
                </Row>
            )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top p-3 d-flex flex-column flex-md-row justify-content-end gap-2 px-md-5">
        <Button variant="link" className="text-muted text-decoration-none fw-bold small ls-1 d-none d-md-block" onClick={onClose}>DISCARD CHANGES</Button>
        <Button
          variant="primary"
          className="rounded-pill px-5 py-2 fw-bold w-100 w-md-auto shadow-sm ls-1"
          disabled={loading}
          onClick={save}
        >
          {loading ? <Spinner size="sm" animation="border" className="me-2"/> : <i className="bi bi-shield-check me-2"></i>}
          {renter ? "SYNC RESIDENT PROFILE" : "CREATE RESIDENT PROFILE"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}