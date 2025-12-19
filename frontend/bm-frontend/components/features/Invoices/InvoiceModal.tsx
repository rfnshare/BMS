import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import api from "../../../logic/services/apiClient"; // Adjust path to your api client

interface InvoiceModalProps {
  invoice?: any; // If present, we are in EDIT mode
  onClose: () => void;
  onSaved: () => void;
}

export default function InvoiceModal({ invoice, onClose, onSaved }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);

  // FIX TS2345: Explicitly type the state as an array of 'any' objects
  const [leases, setLeases] = useState<any[]>([]);

  // State for the nice UI error box
  const [serverError, setServerError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    lease: invoice?.lease || "",
    invoice_type: invoice?.invoice_type || "rent",
    amount: invoice?.amount || "",
    due_date: invoice?.due_date || "",
    description: invoice?.description || "",
    status: invoice?.status || "unpaid",
    invoice_month: invoice?.invoice_month || "", // Backend format: YYYY-MM-01
    _ui_month: invoice?.invoice_month?.substring(0, 7) || "", // UI format: YYYY-MM
  });

  // 1. HYDRATION: Load Active Leases & Fetch Names
  useEffect(() => {
    (async () => {
      try {
        // Fetch only active leases
        const { data } = await api.get("/leases/leases/", { params: { status: "active", page_size: 100 } });

        // Parallel fetch to get Renter and Unit names
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
            return { ...lease, renterName: "Unknown", unitName: "Unknown" };
          }
        }));
        setLeases(hydratedLeases);
      } catch (err) {
        console.error("Failed to load leases", err);
      }
    })();
  }, []);

  // 2. LOGIC: Auto-Calculate Total Amount when Lease Selected
  const handleLeaseSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setServerError(null);
    const leaseId = e.target.value;

    // Update state first
    setFormData(prev => ({ ...prev, lease: leaseId }));

    if (!leaseId) return;

    try {
      // Fetch full details to get 'lease_rents'
      const { data: fullLease } = await api.get(`/leases/leases/${leaseId}/`);
      const rents = fullLease.lease_rents || [];

      // FIX TS7006: JSDoc type cast for the accumulator
      const totalAmount = rents.reduce((/** @type {number} */ sum: number, item: any) => {
          return sum + parseFloat(item.amount || "0");
      }, 0);

      setFormData(prev => ({ ...prev, lease: leaseId, amount: totalAmount }));
    } catch (err) {
      console.error("Error calculating lease total", err);
    }
  };

  // 3. LOGIC: Date Automation (Month Picker -> Dates & Description)
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    const selectedMonthStr = e.target.value; // "2025-02"

    if (!selectedMonthStr) {
      setFormData(prev => ({ ...prev, invoice_month: "", _ui_month: "" }));
      return;
    }

    const [year, month] = selectedMonthStr.split('-');

    // Auto-set dates
    const invoiceMonthDate = `${selectedMonthStr}-01`;
    const dueDate = `${selectedMonthStr}-10`;

    // Auto-generate description
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
    const description = `Rent For ${monthName}`;

    setFormData(prev => ({
      ...prev,
      invoice_month: invoiceMonthDate,
      _ui_month: selectedMonthStr,
      due_date: dueDate,
      description: description
    }));
  };

  // 4. SUBMIT: With "Unique Set" Error Handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    // Prepare payload (remove _ui_month)
    const payload = {
        ...formData,
        // Ensure we send the correct fields expected by backend
    };
    // @ts-ignore
    delete payload._ui_month;

    try {
      if (invoice?.id) {
        await InvoiceService.update(invoice.id, payload);
      } else {
        await InvoiceService.create(payload);
      }
      onSaved();
    } catch (err: any) {
        // Check for the specific duplicate error from backend
        if (err.response && err.response.data && err.response.data.non_field_errors) {
            const errorMsg = JSON.stringify(err.response.data.non_field_errors);
            if (errorMsg.includes("unique set")) {
                setServerError("⚠️ An invoice for this Lease and Month already exists.");
            } else {
                setServerError(err.response.data.non_field_errors[0]);
            }
        } else {
            // Fallback
            setServerError(getErrorMessage(err));
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fw-bold">{invoice ? "Edit Invoice" : "Create New Invoice"}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">

          {/* 🔥 UI ERROR BOX */}
          {serverError && (
            <Alert variant="danger" className="d-flex align-items-center">
               <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
               <div>{serverError}</div>
            </Alert>
          )}

          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold">Target Lease / Renter</Form.Label>
                <Form.Select
                  required
                  className={serverError ? "border-danger" : ""}
                  value={formData.lease}
                  onChange={handleLeaseSelect}
                >
                  <option value="">Select Lease...</option>
                  {leases.map(l => (
                    <option key={l.id} value={l.id}>
                       {l.renterName} — {l.unitName} (Lease #{l.id})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">Selecting a lease will auto-calculate the total amount.</Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">Invoice Type</Form.Label>
                <Form.Select
                  value={formData.invoice_type}
                  onChange={e => setFormData({...formData, invoice_type: e.target.value})}
                >
                  <option value="rent">Monthly Rent</option>
                  <option value="security_deposit">Security Deposit</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Smart Date Picker */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-primary">Billing Month</Form.Label>
                <Form.Control
                  type="month"
                  className={serverError ? "border-danger" : ""}
                  value={formData._ui_month}
                  onChange={handleMonthChange}
                />
                <Form.Text className="text-muted x-small">Sets Invoice Date to 1st, Due Date to 10th.</Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">Total Amount (৳)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">Due Date</Form.Label>
                <Form.Control
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
               <Form.Group>
                <Form.Label className="small fw-bold">Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold">Internal Description / Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Rent description will appear here..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="white" className="border px-4 rounded-pill" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" className="px-4 rounded-pill shadow-sm" disabled={loading}>
            {loading ? "Processing..." : invoice ? "Update Invoice" : "Generate Invoice"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}