import { useEffect, useState, useMemo } from "react";
import { Modal, Button, Badge, Spinner, Row, Col, Card } from "react-bootstrap";
import api from "../../../logic/services/apiClient";
import { useNotify } from "../../../logic/context/NotificationContext";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Sub-Modals
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

export default function LeaseDetailsModal({ leaseId, onClose, reloadLeases, renterMap, unitMap }: Props) {
  const { success, error: notifyError } = useNotify();
  const [lease, setLease] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Sub-modal states
  const [showDocs, setShowDocs] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  const InfoRow = ({ label, value, isBold = false }: any) => (
    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom border-light">
      <span className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{label}</span>
      <span className={`${isBold ? 'fw-bold text-dark' : 'text-secondary'} small`}>{value || "-"}</span>
    </div>
  );

  return (
    <Modal
      show={!!leaseId}
      onHide={onClose}
      size="xl"
      centered
      fullscreen="lg-down"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-file-earmark-text fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 ls-1 text-uppercase">
              Lease Management Portal
            </Modal.Title>
            <div className="d-flex align-items-center gap-2 mt-1">
                <Badge pill bg={lease?.status === 'active' ? 'success' : 'danger'} className="x-small border border-white border-opacity-10 ls-1">
                    {lease?.status?.toUpperCase() || "SYNCING"}
                </Badge>
                <span className="text-white opacity-50 fw-bold x-small ls-1">RECORD #{leaseId}</span>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {loading && !lease ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" className="me-2" />
            <p className="text-muted small mt-2 fw-bold ls-1">ACCESSING LEASE RECORDS...</p>
          </div>
        ) : (
          <div className="row g-4 animate__animated animate__fadeIn">

            {/* 2. LEFT COLUMN: CORE CONTRACT SPECS */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100 border-start border-4 border-primary">
                <h6 className="fw-bold text-primary mb-4 text-uppercase small ls-1 border-bottom pb-2">
                  <i className="bi bi-person-badge me-2"></i>Agreement Specifications
                </h6>
                <Row className="g-4">
                  <Col md={6}>
                    <InfoRow label="Renter Name" value={renterData?.full_name} isBold />
                    <InfoRow label="Assigned Unit" value={unitData?.name} isBold />
                    <InfoRow label="Agreement Type" value={lease?.agreement_type || "Standard Residential"} />
                  </Col>
                  <Col md={6}>
                    <InfoRow label="Activation Date" value={lease?.start_date} />
                    <InfoRow label="Expiry/End Date" value={lease?.termination_date || "N/A (Ongoing)"} />
                    <InfoRow label="Security Deposit" value={`৳${Number(lease?.security_deposit || 0).toLocaleString()}`} />
                  </Col>
                </Row>

                <div className="mt-4 pt-3 border-top border-light">
                    <h6 className="fw-bold text-muted x-small text-uppercase ls-1 mb-3">Asset Handover Checklist</h6>
                    <Row className="row-cols-2 row-cols-md-4 g-2">
                    {[
                        { label: "Electricity", val: lease?.electricity_card_given },
                        { label: "Gas Card", val: lease?.gas_card_given },
                        { label: "Gate Key", val: lease?.main_gate_key_given },
                        { label: "Papers", val: lease?.agreement_paper_given },
                    ].map((item, i) => (
                        <Col key={i}>
                        <div className={`p-2 rounded-4 text-center border h-100 ${item.val ? 'bg-success-subtle border-success text-success' : 'bg-light text-muted border-light opacity-50'}`}>
                            <div style={{ fontSize: '0.55rem' }} className="fw-bold text-uppercase mb-1">{item.label}</div>
                            <i className={`bi bi-${item.val ? 'check-circle-fill' : 'dash-circle'}`}></i>
                        </div>
                        </Col>
                    ))}
                    </Row>
                </div>
              </div>
            </div>

            {/* 3. RIGHT COLUMN: FINANCIALS & ACTIONS */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-4 border-success mb-3">
                <h6 className="fw-bold text-success mb-3 text-uppercase small ls-1 border-bottom pb-2">
                  <i className="bi bi-cash-stack me-2"></i>Financial Standing
                </h6>
                <div className="d-flex justify-content-between align-items-end mb-3">
                    <div>
                        <div className="text-muted fw-bold x-small text-uppercase ls-1">Current Balance</div>
                        <h3 className={`fw-bold mb-0 ${lease?.current_balance > 0 ? 'text-danger' : 'text-success'}`}>
                            ৳{Number(lease?.current_balance || 0).toLocaleString()}
                        </h3>
                    </div>
                    <Badge bg="light" className="text-dark border fw-bold mb-1">
                        Rent: ৳{Number(lease?.rent_amount || 0).toLocaleString()}
                    </Badge>
                </div>

                <div className="bg-light p-3 rounded-4">
                    <div className="text-muted fw-bold x-small text-uppercase ls-1 mb-2">Cost Breakdown</div>
                    <div className="vstack gap-2" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {lease?.lease_rents?.map((r: any) => (
                        <div key={r.id} className="d-flex justify-content-between x-small">
                        <span className="text-muted fw-bold">{r.rent_type_name?.toUpperCase()}</span>
                        <span className="fw-bold text-dark">৳{Number(r.amount).toLocaleString()}</span>
                        </div>
                    ))}
                    </div>
                </div>
              </div>

              {/* ACTION STACK: Pill Button Style */}
              <div className="vstack gap-2">
                <Button variant="primary" className="rounded-pill fw-bold py-2 shadow-sm btn-sm ls-1" onClick={() => setShowDocs(true)}>
                  <i className="bi bi-folder2-open me-2"></i>VIEW DOCUMENTS
                </Button>
                <Button variant="outline-primary" className="rounded-pill fw-bold py-2 btn-sm ls-1" onClick={() => setShowHistory(true)}>
                  <i className="bi bi-clock-history me-2"></i>RENT LEDGER
                </Button>
                {lease?.status === "active" && (
                    <Button variant="outline-danger" className="rounded-pill fw-bold py-2 mt-2 btn-sm ls-1" onClick={() => setShowTerminate(true)}>
                        <i className="bi bi-slash-circle me-2"></i>TERMINATE AGREEMENT
                    </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="p-3 bg-white border-top d-flex justify-content-end px-md-5">
        <Button variant="light" className="rounded-pill px-4 fw-bold border text-muted small" onClick={onClose}>
          Exit Portal
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
          onSuccess={() => {
            success("Agreement terminated successfully.");
            setShowTerminate(false);
            reloadLeases?.();
            onClose();
          }}
        />
      )}
      {showHistory && (
        <LeaseRentHistoryModal leaseId={lease?.id} onClose={() => setShowHistory(false)} />
      )}
    </Modal>
  );
}