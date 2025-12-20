import { useEffect, useState, useCallback } from "react";
import { PaymentService } from "../../../logic/services/paymentService";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import BulkPaymentModal from "./BulkPaymentModal";
import PaymentModal from "./PaymentModal";
import EditPaymentModal from "./EditPaymentModal";
import { Modal, Button, Table, Badge, Spinner, InputGroup, Form } from "react-bootstrap";

export default function PaymentManager() {
    const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        method: "",
        search: "",
        lease: "",
        page: 1,
        ordering: "-id"
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
            alert(getErrorMessage(err));
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
        if (confirm("⚠️ Reverse this transaction?")) {
            try {
                await PaymentService.destroy(id);
                loadPayments();
            } catch (err: any) {
                alert(getErrorMessage(err));
            }
        }
    };

    return (
        <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
            {/* HEADER & FILTERS */}
            <div className="p-3 p-md-4 border-bottom bg-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <h5 className="fw-bold text-dark m-0 text-center text-md-start">Payment History</h5>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary rounded-pill px-3 fw-bold shadow-sm flex-grow-1"
                                onClick={() => setShowInvoiceLookup(true)}>
                            <i className="bi bi-receipt me-1"></i> Pay Invoice
                        </button>
                        <button className="btn btn-success rounded-pill px-3 fw-bold shadow-sm flex-grow-1"
                                onClick={() => setShowBulkModal(true)}>
                            <i className="bi bi-cash-stack me-1"></i> Bulk
                        </button>
                    </div>
                </div>

                <div className="row g-2">
                    <div className="col-12 col-md-4">
                        <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                            <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                            <Form.Control className="bg-light border-0" placeholder="Search reference..."
                                          value={filters.search}
                                          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
                        </InputGroup>
                    </div>
                    <div className="col-12 col-md-3">
                        <Form.Select size="sm" className="bg-light border-0 rounded-pill ps-3" value={filters.method}
                                     onChange={(e) => setFilters({ ...filters, method: e.target.value, page: 1 })}>
                            <option value="">All Methods</option>
                            {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </Form.Select>
                    </div>
                </div>
            </div>

            {/* MOBILE LIST VIEW */}
            <div className="d-block d-md-none">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : data.results.map((pay: any) => (
                    <div key={pay.id} className="p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div className="fw-bold text-dark">{pay.payment_date}</div>
                                <div className="text-muted x-small">Transaction ID: #{pay.id}</div>
                            </div>
                            <div className="text-end">
                                <div className="fw-bold text-success h5 mb-0">৳{Number(pay.amount).toLocaleString()}</div>
                                <div className="badge bg-light text-dark border fw-normal x-small">{pay.method}</div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-end">
                            <div>
                                <div className="fw-bold text-primary small">{cache[pay.lease]?.renter || "..."}</div>
                                <div className="text-muted x-small">Unit: {cache[pay.lease]?.unit || "..."}</div>
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-sm btn-light border py-1" onClick={() => setEditingPayment(pay)}><i className="bi bi-pencil-square text-warning"></i></button>
                                <button className="btn btn-sm btn-light border py-1" onClick={() => handleDelete(pay.id)}><i className="bi bi-trash text-danger"></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="d-none d-md-block table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light border-bottom">
                        <tr className="text-muted x-small fw-bold text-uppercase">
                            <th className="ps-4 py-3">Date</th>
                            <th>Payer</th>
                            <th>Unit</th>
                            <th>Amount</th>
                            <th>Ref</th>
                            <th className="pe-4 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
                        ) : data.results.map((pay: any) => (
                            <tr key={pay.id}>
                                <td className="ps-4">
                                    <div className="fw-bold text-dark small">{pay.payment_date}</div>
                                    <div className="x-small text-muted">#{pay.id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold small text-primary">{cache[pay.lease]?.renter || "..."}</div>
                                    <div className="text-muted x-small font-monospace">L-{pay.lease}</div>
                                </td>
                                <td><Badge bg="light" className="text-dark border fw-normal">{cache[pay.lease]?.unit || "..."}</Badge></td>
                                <td className="fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</td>
                                <td className="small text-muted font-monospace">{pay.transaction_reference || "-"}</td>
                                <td className="pe-4 text-end">
                                    <div className="btn-group shadow-sm border rounded-3 overflow-hidden">
                                        <button className="btn btn-sm btn-white border-end" onClick={() => setEditingPayment(pay)}><i className="bi bi-pencil-square text-warning"></i></button>
                                        <button className="btn btn-sm btn-white text-danger" onClick={() => handleDelete(pay.id)}><i className="bi bi-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* RESPONSIVE PAGINATION */}
            <div className="p-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <span className="text-muted x-small">Records: {data.count}</span>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <Button variant="outline-secondary" size="sm" className="flex-grow-1" disabled={!data.previous} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</Button>
                    <Button variant="outline-secondary" size="sm" className="flex-grow-1" disabled={!data.next} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</Button>
                </div>
            </div>

            {/* MODALS */}
            {showBulkModal && <BulkPaymentModal onClose={() => setShowBulkModal(false)} onSuccess={() => { setShowBulkModal(false); loadPayments(); }} />}
            {activePaymentInvoice && <PaymentModal invoice={activePaymentInvoice} onClose={() => setActivePaymentInvoice(null)} onSuccess={() => { setActivePaymentInvoice(null); loadPayments(); }} />}
            {editingPayment && <EditPaymentModal payment={editingPayment} onClose={() => setEditingPayment(null)} onSuccess={() => { setEditingPayment(null); loadPayments(); }} />}

            {/* INVOICE LOOKUP MODAL (Mobile Responsive) */}
            <Modal show={showInvoiceLookup} onHide={() => setShowInvoiceLookup(false)} size="lg" centered fullscreen="sm-down">
                <Modal.Header closeButton className="bg-primary text-white sticky-top">
                    <Modal.Title className="h6 fw-bold mb-0">Select Invoice</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-light">
                    <div className="p-3 border-bottom bg-white sticky-top" style={{ top: '0', zIndex: 10 }}>
                        <Form.Control type="text" placeholder="Search Renter or Unit..." value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} autoFocus />
                    </div>
                    <div>
                        {lookupLoading ? (
                            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                        ) : (
                            unpaidInvoices.map(inv => {
                                const remaining = (Number(inv.amount) || 0) - (Number(inv.paid_amount) || 0);
                                return (
                                    <div key={inv.id} className="p-3 bg-white border-bottom" onClick={() => { setShowInvoiceLookup(false); setActivePaymentInvoice(inv); }} style={{ cursor: 'pointer' }}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-bold text-primary small">{inv.invoice_number}</div>
                                                <div className="fw-bold text-dark">{lookupCache[inv.lease]?.renter || "..."}</div>
                                                <div className="text-muted x-small">Unit: {lookupCache[inv.lease]?.unit || "..."}</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-danger">৳{remaining.toLocaleString()}</div>
                                                <Badge bg={inv.status === 'partially_paid' ? "info-xs" : "danger-xs"} className="x-small">
                                                    {inv.status === 'partially_paid' ? "PARTIAL" : "DUE"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}