import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner } from "react-bootstrap";

export default function TerminateLeaseModal({ lease, onClose, onSuccess }: any) {
  // 1. New States for Chained Data
  const [renterDetail, setRenterDetail] = useState<any>(null);
  const [unitDetail, setUnitDetail] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // 2. Chained Fetch Logic
  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoadingData(true);
        // Fetch Renter and Unit details in parallel using the IDs from the lease prop
        const [rRes, uRes] = await Promise.all([
          api.get(`/renters/${lease.renter}/`),
          api.get(`/buildings/units/${lease.unit}/`)
        ]);
        setRenterDetail(rRes.data);
        setUnitDetail(uRes.data);
      } catch (err) {
        console.error("Failed to load termination context", err);
        setError("Could not load renter or unit details.");
      } finally {
        setLoadingData(false);
      }
    };

    if (lease) fetchContext();
  }, [lease]);

  const terminate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/leases/leases/${lease.id}/terminate/`);
      setResult(res.data);
      // Wait 3 seconds then trigger success callback
      setTimeout(() => onSuccess(), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          {loadingData ? (
            <div className="modal-body p-5 text-center">
              <Spinner animation="border" variant="danger" />
              <p className="mt-3 text-muted">Loading agreement context...</p>
            </div>
          ) : !result ? (
            <>
              <div className="modal-header bg-danger text-white border-0 p-4">
                <h5 className="fw-bold mb-0">Terminate Agreement</h5>
                <button className="btn-close btn-close-white" onClick={onClose}></button>
              </div>
              <div className="modal-body p-4">
                {error && <div className="alert alert-danger border-0 small mb-3">{error}</div>}

                <div className="alert alert-warning border-0 rounded-4 d-flex gap-3 align-items-center mb-4">
                   <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                   <small className="fw-bold">Warning: Termination will vacate the unit and trigger final balance adjustments using the security deposit.</small>
                </div>

                <div className="bg-light p-3 rounded-4 mb-4 shadow-sm border">
                   {/* 🔥 Utilized Chained Data Here */}
                   <div className="d-flex justify-content-between mb-2 small fw-bold">
                      <span className="text-muted">Renter:</span>
                      <span className="text-dark">{renterDetail?.full_name || "N/A"}</span>
                   </div>
                   <div className="d-flex justify-content-between mb-2 small fw-bold">
                      <span className="text-muted">Unit:</span>
                      <span className="text-primary">{unitDetail?.name || "N/A"}</span>
                   </div>
                   <div className="d-flex justify-content-between small fw-bold">
                      <span className="text-muted">Current Dues:</span>
                      <span className="text-danger">৳{Number(lease.current_balance).toLocaleString()}</span>
                   </div>
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
               <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success display-1"></i>
               </div>
               <h4 className="fw-bold text-success">Lease Successfully Terminated</h4>
               <p className="text-muted">Final adjustments made. Unit <b>{unitDetail?.name}</b> is now marked as vacant.</p>
               <div className="badge bg-success bg-opacity-10 text-success p-2 px-3 rounded-pill mt-2 border border-success">
                  Security Deposit: ৳{Number(lease.security_deposit).toLocaleString()}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}