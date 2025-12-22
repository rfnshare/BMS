import { useEffect, useState, useMemo } from "react";
import { Modal, Button, Badge, Spinner } from "react-bootstrap";
import api from "../../../logic/services/apiClient";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Sub-Modals
import LeaseDocumentsModal from "./LeaseDocumentsModal";
import TerminateLeaseModal from "./TerminateLeaseModal";
import LeaseRentHistoryModal from "./LeaseRentHistoryModal";

interface Props {
  leaseId: number | null | undefined;
  onClose: () => void;
  reloadLeases?: () => void; // This will trigger the hook's refresh() in the Manager
  renterMap?: Map<number, any>;
  unitMap?: Map<number, any>;
}

export default function LeaseDetailsModal({
  leaseId,
  onClose,
  reloadLeases,
  renterMap,
  unitMap
}: Props) {
  const { success, error: notifyError } = useNotify(); // ✅ Use Professional Notifications

  const [lease, setLease] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Sub-modal visibility
  const [showDocs, setShowDocs] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 1. Fetch Details logic
  useEffect(() => {
    if (!leaseId || typeof leaseId !== "number") return;
    setLoading(true);
    api.get(`/leases/leases/${leaseId}/`)
      .then(res => setLease(res.data))
      .catch(err => notifyError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [leaseId, notifyError]);

  const renterData = useMemo(() => (!lease || !renterMap ? null : renterMap.get(lease.renter)), [lease, renterMap]);
  const unitData = useMemo(() => (!lease || !unitMap ? null : unitMap.get(lease.unit)), [lease, unitMap]);

  // UI Component: Consistent Row Design
  const InfoRow = ({ label, value, isBold = false }: any) => (
    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom border-light">
      <span className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>{label}</span>
      <span className={`${isBold ? 'fw-bold text-dark' : 'text-secondary'} small`}>
        {value || (loading ? "..." : "-")}
      </span>
    </div>
  );

  return (
    <Modal
      show={!!leaseId}
      onHide={onClose}
      size="xl"
      centered
      fullscreen="lg-down"
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 2. HEADER: Blueprint Styled (Dark/Secondary) */}
      <Modal.Header
        closeButton
        closeVariant="white"
        className={`p-3 p-md-4 border-0 text-white bg-${lease?.status === 'active' ? 'dark' : 'secondary'}`}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-20 rounded-circle p-2 d-none d-sm-block">
            <i className="bi bi-file-earmark-medical fs-4"></i>
          </div>
          <div>
            <Modal.Title className="fw-bold h6 mb-0">Lease Record Portal: #{leaseId}</Modal.Title>
            <Badge
                pill
                bg={lease?.status === 'active' ? 'success' : 'danger'}
                className="mt-1 x-small border border-white border-opacity-25"
            >
              <i className={`bi bi-${lease?.status === 'active' ? 'check-circle' : 'exclamation-circle'} me-1`}></i>
              {lease?.status?.toUpperCase() || "FETCHING"}
            </Badge>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4 bg-light">
        {loading && !lease ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
            <p className="text-muted small mt-2">Accessing Lease Records...</p>
          </div>
        ) : (
          <div className="row g-3 g-md-4">

            {/* LEFT: RENTER & MONEY */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
                <h6 className="fw-bold text-primary small text-uppercase mb-3 ls-1">Renter Profile</h6>
                <InfoRow label="Full Name" value={renterData?.full_name} isBold />
                <InfoRow label="Phone" value={renterData?.phone_number} />
                <InfoRow label="NID/Passport" value={renterData?.nid_number} />
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10 border-start border-primary border-4">
                <h6 className="fw-bold text-primary small text-uppercase mb-3 ls-1">Financial Standing</h6>
                <InfoRow label="Monthly Rent" value={`৳${Number(lease?.rent_amount || 0).toLocaleString()}`} isBold />
                <div className="d-flex justify-content-between mt-3 pt-2 border-top border-primary border-opacity-25">
                  <span className="fw-bold small text-muted">Current Balance</span>
                  <span className={`fw-bold h5 mb-0 ${lease?.current_balance > 0 ? 'text-danger' : 'text-success'}`}>
                    ৳{Number(lease?.current_balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* MIDDLE: UNIT & BILLING */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
                <h6 className="fw-bold text-primary small text-uppercase mb-3 ls-1">Unit Assignment</h6>
                <InfoRow label="Unit Name" value={unitData?.name} isBold />
                <InfoRow label="Start Date" value={lease?.start_date} />
                <InfoRow label="Termination" value={lease?.termination_date || "N/A (Active)"} />
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <h6 className="fw-bold text-primary small text-uppercase mb-3 ls-1">Cost Breakdown</h6>
                <div className="vstack gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {lease?.lease_rents?.map((r: any) => (
                    <div key={r.id} className="d-flex justify-content-between p-2 bg-light rounded-3 small border-0">
                      <span className="text-muted fw-bold" style={{fontSize: '0.65rem'}}>{r.rent_type_name?.toUpperCase()}</span>
                      <span className="fw-bold text-dark">৳{Number(r.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: HANDOVER & QUICK ACTIONS */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
                <h6 className="fw-bold text-primary small text-uppercase mb-3 ls-1">Asset Checklist</h6>
                <div className="row row-cols-2 g-2">
                  {[
                    { label: "Electricity", val: lease?.electricity_card_given },
                    { label: "Gas Card", val: lease?.gas_card_given },
                    { label: "Gate Key", val: lease?.main_gate_key_given },
                    { label: "Agreement", val: lease?.agreement_paper_given },
                  ].map((item, i) => (
                    <div key={i} className="col">
                      <div className={`p-2 rounded-3 text-center border h-100 ${item.val ? 'bg-success-subtle border-success text-success' : 'bg-light text-muted border-light'}`}>
                        <div style={{ fontSize: '0.6rem' }} className="fw-bold text-uppercase mb-1">{item.label}</div>
                        <i className={`bi bi-${item.val ? 'check-circle-fill' : 'x-circle'}`}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION STACK */}
              <div className="vstack gap-2 mt-auto">
                <Button variant="primary" className="rounded-pill fw-bold py-2 shadow-sm" onClick={() => setShowDocs(true)}>
                  <i className="bi bi-folder-fill me-2"></i> Documents
                </Button>
                <Button variant="outline-primary" className="rounded-pill fw-bold py-2" onClick={() => setShowHistory(true)}>
                  <i className="bi bi-clock-history me-2"></i> Rent Ledger
                </Button>
                {lease?.status === "active" && (
                    <Button variant="outline-danger" className="rounded-pill fw-bold py-2 mt-1" onClick={() => setShowTerminate(true)}>
                        <i className="bi bi-slash-circle me-2"></i> End Agreement
                    </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="p-3 bg-white border-top d-flex justify-content-end">
        <Button variant="light" className="rounded-pill px-4 fw-bold border text-muted" onClick={onClose}>
          Exit Dashboard
        </Button>
      </Modal.Footer>

      {/* 3. SUB-MODALS INTEGRATION */}
      {showDocs && (
        <LeaseDocumentsModal
          leaseId={lease?.id}
          leaseLabel={`${unitData?.name || ""} – ${renterData?.full_name || ""}`}
          onClose={() => setShowDocs(false)}
        />
      )}
      {showTerminate && (
        <TerminateLeaseModal
          lease={lease}
          onClose={() => setShowTerminate(false)}
          onSuccess={() => {
            success("Lease has been successfully terminated."); // ✅ Professional Toast
            setShowTerminate(false);
            reloadLeases?.(); // Refreshes Manager table via Hook
            onClose(); // Closes the Details Portal
          }}
        />
      )}
      {showHistory && (
        <LeaseRentHistoryModal leaseId={lease?.id} onClose={() => setShowHistory(false)} />
      )}
    </Modal>
  );
}