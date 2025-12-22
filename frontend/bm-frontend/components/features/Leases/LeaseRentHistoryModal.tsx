import { Modal, Button, Spinner, Badge } from "react-bootstrap";
import { useLeaseHistory } from "../../../logic/hooks/useLeaseHistory"; // ✅ Custom Hook

interface Props {
  leaseId: number;
  onClose: () => void;
}

export default function LeaseRentHistoryModal({ leaseId, onClose }: Props) {
  // 1. Logic via Hook
  const { history, loading } = useLeaseHistory(leaseId);

  return (
    <Modal
      show={!!leaseId}
      onHide={onClose}
      centered
      size="lg"
      fullscreen="sm-down"
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 2. HEADER: Blueprint Style */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-clock-history fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0">Rent Audit Trail</Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
              Lease ID: #{leaseId} — Financial History
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4 bg-light">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
            <span className="text-muted small fw-bold">Retrieving Audit Logs...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border border-dashed mx-2">
            <i className="bi bi-journal-x display-4 text-light mb-2"></i>
            <p className="text-muted small italic mb-0">No rent adjustments recorded for this agreement.</p>
          </div>
        ) : (
          <div className="vstack gap-3 animate__animated animate__fadeIn">
            {history.map((h) => {
              const isIncrease = Number(h.new_rent) > Number(h.old_rent);

              return (
                <div
                  key={h.id}
                  className={`card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4 border-${isIncrease ? 'success' : 'danger'}`}
                >
                  <div className="card-body p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-start">
                      {/* Financial Change Info */}
                      <div className="d-flex align-items-center gap-3">
                        <div className={`rounded-pill p-2 bg-${isIncrease ? 'success' : 'danger'} bg-opacity-10 text-${isIncrease ? 'success' : 'danger'}`}>
                          <i className={`bi bi-graph-${isIncrease ? 'up' : 'down'}-arrow fs-5`}></i>
                        </div>
                        <div>
                          <div className="fw-bold h5 mb-0 text-dark">৳{Number(h.new_rent).toLocaleString()}</div>
                          <div className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>
                            Effective Date: {h.effective_date}
                          </div>
                        </div>
                      </div>

                      {/* Previous Snapshot */}
                      <div className="text-end">
                        <Badge pill className="bg-light text-muted border fw-bold mb-1" style={{ fontSize: '0.65rem' }}>
                          PREV: ৳{Number(h.old_rent).toLocaleString()}
                        </Badge>
                        <div className="text-muted" style={{ fontSize: '0.6rem' }}>
                          LOGGED: {new Date(h.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Audit Remarks */}
                    {h.remarks && (
                      <div className="mt-3 p-2 bg-light rounded-3 small border-start border-3 border-light-subtle">
                         <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                            Adjustor Notes
                         </div>
                         <span className="text-secondary italic">"{h.remarks}"</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-white shadow-sm d-flex justify-content-end">
        <Button variant="light" className="rounded-pill px-4 fw-bold border text-muted small" onClick={onClose}>
          Exit Audit View
        </Button>
      </Modal.Footer>
    </Modal>
  );
}