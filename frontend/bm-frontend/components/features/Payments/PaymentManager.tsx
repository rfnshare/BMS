import { useEffect, useState, useCallback, useMemo } from "react";
import { PaymentService } from "../../../logic/services/paymentService";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext";
import BulkPaymentModal from "./BulkPaymentModal";
import PaymentModal from "./PaymentModal";
import EditPaymentModal from "./EditPaymentModal";
import { Modal, Button, Table, Badge, Spinner, InputGroup, Form, Row, Col } from "react-bootstrap";

export default function PaymentManager() {
    const { success, error: notifyError } = useNotify();

    // --- 1. CORE LOGIC STATE (Preserved) ---
    const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        method: "", search: "", lease: "", page: 1, ordering: "-id"
    });

    const [cache, setCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});
    const [lookupCache, setLookupCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});

    const [showBulkModal, setShowBulkModal] = useState(false);
    const [activePaymentInvoice, setActivePaymentInvoice] = useState<any | null>(null);
    const [editingPayment, setEditingPayment] = useState<any | null>(null);
    const [showInvoiceLookup, setShowInvoiceLookup] = useState(false);

    const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState("");

    // --- 2. DYNAMIC KPI STATS (New Blueprint Requirement) ---
    const stats = useMemo(() => {
        const results = data.results || [];
        return {
            totalCollected: results.reduce((acc: number, p: any) => acc + Number(p.amount), 0),
            txnCount: data.count || 0,
            cashVolume: results.filter((p: any) => p.method === 'cash').length,
            mobileVolume: results.filter((p: any) => p.method === 'mobile').length,
        };
    }, [data]);

    // --- 3. HYDRATION & API LOGIC (Preserved & Logic Locked) ---
    const hydrateData = useCallback(async (items: any[], isLookup = false) => {
        const uniqueLeaseIds = [...new Set(items.map(i => i.lease))].filter(Boolean);
        const currentCache = isLookup ? lookupCache : cache;
        const idsToFetch = uniqueLeaseIds.filter(id => !currentCache[id as number]);

        if (idsToFetch.length === 0) return;

        const results = await Promise.all(idsToFetch.map(async (leaseId) => {
            try {
                const lease = await PaymentService.getLease(leaseId as number);
                const [renterRes, unitRes] = await Promise.allSettled([
                    PaymentService.getRenter(lease.renter),
                    PaymentService.getUnit(lease.unit)
                ]);
                return {
                    id: leaseId,
                    data: {
                        renter: renterRes.status === 'fulfilled' ? (renterRes.value as any).full_name : "Unknown",
                        unit: unitRes.status === 'fulfilled' ? (unitRes.value as any).name : "Unknown"
                    }
                };
            } catch (e) {
                return { id: leaseId, data: { renter: "Error", unit: "Error" } };
            }
        }));

        const updateMap = results.reduce((acc: any, res: any) => {
            if (res) acc[res.id] = res.data;
            return acc;
        }, {});

        if (isLookup) setLookupCache(prev => ({ ...prev, ...updateMap }));
        else setCache(prev => ({ ...prev, ...updateMap }));
    }, [cache, lookupCache]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await PaymentService.list(filters);
            setData(res);
            if (res.results) await hydrateData(res.results);
        } catch (err: any) {
            notifyError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPayments(); }, [filters.method, filters.page, filters.search, filters.lease]);

    const fetchUnpaidInvoices = async () => {
        setLookupLoading(true);
        try {
            const [unpaidRes, partialRes] = await Promise.all([
                InvoiceService.list({ status: "unpaid", search: invoiceSearch, page_size: 15 }),
                InvoiceService.list({ status: "partially_paid", search: invoiceSearch, page_size: 15 })
            ]);
            const combinedInvoices = [...(unpaidRes.results || []), ...(partialRes.results || [])];
            setUnpaidInvoices(combinedInvoices);
            if (combinedInvoices.length > 0) await hydrateData(combinedInvoices, true);
        } catch (err) {
            console.error("Lookup error:", err);
        } finally {
            setLookupLoading(false);
        }
    };

    useEffect(() => {
        if (showInvoiceLookup) {
            const timer = setTimeout(() => fetchUnpaidInvoices(), 500);
            return () => clearTimeout(timer);
        }
    }, [invoiceSearch, showInvoiceLookup]);

    const handleDelete = async (id: number) => {
        if (window.confirm("⚠️ Audit Protocol: Reverse this transaction? This will restore the invoice balance.")) {
            try {
                await PaymentService.destroy(id);
                success("Transaction reversed. Ledger updated.");
                loadPayments();
            } catch (err: any) {
                notifyError(getErrorMessage(err));
            }
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            {/* 4. INDUSTRIAL HEADER (Right-Aligned Actions) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-success bg-white">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success border border-success border-opacity-10 d-none d-md-block">
                                <i className="bi bi-piggy-bank fs-4"></i>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Revenue Ledger</h4>
                                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Transaction Audit & Collection Control</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
                            <Button variant="light" className="rounded-pill px-3 fw-bold small border text-muted d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                                    onClick={() => setShowBulkModal(true)}>
                                <i className="bi bi-cash-stack text-success"></i><span>BULK SETTLE</span>
                            </Button>
                            <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                                    onClick={() => setShowInvoiceLookup(true)}>
                                <i className="bi bi-receipt"></i><span>PAY INVOICE</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. COLLECTION KPI OVERVIEW */}
            <Row className="g-2 g-md-3 mb-4">
                {[
                    { label: "Total Collected", val: `৳${stats.totalCollected.toLocaleString()}`, color: "success", icon: "bi-graph-up-arrow" },
                    { label: "Audit Count", val: stats.txnCount, color: "primary", icon: "bi-hash" },
                    { label: "Cash Volume", val: stats.cashVolume, color: "warning", icon: "bi-wallet2" },
                    { label: "Mobile Vol.", val: stats.mobileVolume, color: "info", icon: "bi-phone-vibrate" },
                ].map((s, i) => (
                    <Col key={i} xs={6} md={3}>
                        <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
                            <div className="d-flex justify-content-between align-items-start mb-1">
                                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
                            </div>
                            <div className={`h4 fw-bold mb-0 text-${s.color} fs-5 fs-md-4`}>
                                {typeof s.val === 'number' ? s.val.toString().padStart(2, '0') : s.val}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* 6. FILTER PILL BAR */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
                <Row className="g-2">
                    <Col xs={12} md={8}>
                        <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                            <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                            <Form.Control
                                className="bg-light border-0 py-2 shadow-none fw-medium"
                                placeholder="Search reference or payer identity..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Select
                            size="sm"
                            className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
                            value={filters.method}
                            onChange={(e) => setFilters({ ...filters, method: e.target.value, page: 1 })}
                        >
                            <option value="">All Collection Methods</option>
                            {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* 7. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light border-bottom">
                        <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                            <th className="ps-4 py-3">Audit Date</th>
                            <th>Payer Identity</th>
                            <th>Amount</th>
                            <th>Traceability</th>
                            <th className="pe-4 text-end">Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && data.results.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="success" size="sm" /></td></tr>
                        ) : data.results.map((pay: any) => (
                            <tr key={pay.id}>
                                <td className="ps-4">
                                    <div className="fw-bold text-dark small">{pay.payment_date}</div>
                                    <div className="x-small text-muted fw-bold ls-1">TXN-#{pay.id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold small text-primary">{cache[pay.lease]?.renter || "..."}</div>
                                    <div className="text-muted x-small fw-bold ls-1 text-uppercase">UNIT: {cache[pay.lease]?.unit || "..."}</div>
                                </td>
                                <td className="fw-bold text-success font-monospace">৳{Number(pay.amount).toLocaleString()}</td>
                                <td>
                                    <Badge bg="light" className="text-dark border fw-bold x-small ls-1 mb-1">{pay.method.toUpperCase()}</Badge>
                                    <div className="x-small text-muted font-monospace opacity-75">{pay.transaction_reference || "-"}</div>
                                </td>
                                <td className="pe-4 text-end">
                                    <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                        <button className="btn btn-sm btn-white border-end px-3" onClick={() => setEditingPayment(pay)} title="Audit Entry"><i className="bi bi-pencil-square text-warning"></i></button>
                                        <button className="btn btn-sm btn-white text-danger px-3" onClick={() => handleDelete(pay.id)} title="Reverse Ledger"><i className="bi bi-trash3"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 8. MOBILE ACTION CARDS */}
            <div className="d-block d-md-none vstack gap-2 p-2">
                {loading ? <Spinner animation="border" className="mx-auto" variant="success" /> : data.results.map((pay: any) => (
                    <div key={pay.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success animate__animated animate__fadeIn">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <div className="fw-bold text-dark small">{pay.payment_date}</div>
                                <div className="text-muted x-small fw-bold">TXN-#{pay.id}</div>
                            </div>
                            <div className="text-end">
                                <div className="fw-bold text-success font-monospace">৳{Number(pay.amount).toLocaleString()}</div>
                                <Badge bg="light" className="text-dark border x-small ls-1">{pay.method.toUpperCase()}</Badge>
                            </div>
                        </div>
                        <div className="small mb-3">
                            <div className="fw-bold text-primary">{cache[pay.lease]?.renter || "..."}</div>
                            <div className="text-muted x-small fw-bold ls-1 opacity-75">{cache[pay.lease]?.unit || "..."}</div>
                        </div>
                        <div className="btn-group w-100 shadow-sm border rounded-pill overflow-hidden bg-white">
                            <button className="btn btn-white py-2 border-end" onClick={() => setEditingPayment(pay)}><i className="bi bi-pencil-square text-warning"></i></button>
                            <button className="btn btn-white py-2 text-danger" onClick={() => handleDelete(pay.id)}><i className="bi bi-trash3"></i></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL CONNECTIONS & INVOICE LOOKUP (Preserved) --- */}

            {showBulkModal && (
                <BulkPaymentModal
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={() => { setShowBulkModal(false); success("Bulk payments recorded."); loadPayments(); }}
                />
            )}

            {activePaymentInvoice && (
                <PaymentModal
                    invoice={activePaymentInvoice}
                    onClose={() => setActivePaymentInvoice(null)}
                    onSuccess={() => { setActivePaymentInvoice(null); success("Payment successful."); loadPayments(); }}
                />
            )}

            {editingPayment && (
                <EditPaymentModal
                    payment={editingPayment}
                    onClose={() => setEditingPayment(null)}
                    onSuccess={() => { setEditingPayment(null); success("Record updated."); loadPayments(); }}
                />
            )}

            {/* INVOICE LOOKUP MODAL (Blueprint Aligned) */}
            <Modal show={showInvoiceLookup} onHide={() => setShowInvoiceLookup(false)} size="lg" centered fullscreen="sm-down" contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                <Modal.Header closeButton closeVariant="white" className="bg-dark text-white border-0">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-search text-primary"></i>
                        <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">Financial Allocation Search</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-0 bg-light">
                    <div className="p-3 border-bottom bg-white sticky-top shadow-sm" style={{ top: '0', zIndex: 10 }}>
                        <Form.Control type="text" className="bg-light border-0 rounded-pill px-3 fw-bold small shadow-none" placeholder="Search Renter or Unit identity..." value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} autoFocus />
                    </div>
                    <div className="p-3">
                        {lookupLoading ? (
                            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                        ) : unpaidInvoices.map(inv => {
                            const remaining = (Number(inv.amount) || 0) - (Number(inv.paid_amount) || 0);
                            return (
                                <div key={inv.id} className="p-3 bg-white border-start border-4 border-primary rounded-4 mb-2 shadow-sm animate__animated animate__fadeIn"
                                     onClick={() => { setShowInvoiceLookup(false); setActivePaymentInvoice(inv); }}
                                     style={{ cursor: 'pointer' }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="fw-bold text-primary x-small ls-1 text-uppercase">INV: {inv.invoice_number}</div>
                                            <div className="fw-bold text-dark">{lookupCache[inv.lease]?.renter || "..."}</div>
                                            <div className="text-muted x-small fw-bold ls-1 text-uppercase">UNIT: {lookupCache[inv.lease]?.unit || "..."}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-danger h5 mb-0">৳{remaining.toLocaleString()}</div>
                                            <Badge pill className={inv.status === 'partially_paid' ? "bg-info-subtle text-info border" : "bg-danger-subtle text-danger border"}>
                                                {inv.status?.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}