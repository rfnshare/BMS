import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify
import { Spinner, Modal, Button, Badge } from "react-bootstrap";

export default function TerminateLeaseModal({ lease, onClose, onSuccess }: any) {
  const { success, error: notifyError } = useNotify(); // ✅ Access Professional Toasts

  const [renterDetail, setRenterDetail] = useState<any>(null);
  const [unitDetail, setUnitDetail] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Context (Renter & Unit details)
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
        notifyError("Context Error: Could not verify renter or unit details.");
      } finally {
        setLoadingData(false);
      }
    };
    if (lease) fetchContext();
  }, [lease, notifyError]);

  // 2. Logic: Handle Termination
  const handleTerminate = async () => {
    setLoading(true);
    try {
      await api.post(`/leases/leases/${lease.id}/terminate/`);

      // ✅ Blueprint Action: Success Toast -> Parent Refresh -> Close
      success(`Tenancy for ${unitDetail?.name} has been terminated.`);
      onSuccess(); // Refresh Manager
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      fullscreen="sm-down"
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {loadingData ? (
        <Modal.Body className="p-5 text-center d-flex flex-column justify-content-center align-items-center bg-white">
          <Spinner animation="border" variant="danger" size="sm" />
          <p className="mt-3 text-muted fw-bold small text-uppercase ls-1">Analyzing Agreement...</p>
        </Modal.Body>
      ) : (
        <>
          {/* HEADER: Blueprint Danger Style */}
          <Modal.Header closeButton className="bg-danger text-white border-0 p-3 p-md-4">
            <div className="d-flex align-items-center gap-3">
               <div className="bg-white bg-opacity-20 rounded-3 p-2">
                  <i className="bi bi-exclamation-octagon fs-5"></i>
               </div>
               <div>
                  <Modal.Title className="h6 fw-bold mb-0">End Tenancy Agreement</Modal.Title>
                  <div className="text-white opacity-75 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
                     Action: Permanent Termination
                  </div>
               </div>
            </div>
          </Modal.Header>

          <Modal.Body className="p-3 p-md-4 bg-light">
            {/* WARNING ALERT */}
            <div className="alert alert-warning border-0 rounded-4 d-flex gap-3 align-items-start mb-4 shadow-sm animate__animated animate__shakeX">
               <i className="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
               <div className="small fw-bold text-dark">
                  Unit <strong>{unitDetail?.name}</strong> will be marked as VACANT.
                  Dues will be settled via Security Deposit.
               </div>
            </div>

            {/* SUMMARY CARD: Contextual Info */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border-start border-4 border-danger">
               <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.65rem'}}>Legal Renter</span>
                  <span className="text-dark fw-bold small">{renterDetail?.full_name || "N/A"}</span>
               </div>
               <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted fw-bold text-uppercase ls-1" style={{fontSize: '0.65rem'}}>Property Unit</span>
                  <span className="text-primary fw-bold small">{unitDetail?.name || "N/A"}</span>
               </div>
               <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="text-muted fw-bold text-uppercase ls-1 d-block mb-1" style={{fontSize: '0.65rem'}}>Final Payable Balance</span>
                    <Badge pill bg="danger" className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2">
                        OUTSTANDING DUES
                    </Badge>
                  </div>
                  <span className="text-danger fw-bold h4 mb-0">৳{Number(lease.current_balance).toLocaleString()}</span>
               </div>
            </div>

            <div className="text-center px-2">
                <p className="text-muted small mb-1 fw-medium">
                    Effective Date: <strong>{new Date().toLocaleDateString()}</strong>
                </p>
                <Badge bg="light" className="text-danger small border border-danger border-opacity-10 py-2 px-3 rounded-pill">
                    <i className="bi bi-info-circle me-2"></i> This action cannot be undone.
                </Badge>
            </div>
          </Modal.Body>

          {/* FOOTER: Blueprint Pill Buttons */}
          <Modal.Footer className="border-0 p-3 p-md-4 bg-white shadow-sm d-flex flex-column flex-md-row gap-2">
            <Button
                variant="danger"
                className="w-100 rounded-pill py-2 fw-bold shadow-sm order-md-2"
                onClick={handleTerminate}
                disabled={loading}
            >
              {loading ? <Spinner size="sm" animation="border" className="me-2"/> : <><i className="bi bi-slash-circle me-2"></i>Terminate Lease</>}
            </Button>
            <Button
                variant="light"
                className="w-100 rounded-pill py-2 fw-bold border text-muted order-md-1"
                onClick={onClose}
            >
                Keep Agreement
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}