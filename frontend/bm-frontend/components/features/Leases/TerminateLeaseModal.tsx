import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Modal, Button, Alert } from "react-bootstrap";

export default function TerminateLeaseModal({ lease, onClose, onSuccess }: any) {
  const [renterDetail, setRenterDetail] = useState<any>(null);
  const [unitDetail, setUnitDetail] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoadingData(true);
        const [rRes, uRes] = await Promise.all([
          api.get(`/renters/${lease.renter}/`),
          api.get(`/buildings/units/${lease.unit}/`)
        ]);
        setRenterDetail(rRes.data);
        setUnitDetail(uRes.data);
      } catch (err) {
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
      setTimeout(() => onSuccess(), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      fullscreen="sm-down" // 🔥 Desktop: Box | Mobile: Fullscreen
      scrollable
    >
      {loadingData ? (
        <Modal.Body className="p-5 text-center d-flex flex-column justify-content-center align-items-center">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3 text-muted fw-bold">Analyzing Agreement...</p>
        </Modal.Body>
      ) : !result ? (
        <>
          {/* HEADER: High visibility red for danger actions */}
          <Modal.Header closeButton className="bg-danger text-white border-0 p-3 p-md-4">
            <Modal.Title className="h6 fw-bold mb-0">End Tenancy Agreement</Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-3 p-md-4 bg-light bg-opacity-50">
            {error && <Alert variant="danger" className="py-2 small border-0 shadow-sm mb-3">{error}</Alert>}

            <div className="alert alert-warning border-0 rounded-4 d-flex gap-3 align-items-start mb-4 shadow-sm">
               <i className="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
               <div className="small fw-bold">
                  Warning: Unit will be marked VACANT. Final dues will be deducted from the security deposit.
               </div>
            </div>

            {/* SUMMARY CARD: Edge-to-edge look on mobile */}
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
               <div className="d-flex justify-content-between mb-2 small border-bottom pb-2">
                  <span className="text-muted fw-bold text-uppercase" style={{fontSize: '0.6rem'}}>Resident</span>
                  <span className="text-dark fw-bold">{renterDetail?.full_name || "N/A"}</span>
               </div>
               <div className="d-flex justify-content-between mb-2 small border-bottom pb-2">
                  <span className="text-muted fw-bold text-uppercase" style={{fontSize: '0.6rem'}}>Unit</span>
                  <span className="text-primary fw-bold">{unitDetail?.name || "N/A"}</span>
               </div>
               <div className="d-flex justify-content-between align-items-center mt-2 pt-1">
                  <span className="text-muted fw-bold small text-uppercase" style={{fontSize: '0.6rem'}}>Final Balance</span>
                  <span className="text-danger fw-bold h4 mb-0">৳{Number(lease.current_balance).toLocaleString()}</span>
               </div>
            </div>

            <p className="text-muted small text-center px-2 italic">
                Confirming termination for <b>{new Date().toLocaleDateString()}</b>.<br/>
                <span className="text-danger">This action is permanent.</span>
            </p>
          </Modal.Body>

          <Modal.Footer className="border-0 p-3 bg-white flex-column flex-md-row gap-2">
            <Button
                variant="danger"
                className="w-100 rounded-pill py-2 fw-bold shadow-sm order-1"
                onClick={terminate}
                disabled={loading}
            >
              {loading ? <Spinner size="sm" className="me-2"/> : "Terminate Lease Now"}
            </Button>
            <Button
                variant="light"
                className="w-100 rounded-pill py-2 fw-bold border order-2"
                onClick={onClose}
            >
                Cancel
            </Button>
          </Modal.Footer>
        </>
      ) : (
        /* SUCCESS STATE */
        <Modal.Body className="p-4 p-md-5 text-center animate__animated animate__zoomIn d-flex flex-column justify-content-center min-vh-50">
           <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{fontSize: '5rem'}}></i>
           </div>
           <h4 className="fw-bold text-success">Tenancy Ended</h4>
           <p className="text-muted">Agreement LS-{lease.id} closed. Redirecting...</p>
           <div className="p-3 bg-success bg-opacity-10 text-success rounded-4 border border-success mt-3 small fw-bold">
              Final Deposit: ৳{Number(lease.security_deposit).toLocaleString()}
           </div>
        </Modal.Body>
      )}
    </Modal>
  );
}