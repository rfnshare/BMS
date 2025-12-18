import { useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  lease: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function LeaseRentChangeModal({ lease, onClose, onSaved }: Props) {
  const [newAmount, setNewAmount] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTotal = Number(lease.rent_amount || 0);
  const difference = Number(newAmount) - currentTotal;

  const handleApplyChange = async () => {
    if (!newAmount || Number(newAmount) <= 0) {
      setError("Please enter a valid new rent amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Logic: This hits your LeaseRentHistory endpoint
      await api.post("/leases/lease-rent-history/", {
        lease: lease.id,
        old_rent: currentTotal,
        new_rent: Number(newAmount),
        effective_date: new Date().toISOString().split('T')[0],
        remarks: remarks,
      });
      
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          
          {/* HEADER */}
          <div className="modal-header bg-dark text-white p-4 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary rounded-circle p-2">
                <i className="bi bi-graph-up-arrow text-white"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">Adjust Monthly Rent</h5>
                <p className="mb-0 small opacity-75">Update contract value for Unit {lease.unit?.name}</p>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light bg-opacity-50">
            {error && <div className="alert alert-danger border-0 rounded-3 mb-3">{error}</div>}

            {/* COMPARISON CARDS */}
            <div className="row g-3 mb-4 text-center">
              <div className="col-6">
                <div className="bg-white p-3 rounded-4 shadow-sm border-bottom border-3 border-secondary">
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Current Rent</small>
                  <div className="h4 fw-bold mb-0">৳{currentTotal.toLocaleString()}</div>
                </div>
              </div>
              <div className="col-6">
                <div className={`bg-white p-3 rounded-4 shadow-sm border-bottom border-3 ${difference >= 0 ? 'border-success' : 'border-danger'}`}>
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>New Rent</small>
                  <div className={`h4 fw-bold mb-0 ${newAmount ? 'text-dark' : 'text-muted opacity-25'}`}>
                    ৳{newAmount ? Number(newAmount).toLocaleString() : '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* INPUT SECTION */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">New Monthly Amount</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light border-0">৳</span>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 fw-bold" 
                    placeholder="Enter amount"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                {newAmount && (
                   <div className={`mt-2 small fw-bold ${difference >= 0 ? 'text-success' : 'text-danger'}`}>
                      <i className={`bi bi-caret-${difference >= 0 ? 'up' : 'down'}-fill`}></i>
                      {difference >= 0 ? 'Increase' : 'Decrease'} of ৳{Math.abs(difference).toLocaleString()}
                   </div>
                )}
              </div>

              <div className="mb-0">
                <label className="form-label fw-bold small text-muted text-uppercase">Reason for Change</label>
                <textarea 
                  className="form-control bg-light border-0 rounded-3" 
                  rows={3} 
                  placeholder="e.g., Annual increment, market rate adjustment..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0 p-4 bg-white">
            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={onClose}>Cancel</button>
            <button 
              className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" 
              onClick={handleApplyChange}
              disabled={loading || !newAmount}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Update & Record"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}