import { useEffect, useState, useCallback } from "react";
import { PaymentService } from "../../../logic/services/paymentService";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added
import BulkPaymentModal from "./BulkPaymentModal";
import PaymentModal from "./PaymentModal";
import EditPaymentModal from "./EditPaymentModal";
import { Modal, Button, Table, Badge, Spinner, InputGroup, Form, Row, Col } from "react-bootstrap";

export default function PaymentManager() {
    const { success, error: notifyError } = useNotify(); // ✅ Initialize Notifications

    // 1. DATA STATE
    const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
    const [loading, setLoading] = useState(true);

    // 2. FILTER STATE
    const [filters, setFilters] = useState({
        method: "",
        search: "",
        lease: "",
        page: 1,
        ordering: "-id"
    });

    // 3. CACHE & MODAL STATE
    const [cache, setCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});
    const [lookupCache, setLookupCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});

    const [showBulkModal, setShowBulkModal] = useState(false);
    const [activePaymentInvoice, setActivePaymentInvoice] = useState<any | null>(null);
    const [editingPayment, setEditingPayment] = useState<any | null>(null);
    const [showInvoiceLookup, setShowInvoiceLookup] = useState(false);

    const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState("");

    // --- LOGIC: HYDRATION ---
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

    // --- LOGIC: API CALLS ---
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
                InvoiceService.list({ status: "unpaid", search: invoiceSearch, page_size: 10 }),
                InvoiceService.list({ status: "partially_paid", search: invoiceSearch, page_size: 10 })
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
        if (window.confirm("⚠️ Reverse this transaction? This will restore the invoice balance.")) {
            try {
                await PaymentService.destroy(id);
                success("Transaction reversed successfully."); // ✅ Notification
                loadPayments();
            } catch (err: any) {
                notifyError(getErrorMessage(err));
            }
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            {/* 1. HEADER CARD (Blueprint DNA) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-success bg-white">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h4 className="fw-bold mb-1 text-dark">Payment History</h4>
                            <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">Revenue & Collection Control</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm py-2"
                                    onClick={() => setShowInvoiceLookup(true)}>
                                <i className="bi bi-receipt me-2"></i>Pay Invoice
                            </button>
                            <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm py-2"
                                    onClick={() => setShowBulkModal(true)}>
                                <i className="bi bi-cash-stack me-2"></i>Bulk
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FILTER SECTION */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
                <Row className="g-2">
                    <Col xs={12} md={4}>
                        <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                            <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                            <Form.Control
                                className="bg-light border-0"
                                placeholder="Search reference..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={12} md={3}>
                        <Form.Select
                            size="sm"
                            className="bg-light border-0 rounded-pill ps-3"
                            value={filters.method}
                            onChange={(e) => setFilters({ ...filters, method: e.target.value, page: 1 })}
                        >
                            <option value="">All Methods</option>
                            {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* 3. DATA TABLE (Desktop) */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light border-bottom">
                        <tr className="text-muted x-small fw-bold text-uppercase">
                            <th className="ps-4 py-3">Date & ID</th>
                            <th>Payer</th>
                            <th>Amount</th>
                            <th>Method & Ref</th>
                            <th className="pe-4 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="success" size="sm" /></td></tr>
                        ) : data.results.map((pay: any) => (
                            <tr key={pay.id}>
                                <td className="ps-4">
                                    <div className="fw-bold text-dark small">{pay.payment_date}</div>
                                    <div className="x-small text-muted">TXN-#{pay.id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold small text-primary">{cache[pay.lease]?.renter || "..."}</div>
                                    <div className="text-muted x-small">Unit: {cache[pay.lease]?.unit || "..."}</div>
                                </td>
                                <td className="fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</td>
                                <td>
                                    <Badge bg="light" className="text-dark border fw-normal mb-1">{pay.method.toUpperCase()}</Badge>
                                    <div className="x-small text-muted font-monospace">{pay.transaction_reference || "-"}</div>
                                </td>
                                <td className="pe-4 text-end">
                                    <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                                        <button className="btn btn-sm btn-white border-end" onClick={() => setEditingPayment(pay)}><i className="bi bi-pencil-square text-warning"></i></button>
                                        <button className="btn btn-sm btn-white text-danger" onClick={() => handleDelete(pay.id)}><i className="bi bi-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 4. MOBILE CARDS */}
            <div className="d-block d-md-none">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
                ) : data.results.map((pay: any) => (
                    <div key={pay.id} className="p-3 bg-white border-bottom mb-2 rounded-4 shadow-sm border mx-2">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div className="fw-bold text-dark">{pay.payment_date}</div>
                                <div className="text-muted x-small">#{pay.id}</div>
                            </div>
                            <div className="text-end">
                                <div className="fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</div>
                                <Badge bg="light" className="text-dark border x-small">{pay.method}</Badge>
                            </div>
                        </div>
                        <div className="small mb-3">
                            <div className="fw-bold text-primary">{cache[pay.lease]?.renter || "..."}</div>
                            <div className="text-muted x-small">{cache[pay.lease]?.unit || "..."}</div>
                        </div>
                        <div className="btn-group w-100 shadow-sm border rounded-pill overflow-hidden bg-white">
                            <button className="btn btn-white py-2 border-end" onClick={() => setEditingPayment(pay)}><i className="bi bi-pencil-square text-warning"></i></button>
                            <button className="btn btn-white py-2 text-danger" onClick={() => handleDelete(pay.id)}><i className="bi bi-trash"></i></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 5. PAGINATION */}
            <div className="p-3 bg-white rounded-4 shadow-sm border d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted x-small fw-bold">RECORDS: {data.count}</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold" disabled={!data.previous} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold" disabled={!data.next} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
                </div>
            </div>

            {/* --- MODAL CONNECTIONS --- */}

            {showBulkModal && (
                <BulkPaymentModal
                    onClose={() => setShowBulkModal(false)}
                    onSuccess={() => { setShowBulkModal(false); success("Bulk payments recorded!"); loadPayments(); }}
                />
            )}

            {activePaymentInvoice && (
                <PaymentModal
                    invoice={activePaymentInvoice}
                    onClose={() => setActivePaymentInvoice(null)}
                    onSuccess={() => { setActivePaymentInvoice(null); success("Payment successful!"); loadPayments(); }}
                />
            )}

            {editingPayment && (
                <EditPaymentModal
                    payment={editingPayment}
                    onClose={() => setEditingPayment(null)}
                    onSuccess={() => { setEditingPayment(null); success("Record updated."); loadPayments(); }}
                />
            )}

            {/* INVOICE LOOKUP MODAL */}
            <Modal show={showInvoiceLookup} onHide={() => setShowInvoiceLookup(false)} size="lg" centered fullscreen="sm-down" contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                <Modal.Header closeButton className="bg-primary text-white sticky-top border-0">
                    <Modal.Title className="h6 fw-bold mb-0 text-uppercase">Select Due Invoice</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-light">
                    <div className="p-3 border-bottom bg-white sticky-top shadow-sm" style={{ top: '0', zIndex: 10 }}>
                        <Form.Control
                            type="text"
                            className="bg-light border-0 rounded-pill px-3"
                            placeholder="Search Renter or Unit..."
                            value={invoiceSearch}
                            onChange={(e) => setInvoiceSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="p-2">
                        {lookupLoading ? (
                            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                        ) : (
                            unpaidInvoices.map(inv => {
                                const remaining = (Number(inv.amount) || 0) - (Number(inv.paid_amount) || 0);
                                return (
                                    <div key={inv.id} className="p-3 bg-white border rounded-4 mb-2 shadow-sm"
                                         onClick={() => { setShowInvoiceLookup(false); setActivePaymentInvoice(inv); }}
                                         style={{ cursor: 'pointer' }}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-bold text-primary small">{inv.invoice_number}</div>
                                                <div className="fw-bold text-dark">{lookupCache[inv.lease]?.renter || "..."}</div>
                                                <div className="text-muted x-small">Unit: {lookupCache[inv.lease]?.unit || "..."}</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-danger h5 mb-0">৳{remaining.toLocaleString()}</div>
                                                <Badge pill className={inv.status === 'partially_paid' ? "bg-info-subtle text-info border" : "bg-danger-subtle text-danger border"}>
                                                    {inv.status === 'partially_paid' ? "PARTIAL" : "DUE"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {!lookupLoading && unpaidInvoices.length === 0 && (
                            <div className="text-center p-5 text-muted small">No unpaid invoices found.</div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}