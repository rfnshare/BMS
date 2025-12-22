import { useState } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify

interface Props {
  lease: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function LeaseRentChangeModal({ lease, onClose, onSaved }: Props) {
  const { success, error: notifyError } = useNotify(); // ✅ Professional feedback

  const [newAmount, setNewAmount] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const currentTotal = Number(lease.rent_amount || 0);
  const difference = Number(newAmount) - currentTotal;

  const handleApplyChange = async () => {
    if (!newAmount || Number(newAmount) <= 0) {
      notifyError("Please enter a valid monthly amount.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/leases/lease-rent-history/", {
        lease: lease.id,
        old_rent: currentTotal,
        new_rent: Number(newAmount),
        effective_date: new Date().toISOString().split('T')[0],
        remarks: remarks,
      });

      success(`Rent updated for Unit ${lease.unit?.name || 'Lease'}`);
      onSaved();
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show
      onHide={onClose}
      centered
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-graph-up-arrow fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0">Adjust Monthly Rent</Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               UNIT: {lease.unit?.name || 'Active Lease'}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {/* 2. COMPARISON SECTION: Blueprint Rounded Cards */}
        <div className="row g-2 mb-4">
          <div className="col-6">
            <div className="bg-white p-3 rounded-4 shadow-sm border-start border-3 border-secondary text-center">
              <div className="text-muted fw-bold text-uppercase ls-1 mb-1" style={{ fontSize: '0.6rem' }}>Current Rent</div>
              <div className="h5 fw-bold mb-0">৳{currentTotal.toLocaleString()}</div>
            </div>
          </div>
          <div className="col-6">
            <div className={`bg-white p-3 rounded-4 shadow-sm border-start border-3 text-center ${difference >= 0 ? 'border-success' : 'border-danger'}`}>
              <div className="text-muted fw-bold text-uppercase ls-1 mb-1" style={{ fontSize: '0.6rem' }}>Target Rent</div>
              <div className={`h5 fw-bold mb-0 ${newAmount ? 'text-dark' : 'text-muted opacity-25'}`}>
                ৳{newAmount ? Number(newAmount).toLocaleString() : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. INPUT SECTION: Blueprint Pill Inputs */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="mb-4">
            <Form.Label className="text-muted small fw-bold text-uppercase ls-1">1. Set New Amount</Form.Label>
            <InputGroup className="bg-light rounded-pill overflow-hidden border-0">
              <InputGroup.Text className="bg-light border-0 ps-3 fw-bold text-primary">৳</InputGroup.Text>
              <Form.Control
                type="number"
                className="bg-light border-0 fw-bold py-2 shadow-none"
                placeholder="Enter amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </InputGroup>
            {newAmount && (
               <div className={`mt-2 ps-2 small fw-bold ${difference >= 0 ? 'text-success' : 'text-danger'}`}>
                  <i className={`bi bi-caret-${difference >= 0 ? 'up-fill' : 'down-fill'} me-1`}></i>
                  {difference >= 0 ? 'Increase' : 'Decrease'} of ৳{Math.abs(difference).toLocaleString()}
               </div>
            )}
          </div>

          <div className="mb-0">
            <Form.Label className="text-muted small fw-bold text-uppercase ls-1">2. Adjustment Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="bg-light border-0 rounded-4 p-3 small shadow-none"
              placeholder="Reason for change (e.g. Annual Increment)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>

      {/* 4. FOOTER: Pill Buttons */}
      <Modal.Footer className="border-0 p-3 bg-white d-flex justify-content-end gap-2 px-md-4">
        <Button variant="light" className="rounded-pill px-4 border text-muted small fw-bold" onClick={onClose}>
            Cancel
        </Button>
        <Button
          variant="primary"
          className="rounded-pill px-5 fw-bold shadow-sm"
          onClick={handleApplyChange}
          disabled={loading || !newAmount}
        >
          {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
          Commit Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}