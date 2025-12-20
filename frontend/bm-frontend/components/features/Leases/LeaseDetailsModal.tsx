import { useEffect, useState, useMemo } from "react";
import { Modal, Button, Badge, Spinner } from "react-bootstrap";
import api from "../../../logic/services/apiClient";
import LeaseDocumentsModal from "./LeaseDocumentsModal";
import TerminateLeaseModal from "./TerminateLeaseModal";
import LeaseRentHistoryModal from "./LeaseRentHistoryModal";

interface Props {
  leaseId: number | null | undefined;
  onClose: () => void;
  reloadLeases?: () => void;
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
  const [lease, setLease] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [showDocs, setShowDocs] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!leaseId || typeof leaseId !== "number") return;
    setLoading(true);
    api.get(`/leases/leases/${leaseId}/`)
      .then(res => setLease(res.data))
      .catch(err => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, [leaseId]);

  const renterData = useMemo(() => (!lease || !renterMap ? null : renterMap.get(lease.renter)), [lease, renterMap]);
  const unitData = useMemo(() => (!lease || !unitMap ? null : unitMap.get(lease.unit)), [lease, unitMap]);

  const InfoRow = ({ label, value, isBold = false }: any) => (
    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom border-light">
      <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{label}</span>
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
      centered // 🔥 Keeps it perfectly centered in the middle on Laptop
      fullscreen="lg-down" // 🔥 Full-screen takeover on Mobile
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. DYNAMIC HEADER */}
      <Modal.Header
        closeButton
        closeVariant="white"
        className={`p-4 border-0 text-white bg-${lease?.status === 'active' ? 'dark' : 'secondary'}`}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-20 rounded-circle p-2 d-none d-sm-block">
            <i className="bi bi-file-earmark-text fs-4"></i>
          </div>
          <div>
            <Modal.Title className="fw-bold h5 mb-0">Lease Portal: #{leaseId}</Modal.Title>
            <Badge pill bg={lease?.status === 'active' ? 'success' : 'danger'} className="mt-1">
              {lease?.status?.toUpperCase() || "LOADING"}
            </Badge>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4 bg-light">
        {loading && !lease ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <div className="row g-3 g-md-4">

            {/* LEFT: RENTER & MONEY */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                <h6 className="fw-bold text-primary small text-uppercase mb-3">Renter Profile</h6>
                <InfoRow label="Full Name" value={renterData?.full_name} isBold />
                <InfoRow label="Phone" value={renterData?.phone_number} />
                <InfoRow label="NID/Passport" value={renterData?.nid_number} />
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10">
                <h6 className="fw-bold text-primary small text-uppercase mb-3">Financial Standing</h6>
                <InfoRow label="Monthly Rent" value={`৳${Number(lease?.rent_amount || 0).toLocaleString()}`} isBold />
                <div className="d-flex justify-content-between mt-3 pt-2 border-top border-primary border-opacity-25">
                  <span className="fw-bold small">Current Balance</span>
                  <span className={`fw-bold fs-5 ${lease?.current_balance > 0 ? 'text-danger' : 'text-success'}`}>
                    ৳{Number(lease?.current_balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* MIDDLE: UNIT & BILLING */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                <h6 className="fw-bold text-primary small text-uppercase mb-3">Unit Details</h6>
                <InfoRow label="Unit Name" value={unitData?.name} isBold />
                <InfoRow label="Start Date" value={lease?.start_date} />
                <InfoRow label="Termination" value={lease?.termination_date || "Active Agreement"} />
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-3">
                <h6 className="fw-bold text-primary small text-uppercase mb-3">Rent Breakdown</h6>
                <div className="vstack gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {lease?.lease_rents?.map((r: any) => (
                    <div key={r.id} className="d-flex justify-content-between p-2 bg-white rounded-3 small border">
                      <span className="text-muted">{r.rent_type_name}</span>
                      <span className="fw-bold text-dark">৳{Number(r.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: CHECKLIST & ACTIONS */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                <h6 className="fw-bold text-primary small text-uppercase mb-3">Handover Checklist</h6>
                <div className="row row-cols-2 g-2">
                  {[
                    { label: "Electricity", val: lease?.electricity_card_given },
                    { label: "Gas Card", val: lease?.gas_card_given },
                    { label: "Gate Key", val: lease?.main_gate_key_given },
                    { label: "Agreemnt", val: lease?.agreement_paper_given },
                  ].map((item, i) => (
                    <div key={i} className="col">
                      <div className={`p-2 rounded-3 text-center border h-100 ${item.val ? 'bg-success-subtle border-success text-success' : 'bg-light text-muted'}`}>
                        <div style={{ fontSize: '0.65rem' }} className="fw-bold uppercase mb-1">{item.label}</div>
                        <i className={`bi bi-${item.val ? 'check-circle-fill' : 'x-circle'}`}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vstack gap-2 mt-auto">
                <Button variant="primary" className="rounded-pill fw-bold py-2" onClick={() => setShowDocs(true)}>
                  <i className="bi bi-folder2-open me-2"></i> Documents
                </Button>
                <Button variant="outline-primary" className="rounded-pill fw-bold py-2" onClick={() => setShowHistory(true)}>
                  <i className="bi bi-clock-history me-2"></i> Rent History
                </Button>
                <Button
                  variant="outline-danger"
                  className="rounded-pill fw-bold py-2"
                  disabled={lease?.status !== "active"}
                  onClick={() => setShowTerminate(true)}
                >
                  <i className="bi bi-slash-circle me-2"></i> Terminate
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-white">
        <Button variant="secondary" className="rounded-pill px-4 fw-bold w-100 w-md-auto" onClick={onClose}>
          Close Dashboard
        </Button>
      </Modal.Footer>

      {/* SUB-MODALS */}
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
          onSuccess={() => { setShowTerminate(false); reloadLeases?.(); onClose(); }}
        />
      )}
      {showHistory && (
        <LeaseRentHistoryModal leaseId={lease?.id} onClose={() => setShowHistory(false)} />
      )}
    </Modal>
  );
}