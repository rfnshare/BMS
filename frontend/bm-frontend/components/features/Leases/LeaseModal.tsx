import {useEffect, useState} from "react";
import {Modal, Button, Spinner} from "react-bootstrap";
import {LeaseService} from "../../../logic/services/leaseService";
import {getErrorMessage} from "../../../logic/utils/getErrorMessage";
import {useNotify} from "../../../logic/context/NotificationContext";

// Tab Imports
import LeaseInfoTab from "./tabs/LeaseInfoTab";
import LeaseRentTab from "./tabs/LeaseRentTab";
import LeaseFinancialTab from "./tabs/LeaseFinancialTab";
import LeaseChecklistTab from "./tabs/LeaseChecklistTab";
import LeaseRemarksTab from "./tabs/LeaseRemarksTab";
import LeaseDocumentsTab from "./tabs/LeaseDocumentsTab";

export default function LeaseModal({lease, onClose, onSuccess}: any) {
    const {success, error: notifyError} = useNotify();

    const [tab, setTab] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [leaseId, setLeaseId] = useState<number | null>(lease?.id || null);

    const [form, setForm] = useState<any>({
        renter: "", unit: "",
        start_date: new Date().toISOString().split('T')[0],
        security_deposit: 0, status: "active",
        lease_rents: [],
        electricity_card_given: false, gas_card_given: false,
        main_gate_key_given: false, agreement_paper_given: false,
    });

    useEffect(() => {
        if (lease) {
            setForm({
                ...lease,
                renter: lease.renter?.id || lease.renter,
                unit: lease.unit?.id || lease.unit,


            });
            setLeaseId(lease.id);
        }
    }, [lease]);

    const update = (k: string, v: any) => setForm((p: any) => ({...p, [k]: v}));
    const totalRent = form.lease_rents.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

    const saveLease = async () => {
        if (!form.renter || !form.unit) {
            notifyError("Configuration Incomplete: Tenant and Unit assignments are required.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                lease_rents: form.lease_rents.map((r: any) => ({
                    rent_type: r.rent_type?.id || Number(r.rent_type),
                    amount: Number(r.amount)
                }))
            };

            if (leaseId) {
                await LeaseService.update(leaseId, payload);
                success("Agreement updated.");
                onSuccess();
            } else {
                const res = await LeaseService.create(payload);
                setLeaseId(res.id);
                success("Initial agreement saved. Proceed to document upload.");
                onSuccess();
                setTab("docs");
            }
        } catch (err) {
            notifyError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {id: "basic", label: "Identity", icon: "bi-person-badge", required: true},
        {id: "rent", label: "Billing", icon: "bi-cash-stack", required: true},
        {id: "financial", label: "Security", icon: "bi-shield-lock"},
        {id: "checklist", label: "Handover", icon: "bi-key"},
        {id: "remarks", label: "Notes", icon: "bi-chat-left-dots"},
        {id: "docs", label: "Legal Files", icon: "bi-file-earmark-pdf"},
    ];

    return (
        <Modal
            show onHide={onClose} size="xl"
            centered
            fullscreen="lg-down"
            scrollable
            contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
        >
            {/* 1. HEADER: Dark Professional Theme */}
            <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-20 rounded-3 p-2">
                        <i className={`bi ${leaseId ? 'bi-pencil-square text-warning' : 'bi-file-earmark-plus text-primary'} fs-5`}></i>
                    </div>
                    <div>
                        <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                            {leaseId ? `Modify Agreement Record #${leaseId}` : "Establish New Lease Agreement"}
                        </Modal.Title>
                        <div className="text-white opacity-50 fw-bold text-uppercase"
                             style={{fontSize: '0.6rem', letterSpacing: '1px'}}>
                            Contractual Configuration Logic
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-0 bg-light">
                <div className="row g-0">

                    {/* 2. ADAPTIVE SIDEBAR NAVIGATION */}
                    <div className="col-12 col-lg-3 border-end bg-white shadow-sm z-index-1">
                        <div className="p-2 p-lg-4">
                            <div className="row row-cols-3 row-cols-lg-1 g-2">
                                {steps.map((item) => (
                                    <div className="col" key={item.id}>
                                        <button
                                            className={`w-100 btn btn-sm py-2 py-lg-3 px-3 d-flex flex-column flex-lg-row align-items-center gap-3 border-0 rounded-4 transition-all ${
                                                tab === item.id
                                                    ? "bg-primary text-white shadow fw-bold"
                                                    : "text-muted hover-bg-light fw-bold"
                                            }`}
                                            onClick={() => setTab(item.id)}
                                        >
                                            <i className={`${item.icon} fs-5`}></i>
                                            <div className="text-start d-none d-lg-block">
                                                <div className="lh-1 text-uppercase ls-1"
                                                     style={{fontSize: '0.65rem'}}>{item.label}</div>
                                                {item.required && <span className="text-danger x-small fw-normal">Required Step</span>}
                                            </div>
                                            <span className="d-lg-none x-small text-uppercase fw-bold"
                                                  style={{fontSize: '0.55rem'}}>{item.label}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. DYNAMIC CONTENT AREA */}
                    <div className="col-12 col-lg-9 p-4 p-md-5">
                        <div className="mx-auto" style={{maxWidth: '750px'}}>
                            <div className="animate__animated animate__fadeIn">
                                {/* Teaching Point: Within these tabs, use the asterisk for fields */}
                                {tab === "basic" && (
                                    <LeaseInfoTab
                                        form={form}
                                        update={update}
                                        isEdit={!!leaseId}
                                    />
                                )}

                                {tab === "rent" && <LeaseRentTab form={form} updateRent={(i: any, k: any, v: any) => {
                                    const rows = [...form.lease_rents];
                                    rows[i] = {...rows[i], [k]: v};
                                    update("lease_rents", rows);
                                }} addRentRow={() => update("lease_rents", [...form.lease_rents, {
                                    rent_type: "",
                                    amount: ""
                                }])}
                                                                 removeRent={(i: any) => update("lease_rents", form.lease_rents.filter((_: any, idx: any) => idx !== i))}
                                                                 totalRent={totalRent}/>}
                                {tab === "financial" &&
                                    <LeaseFinancialTab form={form} update={update} totalRent={totalRent}/>}
                                {tab === "checklist" && <LeaseChecklistTab form={form} update={update}/>}
                                {tab === "remarks" && <LeaseRemarksTab form={form} update={update}/>}
                                {tab === "docs" && <LeaseDocumentsTab leaseId={leaseId}/>}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            {/* 4. FOOTER: High-Depth Action Bar */}
            <Modal.Footer className="p-3 bg-white border-top shadow-sm d-flex justify-content-end gap-2 px-md-5">
                <Button variant="light" className="rounded-pill px-4 border text-muted small fw-bold ls-1"
                        onClick={onClose}>
                    DISCARD
                </Button>
                <Button
                    variant={leaseId ? 'warning' : 'primary'}
                    className="rounded-pill px-5 fw-bold shadow-sm ls-1"
                    disabled={loading}
                    onClick={saveLease}
                >
                    {loading ? <Spinner size="sm" animation="border" className="me-2"/> :
                        <i className="bi bi-shield-check me-2"></i>}
                    {leaseId ? "UPDATE CONTRACT" : "SAVE & PROCEED"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}