import {useEffect, useState} from "react";
import {InvoiceService} from "../../../logic/services/invoiceService";
import {getErrorMessage} from "../../../logic/utils/getErrorMessage";
import InvoiceModal from "./InvoiceModal";
import InvoicePreviewModal from "./InvoicePreviewModal";

export default function InvoiceManager() {
    // 1. Data State
    const [data, setData] = useState<any>({results: [], count: 0, next: null, previous: null});
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // 2. Filter State
    const [filters, setFilters] = useState({
        status: "",
        search: "",
        page: 1,
        ordering: "-id",
        invoice_month: "",
        invoice_type: "",
        lease: "",
    });

    // 3. Cache & Modals
    const [cache, setCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});
    const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'preview' | null, data: any }>({
        type: null,
        data: null
    });

    // --- API CALLS ---

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const res = await InvoiceService.list(filters);
            setData(res);
            hydrateData(res.results || []);
        } catch (err: any) {
            alert(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const hydrateData = async (invoices: any[]) => {
        const uniqueLeaseIds = [...new Set(invoices.map(inv => inv.lease))]
            .filter(id => id && !cache[id]);

        if (uniqueLeaseIds.length === 0) return;

        const hydrationTasks = uniqueLeaseIds.map(async (leaseId) => {
            try {
                const lease = await InvoiceService.getLease(leaseId as number);
                const [renterRes, unitRes] = await Promise.allSettled([
                    InvoiceService.getRenter(lease.renter),
                    InvoiceService.getUnit(lease.unit)
                ]);

                return {
                    id: leaseId,
                    data: {
                        renter: renterRes.status === 'fulfilled' ? (renterRes.value as any).full_name : "Unknown",
                        unit: unitRes.status === 'fulfilled' ? ((unitRes.value as any).name || (unitRes.value as any).unit_number) : "Unknown"
                    }
                };
            } catch (e: any) {
                return {id: leaseId, data: {renter: "Error", unit: "Error"}};
            }
        });

        const results = await Promise.all(hydrationTasks);

        setCache(prev => {
            const updated = {...prev};
            results.forEach(res => {
                if (res && res.id) updated[Number(res.id)] = res.data;
            });
            return updated;
        });
    };

    useEffect(() => {
        loadInvoices();
    }, [
        filters.status,
        filters.page,
        filters.search,
        filters.invoice_month,
        filters.invoice_type,
        filters.lease
    ]);

    // --- ACTIONS ---

    const handleBulkGenerate = async () => {
        const confirmMsg = "⚠️ Generate invoices for ALL active leases?";
        if (!window.confirm(confirmMsg)) return;

        setIsGenerating(true);
        try {
            await InvoiceService.generateMonthly();
            alert("✅ Success!");
            loadInvoices();
        } catch (err: any) {
            alert(getErrorMessage(err));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = async (invoice: any) => {
        if (invoice.invoice_pdf) {
            window.open(invoice.invoice_pdf, '_blank');
            return;
        }
        const isConfirmed = window.confirm("Generate new PDF?");
        if (!isConfirmed) return;
        try {
            setLoading(true);
            const response = await InvoiceService.generatePdf(invoice.id);
            if (response && response.pdf) {
                let pdfUrl = response.pdf;
                if (pdfUrl.startsWith("/")) pdfUrl = `http://127.0.0.1:8000${pdfUrl}`;
                window.open(pdfUrl, '_blank');
                loadInvoices();
            }
        } catch (err: any) {
            alert("Failed: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("⚠️ Delete this invoice?")) {
            try {
                await InvoiceService.destroy(id);
                loadInvoices();
            } catch (err: any) {
                alert(getErrorMessage(err));
            }
        }
    };

    const formatMonth = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('default', {month: 'short', year: 'numeric', timeZone: 'UTC'});
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-success-subtle text-success border-success';
            case 'partially_paid':
                return 'bg-info-subtle text-info border-info';
            case 'unpaid':
                return 'bg-danger-subtle text-danger border-danger';
            case 'draft':
                return 'bg-warning-subtle text-warning border-warning';
            case 'cancelled':
                return 'bg-secondary-subtle text-secondary border-secondary';
            default:
                return 'bg-light text-dark border';
        }
    };
    const handleResend = async (id: number) => {
        try {
            setLoading(true);
            await InvoiceService.resendNotification(id);
            alert("✅ Notification resent successfully!");
        } catch (err: any) {
            alert("Failed to resend: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-4 shadow-sm overflow-hidden">
            {/* 1. RESPONSIVE HEADER & FILTERS */}
            <div className="p-3 p-md-4 border-bottom">
                <div
                    className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                    <h5 className="fw-bold text-dark m-0">Invoice Manager</h5>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-warning rounded-pill px-3 fw-bold shadow-sm flex-grow-1 flex-md-grow-0"
                            onClick={handleBulkGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? <span className="spinner-border spinner-border-sm"></span> :
                                <i className="bi bi-lightning-charge-fill"></i>}
                            <span className="ms-2 d-none d-sm-inline">Generate</span>
                        </button>
                        <button
                            className="btn btn-primary rounded-pill px-3 fw-bold shadow-sm flex-grow-1 flex-md-grow-0"
                            onClick={() => setActiveModal({type: 'edit', data: null})}
                        >
                            <i className="bi bi-plus-lg me-2"></i>Create
                        </button>
                    </div>
                </div>

                <div className="row g-2">
                    <div className="col-12 col-md-3">
                        <input
                            type="text"
                            className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                            placeholder="Search Renter/Unit..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                        />
                    </div>
                    <div className="col-6 col-md-2">
                        <select
                            className="form-select form-select-sm bg-light border-0 ps-3 pe-4 rounded-pill"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                        >
                            <option value="">Status</option>
                            <option value="draft">Draft</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="partially_paid">Partial</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div className="col-6 col-md-2">
                        <input
                            type="month"
                            className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                            value={filters.invoice_month}
                            onChange={(e) => setFilters({...filters, invoice_month: e.target.value, page: 1})}
                        />
                    </div>
                    <div className="col-6 col-md-3">
                        <select
                            className="form-select form-select-sm bg-light border-0 ps-3 pe-4 rounded-pill"
                            value={filters.invoice_type}
                            onChange={(e) => setFilters({...filters, invoice_type: e.target.value, page: 1})}
                        >
                            <option value="">All Types</option>
                            <option value="rent">Rent</option>
                            <option value="security_deposit">Deposit</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="col-6 col-md-2">
                        <input
                            type="number"
                            className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                            placeholder="Lease ID"
                            value={filters.lease}
                            onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})}
                        />
                    </div>
                </div>
            </div>

            {/* 2. MOBILE LIST VIEW (Cards) */}
            <div className="d-block d-md-none">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : data.results.map((inv: any) => (
                    <div key={inv.id} className="p-3 border-bottom position-relative">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <div className="fw-bold text-dark">{inv.invoice_number}</div>
                                <div className="text-muted x-small">{formatMonth(inv.invoice_month)}</div>
                            </div>
                            <span className={`badge rounded-pill border x-small ${getStatusBadgeClass(inv.status)}`}>
                {inv.status.replace('_', ' ').toUpperCase()}
              </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                            <div className="small">
                                <div
                                    className="fw-bold text-primary">{cache[inv.lease as number]?.renter || "..."}</div>
                                <div
                                    className="text-muted x-small">{cache[inv.lease as number]?.unit || "..."} (LS-{inv.lease})
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="fw-bold">৳{Number(inv.amount).toLocaleString()}</div>
                                <div className="x-small text-muted text-capitalize">{inv.invoice_type}</div>
                            </div>
                        </div>

                        <div className="mt-3 d-flex gap-2">
                            <button className="btn btn-sm btn-light border flex-grow-1"
                                    onClick={() => handleDownloadPdf(inv)}>
                                <i className={`bi ${inv.invoice_pdf ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-pdf text-secondary'}`}></i>
                            </button>
                            <button className="btn btn-sm btn-light border flex-grow-1"
                                    onClick={() => setActiveModal({type: 'preview', data: inv})}>
                                <i className="bi bi-eye text-primary"></i>
                            </button>
                            <button className="btn btn-sm btn-light border flex-grow-1"
                                    onClick={() => setActiveModal({type: 'edit', data: inv})}>
                                <i className="bi bi-pencil text-warning"></i>
                            </button>
                            <button className="btn btn-sm btn-light border flex-grow-1"
                                    onClick={() => handleDelete(inv.id)}>
                                <i className="bi bi-trash text-danger"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. DESKTOP TABLE VIEW */}
            <div className="d-none d-md-block table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                    <tr className="text-muted x-small fw-bold text-uppercase">
                        <th className="ps-4 py-3">Invoice #</th>
                        <th>Month</th>
                        <th>Renter & Lease</th>
                        <th>Unit</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th className="pe-4 text-end">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                            </td>
                        </tr>
                    ) : data.results.map((inv: any) => (
                        <tr key={inv.id}>
                            <td className="ps-4">
                                <div className="fw-bold text-dark small">{inv.invoice_number}</div>
                                <div className="text-muted x-small">Date: {inv.invoice_date}</div>
                            </td>
                            <td className="small">{formatMonth(inv.invoice_month)}</td>
                            <td>
                                <div
                                    className="fw-bold small text-primary">{cache[inv.lease as number]?.renter || "..."}</div>
                                <div className="text-muted x-small">LS-{inv.lease}</div>
                            </td>
                            <td><span
                                className="badge bg-light text-dark border fw-normal">{cache[inv.lease as number]?.unit || "..."}</span>
                            </td>
                            <td className="fw-bold small">৳{Number(inv.amount).toLocaleString()}</td>
                            <td><span
                                className={`badge rounded-pill border x-small ${getStatusBadgeClass(inv.status)}`}>{inv.status.toUpperCase()}</span>
                            </td>
                            <td className="pe-4 text-end">
                                <div className="btn-group shadow-sm border rounded-3 overflow-hidden">
                                    <button
                                        className="btn btn-sm btn-white border-end"
                                        title="Resend Email/WhatsApp"
                                        onClick={() => handleResend(inv.id)}
                                    >
                                        <i className="bi bi-send text-info"></i>
                                    </button>
                                    <button className="btn btn-sm btn-white border-end"
                                            onClick={() => handleDownloadPdf(inv)}><i
                                        className={`bi ${inv.invoice_pdf ? 'bi-file-earmark-pdf-fill text-danger' : 'bi-file-earmark-pdf'}`}></i>
                                    </button>
                                    <button className="btn btn-sm btn-white border-end"
                                            onClick={() => setActiveModal({type: 'preview', data: inv})}><i
                                        className="bi bi-eye text-primary"></i></button>
                                    <button className="btn btn-sm btn-white border-end"
                                            onClick={() => setActiveModal({type: 'edit', data: inv})}><i
                                        className="bi bi-pencil text-warning"></i></button>
                                    <button className="btn btn-sm btn-white" onClick={() => handleDelete(inv.id)}><i
                                        className="bi bi-trash text-danger"></i></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 4. RESPONSIVE PAGINATION */}
            <div
                className="p-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <span className="text-muted x-small">Records: {data.count}</span>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <button className="btn btn-sm btn-light border rounded-pill px-4 flex-grow-1"
                            disabled={!data.previous}
                            onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev
                    </button>
                    <button className="btn btn-sm btn-light border rounded-pill px-4 flex-grow-1" disabled={!data.next}
                            onClick={() => setFilters({...filters, page: filters.page + 1})}>Next
                    </button>
                </div>
            </div>

            {activeModal.type === 'edit' && (
                <InvoiceModal invoice={activeModal.data} onClose={() => setActiveModal({type: null, data: null})}
                              onSaved={() => {
                                  setActiveModal({type: null, data: null});
                                  loadInvoices();
                              }}/>
            )}
            {activeModal.type === 'preview' && (
                <InvoicePreviewModal invoice={activeModal.data}
                                     onClose={() => setActiveModal({type: null, data: null})}/>
            )}
        </div>
    );
}