import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { InvoiceService } from "../../../logic/services/invoiceService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import api from "../../../logic/services/apiClient";

interface InvoiceModalProps {
  invoice?: any; // If present, we are in EDIT mode
  onClose: () => void;
  onSaved: () => void;
}

export default function InvoiceModal({ invoice, onClose, onSaved }: InvoiceModalProps) {
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
        const { data } = await api.get("/leases/leases/", { params: { status: "active", page_size: 100 } });
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

  const handleLeaseSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setServerError(null);
    const leaseId = e.target.value;
    setFormData(prev => ({ ...prev, lease: leaseId }));
    if (!leaseId) return;

    try {
      const { data: fullLease } = await api.get(`/leases/leases/${leaseId}/`);
      const rents = fullLease.lease_rents || [];
      const totalAmount = rents.reduce((sum: number, item: any) => sum + parseFloat(item.amount || "0"), 0);
      setFormData(prev => ({ ...prev, amount: totalAmount }));
    } catch (err) {
      console.error("Error calculating lease total", err);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    const selectedMonthStr = e.target.value;

    if (!selectedMonthStr) {
      setFormData(prev => ({ ...prev, invoice_month: "", _ui_month: "" }));
      return;
    }

    const [year, month] = selectedMonthStr.split('-');
    const invoiceMonthDate = `${selectedMonthStr}-01`;
    const dueDate = `${selectedMonthStr}-10`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    const payload = { ...formData };
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
        if (err.response?.data?.non_field_errors) {
            const errorMsg = JSON.stringify(err.response.data.non_field_errors);
            setServerError(errorMsg.includes("unique set") ? "⚠️ An invoice for this Lease and Month already exists." : err.response.data.non_field_errors[0]);
        } else {
            setServerError(getErrorMessage(err));
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔥 fullscreen="sm-down" ensures a great mobile experience */
    <Modal show onHide={onClose} size="lg" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-white border-bottom p-3">
        <Modal.Title className="fw-bold h6 mb-0">
            {invoice ? "Update Invoice" : "Create New Invoice"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
        <Modal.Body className="p-3 p-md-4 flex-grow-1 overflow-auto">
          {serverError && (
            <Alert variant="danger" className="d-flex align-items-center py-2 small rounded-3">
               <i className="bi bi-exclamation-triangle-fill me-2"></i>
               <div>{serverError}</div>
            </Alert>
          )}

          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Target Lease / Renter</Form.Label>
                <Form.Select
                  required
                  className={`py-2 rounded-3 ${serverError ? "border-danger" : ""}`}
                  value={formData.lease}
                  onChange={handleLeaseSelect}
                >
                  <option value="">Select Lease...</option>
                  {leases.map(l => (
                    <option key={l.id} value={l.id}>
                       {l.renterName} ({l.unitName})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Billing Month</Form.Label>
                <Form.Control
                  type="month"
                  required
                  className={`py-2 rounded-3 ${serverError ? "border-danger" : ""}`}
                  value={formData._ui_month}
                  onChange={handleMonthChange}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Invoice Type</Form.Label>
                <Form.Select
                  className="py-2 rounded-3"
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

            <Col xs={6} md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Amount (৳)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  required
                  className="py-2 rounded-3"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col xs={6} md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Due Date</Form.Label>
                <Form.Control
                  type="date"
                  required
                  className="py-2 rounded-3"
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
               <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Payment Status</Form.Label>
                <Form.Select
                  className="py-2 rounded-3"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Internal Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  className="rounded-3"
                  placeholder="Notes for renter..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-top p-3 bg-light">
          <Button variant="outline-secondary" className="border-0 d-md-none me-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="w-100 w-md-auto px-5 py-2 fw-bold rounded-pill shadow-sm"
            disabled={loading}
          >
            {loading ? "Processing..." : invoice ? "Update Invoice" : "Generate Invoice"}
          </Button>
          <Button variant="secondary" className="d-none d-md-block" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}