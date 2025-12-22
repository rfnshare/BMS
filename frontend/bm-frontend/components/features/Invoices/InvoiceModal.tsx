import {useEffect, useState} from "react";
import {Modal, Button, Form, Row, Col, Alert, Spinner} from "react-bootstrap";
import {InvoiceService} from "../../../logic/services/invoiceService";
import {getErrorMessage} from "../../../logic/utils/getErrorMessage";
import {useNotify} from "../../../logic/context/NotificationContext";
import api from "../../../logic/services/apiClient";

interface InvoiceModalProps {
    invoice?: any;
    onClose: () => void;
    onSaved: () => void;
}

export default function InvoiceModal({invoice, onClose, onSaved}: InvoiceModalProps) {
    const {success: notifySuccess, error: notifyError} = useNotify();
    const [loading, setLoading] = useState(false);
    const [leases, setLeases] = useState<any[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        lease: invoice?.lease || "",
        invoice_type: invoice?.invoice_type || "rent",
        amount: invoice?.amount || "",
        due_date: invoice?.due_date || "",
        description: invoice?.description || "",
        status: invoice?.status || "unpaid",
        invoice_month: invoice?.invoice_month || "",
        _ui_month: invoice?.invoice_month?.substring(0, 7) || "",
    });

    useEffect(() => {
        (async () => {
            try {
                const {data} = await api.get("/leases/leases/", {params: {status: "active", page_size: 100}});
                const hydratedLeases = await Promise.all(data.results.map(async (lease: any) => {
                    try {
                        const [renterRes, unitRes] = await Promise.all([
                            api.get(`/renters/${lease.renter}/`),
                            api.get(`/buildings/units/${lease.unit}/`)
                        ]);
                        return {
                            ...lease,
                            renterName: renterRes.data.full_name,
                            unitName: unitRes.data.name
                        };
                    } catch (e) {
                        return {...lease, renterName: "Unknown", unitName: "Unknown"};
                    }
                }));
                setLeases(hydratedLeases);
            } catch (err) {
                console.error("Sync Error: Failed to load leases", err);
            }
        })();
    }, []);

    const handleLeaseSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const leaseId = e.target.value;
        setFormData(prev => ({...prev, lease: leaseId}));
        if (!leaseId) return;

        try {
            const {data: fullLease} = await api.get(`/leases/leases/${leaseId}/`);
            const totalAmount = (fullLease.lease_rents || []).reduce((sum: number, item: any) => sum + parseFloat(item.amount || "0"), 0);
            setFormData(prev => ({...prev, amount: totalAmount}));
        } catch (err) {
            console.error("Ledger Calculation Error", err);
        }
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedMonthStr = e.target.value;
        if (!selectedMonthStr) return;

        const [year, month] = selectedMonthStr.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = dateObj.toLocaleString('default', {month: 'short', year: 'numeric'});

        setFormData(prev => ({
            ...prev,
            invoice_month: `${selectedMonthStr}-01`,
            _ui_month: selectedMonthStr,
            due_date: `${selectedMonthStr}-10`,
            description: `Rent For ${monthName}`
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {...formData};
        delete (payload as any)._ui_month;

        try {
            if (invoice?.id) {
                await InvoiceService.update(invoice.id, payload);
                notifySuccess("Ledger entry updated.");
            } else {
                await InvoiceService.create(payload);
                notifySuccess("Invoice generated and committed.");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            const genericError = getErrorMessage(err);
            setServerError(genericError);
            notifyError(genericError);
        } finally {
            setLoading(false);
        }
    };

    const Label = ({children, required}: { children: React.ReactNode; required?: boolean }) => (
        <Form.Label className="x-small fw-bold text-muted text-uppercase mb-1 ls-1">
            {children} {required && <span className="text-danger">*</span>}
        </Form.Label>
    );

    return (
        <Modal
            show onHide={onClose} size="lg" centered
            fullscreen="sm-down"
            contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
        >
            {/* 1. HEADER: Blueprint Dark Theme */}
            <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-20 rounded-3 p-2">
                        <i className={`bi ${invoice ? 'bi-pencil-square text-warning' : 'bi-receipt-cutoff text-primary'} fs-5`}></i>
                    </div>
                    <div>
                        <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
                            {invoice ? "Modify Financial Record" : "Generate Billing Asset"}
                        </Modal.Title>
                        <div className="text-white opacity-50 fw-bold text-uppercase"
                             style={{fontSize: '0.6rem', letterSpacing: '1px'}}>
                            Ledger Management Portal
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                <Modal.Body className="p-4 bg-light">
                    {serverError && (
                        <Alert variant="danger"
                               className="border-0 shadow-sm rounded-4 small mb-4 animate__animated animate__shakeX">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{serverError}
                        </Alert>
                    )}

                    <div className="vstack gap-4">
                        {/* 2. LEDGER ALLOCATION CARD */}
                        <div
                            className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-primary">
                            <h6 className="fw-bold text-primary mb-3 text-uppercase small ls-1 border-bottom pb-2">
                                <i className="bi bi-person-check me-2"></i>Ledger Allocation
                            </h6>
                            <Form.Group>
                                <Label required>Target Lease / Renter</Label>
                                <Form.Select
                                    required
                                    className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                                    value={formData.lease}
                                    onChange={handleLeaseSelect}
                                >
                                    <option value="">Select active agreement...</option>
                                    {leases.map(l => (
                                        <option key={l.id} value={l.id}>{l.renterName} ({l.unitName}) — #{l.id}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>

                        {/* 3. BILLING SPECIFICATIONS CARD */}
                        <div
                            className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white border-start border-4 border-success">
                            <h6 className="fw-bold text-success mb-3 text-uppercase small ls-1 border-bottom pb-2">
                                <i className="bi bi-cash-coin me-2"></i>Billing Specifications
                            </h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Label required>Billing Month</Label>
                                    <Form.Control
                                        type="month" required
                                        className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                                        value={formData._ui_month} onChange={handleMonthChange}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Label required>Invoice Type</Label>
                                    <Form.Select
                                        className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                                        value={formData.invoice_type}
                                        onChange={e => setFormData({...formData, invoice_type: e.target.value})}
                                    >
                                        <option value="rent">Monthly Rent</option>
                                        <option value="security_deposit">Security Deposit</option>
                                        <option value="adjustment">Manual Adjustment</option>
                                    </Form.Select>
                                </Col>
                                <Col xs={6}>
                                    <Label required>Amount (৳)</Label>
                                    <Form.Control
                                        type="number" required
                                        className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold text-primary shadow-none"
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                    />
                                </Col>
                                <Col xs={6}>
                                    <Label required>Due Date</Label>
                                    <Form.Control
                                        type="date" required
                                        className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                                        value={formData.due_date}
                                        onChange={e => setFormData({...formData, due_date: e.target.value})}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Label>Initial Status</Label>
                                    <Form.Select
                                        className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="unpaid">Unpaid (Issue Now)</option>
                                        <option value="draft">Draft (Review Later)</option>
                                        <option value="paid">Pre-paid (Log Entry)</option>
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Label>Description</Label>
                                    <Form.Control
                                        className="rounded-pill bg-light border-0 py-2 ps-3 small shadow-none"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Modal.Body>

                {/* 4. FOOTER: Right-Aligned (Desktop) / Full-Width Stacked (Mobile) */}
                <Modal.Footer
                    className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row-reverse gap-2 px-md-5">
                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm ls-1"
                        disabled={loading}
                    >
                        {loading ? (
                            <Spinner size="sm" animation="border" className="me-2"/>
                        ) : (
                            <i className="bi bi-shield-check me-2"></i>
                        )}
                        {/* Shortening the label for better mobile fit while keeping the intent */}
                        {invoice ? "UPDATE RECORD" : "COMMIT & GENERATE"}
                    </Button>

                    <Button
                        variant="light"
                        className="w-100 w-md-auto rounded-pill px-4 py-2 border text-muted small fw-bold ls-1"
                        onClick={onClose}
                    >
                        DISCARD
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}