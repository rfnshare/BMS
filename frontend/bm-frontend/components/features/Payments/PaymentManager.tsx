import { useEffect, useState } from "react";
import { PaymentService } from "../../../logic/services/paymentService";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import BulkPaymentModal from "./BulkPaymentModal";
import PaymentModal from "./PaymentModal";
import EditPaymentModal from "./EditPaymentModal"; // We will create this below
import { Modal, Button, Table, Badge, Spinner, InputGroup, Form } from "react-bootstrap";

export default function PaymentManager() {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    method: "",
    search: "",
    lease: "",
    page: 1,
    ordering: "-id"
  });

  // Caches
  const [cache, setCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});
  const [lookupCache, setLookupCache] = useState<{ [key: number]: { renter: string, unit: string } }>({});

  // Modals
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<any | null>(null);
  const [editingPayment, setEditingPayment] = useState<any | null>(null); // 🔥 For Edit Modal

  // Lookup Modal State
  const [showInvoiceLookup, setShowInvoiceLookup] = useState(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // --- API ---
  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await PaymentService.list(filters);
      setData(res);
      hydrateData(res.results || [], setCache, cache);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIX TS7006: Explicitly type 'items', 'setCacheFn', 'currentCache'
  const hydrateData = async (
    items: any[],
    setCacheFn: React.Dispatch<React.SetStateAction<{ [key: number]: { renter: string, unit: string } }>>,
    currentCache: { [key: number]: { renter: string, unit: string } }
  ) => {
    const uniqueLeaseIds = [...new Set(items.map(i => i.lease))]
      .filter(id => id && !currentCache[id as number]);

    if (uniqueLeaseIds.length === 0) return;

    const tasks = uniqueLeaseIds.map(async (leaseId) => {
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
            unit: unitRes.status === 'fulfilled' ? ((unitRes.value as any).name) : "Unknown"
          }
        };
      } catch (e) {
        return { id: leaseId, data: { renter: "Error", unit: "Error" } };
      }
    });

    const results = await Promise.all(tasks);

    // 🔥 FIX TS7006: Explicitly type 'prev'
    setCacheFn((prev: any) => {
      const updated = { ...prev };
      results.forEach(res => { if(res && res.id) updated[Number(res.id)] = res.data; });
      return updated;
    });
  };

  useEffect(() => { loadPayments(); }, [filters.method, filters.page, filters.search, filters.lease]);

  // --- INVOICE LOOKUP ---
  const fetchUnpaidInvoices = async () => {
    setLookupLoading(true);
    try {
      const res = await InvoiceService.list({
        status: "unpaid",
        search: invoiceSearch,
        page_size: 10
      });
      const invoices = res.results || [];
      setUnpaidInvoices(invoices);
      hydrateData(invoices, setLookupCache, lookupCache);
    } catch (err) {
      console.error(err);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    if (showInvoiceLookup) {
        const timer = setTimeout(() => { fetchUnpaidInvoices(); }, 500);
        return () => clearTimeout(timer);
    }
  }, [invoiceSearch, showInvoiceLookup]);

  // --- DELETE ---
  const handleDelete = async (id: number) => {
    if (confirm("⚠️ WARNING: Deleting a payment will reverse the transaction. Continue?")) {
      try {
        await PaymentService.destroy(id);
        loadPayments();
      } catch (err: any) {
        alert(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="bg-white">
      {/* HEADER */}
      <div className="p-4 border-bottom">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <h5 className="fw-bold text-dark m-0">Payment History</h5>
            <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" onClick={() => setShowInvoiceLookup(true)}>
                    <i className="bi bi-receipt me-2"></i>Invoice Payment
                </button>
                <button className="btn btn-success btn-sm rounded-pill px-3 fw-bold shadow-sm" onClick={() => setShowBulkModal(true)}>
                    <i className="bi bi-cash-stack me-2"></i>Bulk Payment
                </button>
            </div>
        </div>

        {/* FILTERS */}
        <div className="d-flex gap-2 flex-wrap">
            <input type="text" className="form-control form-control-sm bg-light border-0 px-3 rounded-pill" placeholder="Search Ref..." style={{ width: '200px' }} value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})} />
            <input type="number" className="form-control form-control-sm bg-light border-0 px-3 rounded-pill" placeholder="Lease ID" style={{ width: '100px' }} value={filters.lease} onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})} />
            <select className="form-select form-select-sm bg-light border-0 px-3 rounded-pill w-auto" value={filters.method} onChange={(e) => setFilters({...filters, method: e.target.value, page: 1})}>
                <option value="">All Methods</option>
                {PaymentService.getMethods().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted x-small fw-bold text-uppercase">
              <th className="ps-4 py-3">Date</th>
              <th>Payer</th>
              <th>Unit</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Ref</th>
              <th>Type</th>
              <th className="pe-4 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
            ) : data.results.map((pay: any) => (
              <tr key={pay.id}>
                <td className="ps-4 fw-bold text-dark small">{pay.payment_date}</td>
                <td><div className="fw-bold small text-primary">{cache[pay.lease]?.renter || "Loading..."}</div><div className="text-muted x-small">Lease #{pay.lease}</div></td>
                <td><span className="badge bg-light text-dark border fw-normal">{cache[pay.lease]?.unit || "..."}</span></td>
                <td className="text-capitalize small">{pay.method}</td>
                <td className="fw-bold text-success">+৳{Number(pay.amount).toLocaleString()}</td>
                <td className="small text-muted font-monospace">{pay.transaction_reference || "-"}</td>
                <td>{pay.invoice ? <Badge bg="primary-subtle" className="text-primary border border-primary-subtle">INV-{pay.invoice}</Badge> : <Badge bg="success-subtle" className="text-success border border-success-subtle">Bulk</Badge>}</td>
                <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm rounded-3">
                        {/* 🔥 NEW: Edit Button */}
                        <button className="btn btn-sm btn-white border-end" title="Edit Payment" onClick={() => setEditingPayment(pay)}>
                            <i className="bi bi-pencil text-warning"></i>
                        </button>
                        {/* Delete Button */}
                        <button className="btn btn-sm btn-white text-danger" title="Reverse" onClick={() => handleDelete(pay.id)}>
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="p-3 border-top d-flex justify-content-between align-items-center">
        <span className="text-muted x-small">Records: {data.count}</span>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</button>
          <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showBulkModal && <BulkPaymentModal onClose={() => setShowBulkModal(false)} onSuccess={() => { setShowBulkModal(false); loadPayments(); }} />}
      {activePaymentInvoice && <PaymentModal invoice={activePaymentInvoice} onClose={() => setActivePaymentInvoice(null)} onSuccess={() => { setActivePaymentInvoice(null); loadPayments(); }} />}

      {/* 🔥 NEW: Edit Modal */}
      {editingPayment && (
        <EditPaymentModal
            payment={editingPayment}
            onClose={() => setEditingPayment(null)}
            onSuccess={() => { setEditingPayment(null); loadPayments(); }}
        />
      )}

      {/* Lookup Modal */}
      <Modal show={showInvoiceLookup} onHide={() => setShowInvoiceLookup(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white"><Modal.Title className="h6 fw-bold mb-0">Select Invoice to Pay</Modal.Title></Modal.Header>
        <Modal.Body className="p-0">
            <div className="p-3 border-bottom bg-light">
                <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                    <Form.Control type="text" className="border-start-0" placeholder="Search..." value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} autoFocus />
                </InputGroup>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {lookupLoading ? <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div> : unpaidInvoices.length === 0 ? <div className="text-center p-5 text-muted">No unpaid invoices.</div> : (
                    <Table hover className="mb-0 align-middle" responsive>
                        <tbody>
                            {unpaidInvoices.map(inv => (
                                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => { setShowInvoiceLookup(false); setActivePaymentInvoice(inv); }}>
                                    <td className="ps-4"><div className="fw-bold text-primary">{inv.invoice_number}</div><div className="text-muted x-small">Due: {inv.due_date}</div></td>
                                    <td><div className="fw-bold text-dark small">{lookupCache[inv.lease]?.renter || "Loading..."}</div><div className="text-muted x-small">LS-{inv.lease}</div></td>
                                    <td className="text-end pe-4"><div className="fw-bold text-danger">৳{Number(inv.amount).toLocaleString()}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}