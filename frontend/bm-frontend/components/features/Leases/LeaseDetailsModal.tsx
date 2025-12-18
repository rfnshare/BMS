import { useEffect, useState, useMemo } from "react";
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

  // Sub-Modal States
  const [showDocs, setShowDocs] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 1. Fetch Fresh Lease Data on Mount/ID Change
  useEffect(() => {
    if (!leaseId || typeof leaseId !== "number") return;

    setLoading(true);
    api.get(`/leases/leases/${leaseId}/`)
      .then(res => setLease(res.data))
      .catch(err => console.error("Error fetching lease details:", err))
      .finally(() => setLoading(false));
  }, [leaseId]);

  // 2. Reactive Lookups: These automatically re-calculate when 'lease' is set
  const renterData = useMemo(() => {
    if (!lease || !renterMap) return null;
    return renterMap.get(lease.renter);
  }, [lease, renterMap]);

  const unitData = useMemo(() => {
    if (!lease || !unitMap) return null;
    return unitMap.get(lease.unit);
  }, [lease, unitMap]);

  if (!leaseId) return null;

  // Helper Component for UI consistency
  const InfoRow = ({ label, value, isBold = false }: any) => (
    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom border-light">
      <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{label}</span>
      <span className={`${isBold ? 'fw-bold text-dark' : 'text-secondary'} small`}>
        {value || (loading ? "..." : "-")}
      </span>
    </div>
  );

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered animate__animated animate__fadeInUp">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

          {/* DYNAMIC HEADER */}
          <div className={`modal-header p-4 border-0 text-white bg-${lease?.status === 'active' ? 'dark' : 'secondary'}`}>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-circle p-2">
                <i className="bi bi-file-earmark-text fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">Lease Portal: #{leaseId}</h5>
                <span className={`badge rounded-pill mt-1 bg-${lease?.status === 'active' ? 'success' : 'danger'}`}>
                  {lease?.status?.toUpperCase() || "LOADING"}
                </span>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light bg-opacity-50">
            {loading && !lease ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : (
              <div className="row g-4">

                {/* LEFT: RENTER & MONEY */}
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 h-50">
                    <h6 className="fw-bold text-primary small text-uppercase mb-3">Renter Profile</h6>
                    <InfoRow label="Full Name" value={renterData?.full_name} isBold />
                    <InfoRow label="Phone" value={renterData?.phone_number} />
                    <InfoRow label="NID/Passport" value={renterData?.nid_number} />
                  </div>

                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10 h-50">
                    <h6 className="fw-bold text-primary small text-uppercase mb-3">Financial Standing</h6>
                    <InfoRow label="Monthly Rent" value={`৳${Number(lease?.rent_amount || 0).toLocaleString()}`} isBold />
                    <InfoRow label="Deposit" value={`৳${Number(lease?.security_deposit || 0).toLocaleString()}`} />
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

                  <div className="card border-0 shadow-sm rounded-4 p-3 overflow-auto" style={{maxHeight: '220px'}}>
                    <h6 className="fw-bold text-primary small text-uppercase mb-3">Rent Breakdown</h6>
                    <div className="vstack gap-2">
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
                    <div className="row g-2">
                      {[
                        { label: "Electricity", val: lease?.electricity_card_given },
                        { label: "Gas Card", val: lease?.gas_card_given },
                        { label: "Gate Key", val: lease?.main_gate_key_given },
                        { label: "Agreemnt", val: lease?.agreement_paper_given },
                      ].map((item, i) => (
                        <div key={i} className="col-6">
                          <div className={`p-2 rounded-3 text-center border ${item.val ? 'bg-success-subtle border-success text-success' : 'bg-light text-muted'}`}>
                            <div style={{ fontSize: '0.65rem' }} className="fw-bold uppercase">{item.label}</div>
                            <i className={`bi bi-${item.val ? 'check-circle-fill' : 'x-circle'}`}></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="vstack gap-2">
                    <button className="btn btn-primary rounded-pill w-100 fw-bold shadow-sm" onClick={() => setShowDocs(true)}>
                      <i className="bi bi-folder2-open me-2"></i> Documents
                    </button>
                    <button className="btn btn-outline-primary rounded-pill w-100 fw-bold" onClick={() => setShowHistory(true)}>
                      <i className="bi bi-clock-history me-2"></i> Rent History
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-pill w-100 fw-bold"
                      disabled={lease?.status !== "active"}
                      onClick={() => setShowTerminate(true)}
                    >
                      <i className="bi bi-slash-circle me-2"></i> Terminate Lease
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 p-3 bg-white">
            <button className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={onClose}>Close Dashboard</button>
          </div>
        </div>
      </div>

      {/* SUB-MODAL LOGIC */}
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
    </div>
  );
}