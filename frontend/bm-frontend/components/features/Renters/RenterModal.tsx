import {useState} from "react";
import {Renter, RenterService} from "../../../logic/services/renterService";
import {getErrorMessage} from "../../../logic/utils/getErrorMessage";
import {Modal, Button, Spinner, Row, Col, Form} from "react-bootstrap";

interface Props {
    renter: Renter | null;
    onClose: () => void;
    onSaved: () => void;
}

type Tab = "basic" | "address" | "residence" | "emergency" | "uploads";

export default function RenterModal({renter, onClose, onSaved}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("basic");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔥 RESTORED ALL FIELDS
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

    const update = (k: string, v: any) => setForm((p: any) => ({...p, [k]: v}));

    const save = async () => {
        setError(null);
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== null && v !== undefined && v !== "") {
                    fd.append(k, String(v));
                }
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
        {key: "basic", label: "Primary", icon: "person-vcard"},
        {key: "address", label: "Location", icon: "geo-alt"},
        {key: "residence", label: "History", icon: "clock-history"},
        {key: "emergency", label: "Work", icon: "briefcase"},
        {key: "uploads", label: "Docs", icon: "shield-lock"},
    ];

    const Label = ({children}: any) => <label
        className="form-label small fw-bold text-muted text-uppercase mb-1">{children}</label>;

    return (
        <Modal show onHide={onClose} size="xl" centered scrollable fullscreen="sm-down"
               contentClassName="border-0 shadow-lg rounded-4">
            <Modal.Header closeButton className="bg-white border-0 pt-3 px-3">
                <Modal.Title className="fw-bold h5 mb-0">
                    {renter ? "Update Profile" : "New Renter"}
                </Modal.Title>
            </Modal.Header>

            {/* SWIPEABLE TAB NAV */}
            <div className="bg-white px-2 px-md-4 border-bottom sticky-top" style={{top: 0, zIndex: 1020}}>
                <ul className="nav nav-pills nav-fill p-1 bg-light rounded-pill mb-3 overflow-auto flex-nowrap no-scrollbar">
                    {tabs.map((t) => (
                        <li className="nav-item" key={t.key}>
                            <button
                                className={`nav-link rounded-pill py-2 fw-bold small d-flex align-items-center justify-content-center gap-2 ${activeTab === t.key ? "active shadow-sm" : "text-secondary"}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                <i className={`bi bi-${t.icon}`}></i>
                                <span className="d-none d-md-inline">{t.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <Modal.Body className="p-3 p-md-4">
                {error && <div className="alert alert-danger border-0 small mb-4">{error}</div>}

                {/* TAB 1: PRIMARY INFO */}
                {activeTab === "basic" && (
                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <Label>Full Name</Label>
                            <input className="form-control bg-light py-2" style={{fontSize: '1rem'}}
                                   value={form.full_name} onChange={e => update("full_name", e.target.value)}/>
                        </Col>
                        <Col xs={6} md={3}>
                            <Label>Phone Number</Label>
                            <input className="form-control bg-light py-2 font-monospace" style={{fontSize: '1rem'}}
                                   value={form.phone_number} onChange={e => update("phone_number", e.target.value)}/>
                        </Col>
                        <Col xs={6} md={3}>
                            <Label>Alternate Phone</Label>
                            <input className="form-control bg-light py-2 font-monospace" style={{fontSize: '1rem'}}
                                   value={form.alternate_phone}
                                   onChange={e => update("alternate_phone", e.target.value)}/>
                        </Col>
                        <Col xs={12} md={6}>
                            <Label>Email Address</Label>
                            <input className="form-control bg-light py-2" style={{fontSize: '1rem'}} value={form.email}
                                   onChange={e => update("email", e.target.value)}/>
                        </Col>
                        <Col xs={6} md={3}>
                            <Label>Date of Birth</Label>
                            <input type="date" className="form-control bg-light py-2" style={{fontSize: '1rem'}}
                                   value={form.date_of_birth} onChange={e => update("date_of_birth", e.target.value)}/>
                        </Col>
                        <Col xs={6} md={3}>
                            <Label>Gender</Label>
                            <select className="form-select bg-light py-2" value={form.gender}
                                    onChange={e => update("gender", e.target.value)}>
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </Col>
                        <Col xs={6} md={4}>
                            <Label>Marital Status</Label>
                            <select className="form-select bg-light py-2" value={form.marital_status}
                                    onChange={e => update("marital_status", e.target.value)}>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                            </select>
                        </Col>
                        <Col xs={6} md={4}>
                            <Label>Notification Channel</Label>
                            <select className="form-select border-primary-subtle py-2 fw-bold"
                                    value={form.notification_preference}
                                    onChange={e => update("notification_preference", e.target.value)}>
                                <option value="none">None</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                                <option value="both">Both</option>
                            </select>
                        </Col>
                        <Col xs={12} md={4}>
                            <Label>Nationality</Label>
                            <input className="form-control bg-light py-2" value={form.nationality}
                                   onChange={e => update("nationality", e.target.value)}/>
                        </Col>

                        {form.marital_status === "married" && (
                            <Col xs={12} className="bg-primary-subtle rounded-4 p-3 animate__animated animate__fadeIn">
                                <Row className="g-2">
                                    <Col md={6}>
                                        <Label>Spouse Name</Label>
                                        <input className="form-control border-white" value={form.spouse_name}
                                               onChange={e => update("spouse_name", e.target.value)}/>
                                    </Col>
                                    <Col md={6}>
                                        <Label>Spouse Phone</Label>
                                        <input className="form-control border-white font-monospace"
                                               value={form.spouse_phone}
                                               onChange={e => update("spouse_phone", e.target.value)}/>
                                    </Col>
                                </Row>
                            </Col>
                        )}
                    </Row>
                )}

                {/* TAB 2: ADDRESS */}
                {activeTab === "address" && (
                    <Row className="g-3">
                        <Col xs={12}>
                            <Label>Present Address</Label>
                            <textarea className="form-control bg-light" rows={3} style={{fontSize: '1rem'}}
                                      value={form.present_address}
                                      onChange={e => update("present_address", e.target.value)}/>
                        </Col>
                        <Col xs={12}>
                            <Label>Permanent Address</Label>
                            <textarea className="form-control bg-light" rows={3} style={{fontSize: '1rem'}}
                                      value={form.permanent_address}
                                      onChange={e => update("permanent_address", e.target.value)}/>
                        </Col>
                    </Row>
                )}

                {/* TAB 3: RESIDENCE HISTORY */}
                {activeTab === "residence" && (
                    <Row className="g-3">
                        <Col xs={12}>
                            <Label>Previous Rental Address</Label>
                            <textarea className="form-control bg-light" rows={2} value={form.previous_address}
                                      onChange={e => update("previous_address", e.target.value)}/>
                        </Col>
                        <Col xs={12} md={6}>
                            <Label>Landlord Name</Label>
                            <input className="form-control bg-light" value={form.landlord_name}
                                   onChange={e => update("landlord_name", e.target.value)}/>
                        </Col>
                        <Col xs={12} md={6}>
                            <Label>Landlord Phone</Label>
                            <input className="form-control bg-light font-monospace" value={form.landlord_phone}
                                   onChange={e => update("landlord_phone", e.target.value)}/>
                        </Col>
                        <Col xs={6}>
                            <Label>Stayed From</Label>
                            <input type="date" className="form-control bg-light" value={form.from_date}
                                   onChange={e => update("from_date", e.target.value)}/>
                        </Col>
                        <Col xs={6}>
                            <Label>Stayed To</Label>
                            <input type="date" className="form-control bg-light" value={form.to_date}
                                   onChange={e => update("to_date", e.target.value)}/>
                        </Col>
                        <Col xs={12}>
                            <Label>Reason for Leaving</Label>
                            <input className="form-control bg-light" value={form.reason_for_leaving}
                                   onChange={e => update("reason_for_leaving", e.target.value)}/>
                        </Col>
                    </Row>
                )}

                {/* TAB 4: WORK & EMERGENCY */}
                {activeTab === "emergency" && (
                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <Label>Occupation</Label>
                            <input className="form-control bg-light" value={form.occupation}
                                   onChange={e => update("occupation", e.target.value)}/>
                        </Col>
                        <Col xs={12} md={6}>
                            <Label>Company Name</Label>
                            <input className="form-control bg-light" value={form.company}
                                   onChange={e => update("company", e.target.value)}/>
                        </Col>
                        <Col xs={12}>
                            <Label>Office Address</Label>
                            <input className="form-control bg-light" value={form.office_address}
                                   onChange={e => update("office_address", e.target.value)}/>
                        </Col>
                        <div className="border-top my-3 opacity-10"></div>
                        <Col xs={12} md={4}>
                            <Label>Emergency Contact Name</Label>
                            <input className="form-control bg-primary bg-opacity-10 border-0"
                                   value={form.emergency_contact_name}
                                   onChange={e => update("emergency_contact_name", e.target.value)}/>
                        </Col>
                        <Col xs={6} md={4}>
                            <Label>Relation</Label>
                            <input className="form-control bg-primary bg-opacity-10 border-0" value={form.relation}
                                   onChange={e => update("relation", e.target.value)}/>
                        </Col>
                        <Col xs={6} md={4}>
                            <Label>Emergency Phone</Label>
                            <input className="form-control bg-primary bg-opacity-10 border-0 font-monospace"
                                   value={form.emergency_contact_phone}
                                   onChange={e => update("emergency_contact_phone", e.target.value)}/>
                        </Col>
                    </Row>
                )}

                {/* TAB 5: UPLOADS */}
                {activeTab === "uploads" && (
                    <Row className="g-4 text-center">
                        <Col xs={12} md={6}>
                            <div className="p-4 border border-2 border-dashed rounded-4 bg-light">
                                <Label>Profile Photograph</Label>
                                <div className="mb-3 d-flex justify-content-center">
                                    {profilePic ? (
                                        <img src={URL.createObjectURL(profilePic)}
                                             className="rounded-circle shadow-sm border border-4 border-white"
                                             style={{width: "100px", height: "100px", objectFit: "cover"}}/>
                                    ) : renter?.profile_pic ? (
                                        <img src={renter.profile_pic}
                                             className="rounded-circle shadow-sm border border-4 border-white"
                                             style={{width: "100px", height: "100px", objectFit: "cover"}}/>
                                    ) : (
                                        <div
                                            className="rounded-circle bg-white d-flex align-items-center justify-content-center text-muted border shadow-sm"
                                            style={{width: "100px", height: "100px"}}>No Photo</div>
                                    )}
                                </div>
                                <input type="file" className="form-control border-0 bg-transparent" accept="image/*"
                                       onChange={e => setProfilePic(e.target.files?.[0] || null)}/>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div
                                className="p-4 border border-2 border-dashed rounded-4 bg-light h-100 d-flex flex-column justify-content-center">
                                <Label>NID Scan (PDF/JPG)</Label>
                                {nidScan ? (
                                    <div
                                        className="alert alert-success py-2 px-3 small fw-bold mb-3">✅ {nidScan.name}</div>
                                ) : renter?.nid_scan ? (
                                    <a href={renter.nid_scan} target="_blank" rel="noreferrer"
                                       className="btn btn-outline-primary btn-sm rounded-pill mb-3">View Stored NID</a>
                                ) : (
                                    <div className="py-4 text-muted small italic">Ready for upload</div>
                                )}
                                <input type="file" className="form-control border-0 bg-transparent"
                                       accept=".pdf,.jpg,.png" onChange={e => setNidScan(e.target.files?.[0] || null)}/>
                            </div>
                        </Col>
                    </Row>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-light p-3 border-0 shadow-lg">
                <Button variant="link" className="text-muted text-decoration-none me-auto d-none d-md-block"
                        onClick={onClose}>Discard</Button>
                <Button variant="primary" className="rounded-pill px-5 py-2 fw-bold w-100 w-md-auto shadow-sm"
                        disabled={loading} onClick={save}>
                    {loading ? <Spinner size="sm" className="me-2"/> : (renter ? "Update Profile" : "Create Profile")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}