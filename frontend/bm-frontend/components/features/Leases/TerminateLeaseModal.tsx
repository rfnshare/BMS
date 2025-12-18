import { useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

export default function TerminateLeaseModal({ lease, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const terminate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/leases/leases/${lease.id}/terminate/`);
      setResult(res.data);
      // Wait 2 seconds before closing success state
      setTimeout(() => onSuccess(), 3000);
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
          {!result ? (
            <>
              <div className="modal-header bg-danger text-white border-0 p-4">
                <h5 className="fw-bold mb-0">Terminate Agreement</h5>
                <button className="btn-close btn-close-white" onClick={onClose}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-warning border-0 rounded-4 d-flex gap-3 align-items-center mb-4">
                   <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                   <small className="fw-bold">Warning: Termination will vacate the unit and trigger final balance adjustments using the security deposit.</small>
                </div>

                <div className="bg-light p-3 rounded-4 mb-4">
                   <div className="d-flex justify-content-between mb-2 small fw-bold"><span>Renter:</span> <span>{lease.renter?.full_name}</span></div>
                   <div className="d-flex justify-content-between mb-2 small fw-bold"><span>Unit:</span> <span className="text-primary">{lease.unit?.name}</span></div>
                   <div className="d-flex justify-content-between small fw-bold"><span>Current Dues:</span> <span className="text-danger">৳{lease.current_balance}</span></div>
                </div>

                <p className="text-muted small text-center px-3 italic">Are you sure you want to end this lease on <b>{new Date().toLocaleDateString()}</b>?</p>
              </div>
              <div className="modal-footer border-0 p-4 bg-light">
                <button className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
                <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={terminate} disabled={loading}>
                  {loading ? "Processing..." : "Confirm Termination"}
                </button>
              </div>
            </>
          ) : (
            <div className="modal-body p-5 text-center animate__animated animate__zoomIn">
               <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
               <h4 className="fw-bold text-success">Lease Successfully Terminated</h4>
               <p className="text-muted">Final invoices have been generated and unit <b>{lease.unit?.name}</b> is now vacant.</p>
               <div className="badge bg-success bg-opacity-10 text-success p-2 px-3 rounded-pill mt-2">
                  Deposit Adjusted: ৳{lease.security_deposit}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}