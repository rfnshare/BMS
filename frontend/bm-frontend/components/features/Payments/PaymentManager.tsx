import {useEffect, useState, useCallback} from "react";
import {PaymentService} from "../../../logic/services/paymentService";
import {InvoiceService} from "../../../logic/services/invoiceService";
import {getErrorMessage} from "../../../logic/utils/getErrorMessage";
import BulkPaymentModal from "./BulkPaymentModal";
import PaymentModal from "./PaymentModal";
import EditPaymentModal from "./EditPaymentModal";
import {Modal, Button, Table, Badge, Spinner, InputGroup, Form} from "react-bootstrap";

export default function PaymentManager() {
    const [data, setData] = useState<any>({results: [], count: 0, next: null, previous: null});
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        method: "",
        search: "",
        lease: "",
        page: 1,
        ordering: "-id"
    });

    // Caches for Payer and Unit names
    const [cache, setCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});
    const [lookupCache, setLookupCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});

    // Modals
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [activePaymentInvoice, setActivePaymentInvoice] = useState<any | null>(null);
    const [editingPayment, setEditingPayment] = useState<any | null>(null);
    const [showInvoiceLookup, setShowInvoiceLookup] = useState(false);

    const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState("");

    // ========================
    // 1. Data Hydration Logic
    // ========================
    // This function turns Lease IDs into "Renter Name" and "Unit Name"
    const hydrateData = useCallback(async (items: any[], isLookup = false) => {
        const uniqueLeaseIds = [...new Set(items.map(i => i.lease))].filter(Boolean);

        // Determine which cache to check against
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
                        renter: renterRes.status === 'fulfilled' ? (renterRes.value as any).full_name : "Unknown Renter",
                        unit: unitRes.status === 'fulfilled' ? (unitRes.value as any).name : "Unknown Unit"
                    }
                };
            } catch (e) {
                return {id: leaseId, data: {renter: "Error", unit: "Error"}};
            }
        }));

        const updateMap = results.reduce((acc: any, res: any) => {
            if (res) acc[res.id] = res.data;
            return acc;
        }, {});

        if (isLookup) {
            setLookupCache(prev => ({...prev, ...updateMap}));
        } else {
            setCache(prev => ({...prev, ...updateMap}));
        }
    }, [cache, lookupCache]);

    // ========================
    // 2. API Call Logic
    // ========================
    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await PaymentService.list(filters);
            setData(res);
            // Hydrate names after results are set
            if (res.results) await hydrateData(res.results);
        } catch (err: any) {
            alert(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [filters.method, filters.page, filters.search, filters.lease]);

    // ========================
    // 3. Invoice Lookup Logic
    // ========================
    // --- INVOICE LOOKUP ---
    const fetchUnpaidInvoices = async () => {
        setLookupLoading(true);
        try {
            // 🔥 We fire both requests at the same time for better performance
            const [unpaidRes, partialRes] = await Promise.all([
                InvoiceService.list({status: "unpaid", search: invoiceSearch, page_size: 10}),
                InvoiceService.list({status: "partially_paid", search: invoiceSearch, page_size: 10})
            ]);

            // Combine both results into one array
            const combinedInvoices = [
                ...(unpaidRes.results || []),
                ...(partialRes.results || [])
            ];

            setUnpaidInvoices(combinedInvoices);

            // Hydrate names (Renter/Unit) for these merged invoices
            if (combinedInvoices.length > 0) {
                await hydrateData(combinedInvoices, true);
            }
        } catch (err) {
            console.error("Lookup error:", err);
        } finally {
            setLookupLoading(false);
        }
    };

    useEffect(() => {
        if (showInvoiceLookup) {
            const timer = setTimeout(() => {
                fetchUnpaidInvoices();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [invoiceSearch, showInvoiceLookup]);

    // ========================
    // 4. Action Handlers
    // ========================
    const handleDelete = async (id: number) => {
        if (confirm("⚠️ WARNING: Deleting a payment will reverse the transaction and mark the invoice as unpaid. Continue?")) {
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
            {/* HEADER SECTION */}
            <div className="p-4 border-bottom bg-light">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                    <h5 className="fw-bold text-dark m-0">Payment History</h5>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                onClick={() => setShowInvoiceLookup(true)}>
                            <i className="bi bi-receipt me-2"></i>Invoice Payment
                        </button>
                        <button className="btn btn-success btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                onClick={() => setShowBulkModal(true)}>
                            <i className="bi bi-cash-stack me-2"></i>Bulk Payment
                        </button>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="d-flex gap-2 flex-wrap">
                    <InputGroup size="sm" style={{width: '220px'}}>
                        <InputGroup.Text className="bg-white border-0"><i
                            className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control className="bg-white border-0" placeholder="Search Reference..."
                                      value={filters.search}
                                      onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}/>
                    </InputGroup>
                    <Form.Select size="sm" className="bg-white border-0 w-auto" value={filters.method}
                                 onChange={(e) => setFilters({...filters, method: e.target.value, page: 1})}>
                        <option value="">All Methods</option>
                        {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </Form.Select>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light border-bottom">
                    <tr className="text-muted x-small fw-bold text-uppercase">
                        <th className="ps-4 py-3">Date</th>
                        <th>Payer</th>
                        <th>Unit</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Ref</th>
                        <th>Status</th>
                        <th className="pe-4 text-end">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="text-center py-5"><Spinner animation="border" variant="primary"/>
                            </td>
                        </tr>
                    ) : data.results.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-5 text-muted">No payment records found.</td>
                        </tr>
                    ) : data.results.map((pay: any) => (
                        <tr key={pay.id}>
                            <td className="ps-4">
                                <div className="fw-bold text-dark small">{pay.payment_date}</div>
                                <div className="x-small text-muted">#{pay.id}</div>
                            </td>
                            <td>
                                <div className="fw-bold small text-primary">
                                    {cache[pay.lease]?.renter || <Spinner animation="grow" size="sm"/>}
                                </div>
                                <div className="text-muted x-small font-monospace">L-{pay.lease}</div>
                            </td>
                            <td>
                                <Badge bg="light" className="text-dark border fw-normal">
                                    {cache[pay.lease]?.unit || "..."}
                                </Badge>
                            </td>
                            <td className="text-capitalize small">{pay.method}</td>
                            <td className="fw-bold text-success">৳{Number(pay.amount).toLocaleString()}</td>
                            <td className="small text-muted font-monospace">{pay.transaction_reference || "-"}</td>
                            <td>
                                {pay.invoice ? (
                                    <Badge bg="primary-subtle"
                                           className="text-primary border border-primary-subtle">INV-{pay.invoice}</Badge>
                                ) : (
                                    <Badge bg="info-subtle"
                                           className="text-info border border-info-subtle">Manual</Badge>
                                )}
                            </td>
                            <td className="pe-4 text-end">
                                <div className="btn-group shadow-sm rounded-3">
                                    <button className="btn btn-sm btn-white border-end" title="Edit"
                                            onClick={() => setEditingPayment(pay)}>
                                        <i className="bi bi-pencil-square text-warning"></i>
                                    </button>
                                    <button className="btn btn-sm btn-white text-danger" title="Reverse Transaction"
                                            onClick={() => handleDelete(pay.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER / PAGINATION */}
            <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                <span className="text-muted x-small">Total Records: {data.count}</span>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" disabled={!data.previous}
                            onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</Button>
                    <Button variant="outline-secondary" size="sm" disabled={!data.next}
                            onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</Button>
                </div>
            </div>

            {/* MODALS */}
            {showBulkModal && <BulkPaymentModal onClose={() => setShowBulkModal(false)} onSuccess={() => {
                setShowBulkModal(false);
                loadPayments();
            }}/>}
            {activePaymentInvoice &&
                <PaymentModal invoice={activePaymentInvoice} onClose={() => setActivePaymentInvoice(null)}
                              onSuccess={() => {
                                  setActivePaymentInvoice(null);
                                  loadPayments();
                              }}/>}
            {editingPayment &&
                <EditPaymentModal payment={editingPayment} onClose={() => setEditingPayment(null)} onSuccess={() => {
                    setEditingPayment(null);
                    loadPayments();
                }}/>}


            {/* Invoice Lookup Modal */}
            <Modal show={showInvoiceLookup} onHide={() => setShowInvoiceLookup(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="h6 fw-bold mb-0">Select Invoice to Pay</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3 border-bottom bg-light">
                        <Form.Control
                            type="text"
                            placeholder="Search Invoice Number or Renter..."
                            value={invoiceSearch}
                            onChange={(e) => setInvoiceSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {lookupLoading ? (
                            <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div>
                        ) : (
                            <Table hover className="mb-0 align-middle">
                                <tbody>
                                {unpaidInvoices.map(inv => {
                                    // 🔥 Step 1: Calculate the "Left" (Remaining) amount
                                    const total = Number(inv.amount) || 0;
                                    const paid = Number(inv.paid_amount) || 0;
                                    const remaining = total - paid;

                                    return (
                                        <tr
                                            key={inv.id}
                                            style={{cursor: 'pointer'}}
                                            onClick={() => {
                                                setShowInvoiceLookup(false);
                                                setActivePaymentInvoice(inv);
                                            }}
                                        >
                                            <td className="ps-4">
                                                <div className="fw-bold text-primary">{inv.invoice_number}</div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {/* 🔥 Step 2: Add status badge for clarity */}
                                                    <Badge
                                                        bg={inv.status === 'partially_paid' ? "info-subtle" : "danger-subtle"}
                                                        className={inv.status === 'partially_paid' ? "text-info border border-info-subtle" : "text-danger border border-danger-subtle"}
                                                        style={{fontSize: '0.65rem'}}
                                                    >
                                                        {inv.status === 'partially_paid' ? "PARTIAL" : "UNPAID"}
                                                    </Badge>
                                                    <span className="text-muted x-small">Due: {inv.due_date}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark small">
                                                    {lookupCache[inv.lease]?.renter || "Loading..."}
                                                </div>
                                                <div
                                                    className="text-muted x-small">Unit: {lookupCache[inv.lease]?.unit || "..."}</div>
                                            </td>
                                            <td className="text-end pe-4">
                                                {/* 🔥 Step 3: Show the Remaining Balance in bold red */}
                                                <div className="fw-bold text-danger">৳{remaining.toLocaleString()}</div>

                                                {/* If partially paid, show the original total as a reference */}
                                                {inv.status === 'partially_paid' && (
                                                    <div className="text-muted x-small text-decoration-line-through">
                                                        Total: ৳{total.toLocaleString()}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}