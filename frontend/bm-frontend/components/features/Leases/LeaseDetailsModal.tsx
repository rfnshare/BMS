import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import LeaseDocumentsModal from "./LeaseDocumentsModal";
import TerminateLeaseModal from "./TerminateLeaseModal";
import LeaseRentHistoryModal from "./LeaseRentHistoryModal";

interface Props {
  leaseId: number;
  onClose: () => void;
  reloadLeases?: () => void; // Optional callback to refresh parent list
}

export default function LeaseDetailsModal({ leaseId, onClose, reloadLeases }: Props) {
  const [lease, setLease] = useState<any | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.get(`/leases/${leaseId}/`).then(res => setLease(res.data));
  }, [leaseId]);

  if (!lease) return null;

  return (
    <>
      {/* Action Buttons */}
      <div className="mb-2 d-flex gap-2">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowDocs(true)}
        >
          Documents
        </button>

        <button
          className="btn btn-danger btn-sm"
          disabled={lease.status !== "active"}
          onClick={() => setShowTerminate(true)}
        >
          Terminate Lease
        </button>

        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowHistory(true)}
        >
          Rent History
        </button>
      </div>

      {/* Documents Modal */}
      {showDocs && (
        <LeaseDocumentsModal
          leaseId={lease.id}
          leaseLabel={`${lease.unit?.name || ""} – ${lease.renter?.full_name || ""}`}
          onClose={() => setShowDocs(false)}
        />
      )}

      {/* Terminate Lease Modal */}
      {showTerminate && (
        <TerminateLeaseModal
          lease={lease}
          onClose={() => setShowTerminate(false)}
          onSuccess={() => {
            setShowTerminate(false);
            reloadLeases?.();
          }}
        />
      )}

      {/* Rent History Modal */}
      {showHistory && (
        <LeaseRentHistoryModal
          leaseId={lease.id}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Lease Details Modal */}
      <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5>
                Lease #{lease.id}
                <span className={`badge ms-2 bg-${
                  lease.status === "active" ? "success" :
                  lease.status === "terminated" ? "danger" : "secondary"
                }`}>
                  {lease.status}
                </span>
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* BODY */}
            <div className="modal-body">
              {/* SUMMARY */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Renter:</strong> {lease.renter?.full_name || "-"}<br />
                  <strong>Phone:</strong> {lease.renter?.phone_number || "-"}<br />
                  <strong>Status:</strong> {lease.renter?.status || "-"}
                </div>
                <div className="col-md-6">
                  <strong>Unit:</strong> {lease.unit?.name || "-"}<br />
                  <strong>Start:</strong> {lease.start_date || "-"}<br />
                  <strong>End:</strong> {lease.end_date || "-"}
                </div>
              </div>

              {/* FINANCIALS */}
              <div className="card mb-3">
                <div className="card-body">
                  <h6>Financial Summary</h6>
                  <p>Rent Amount: <strong>{lease.rent_amount}</strong></p>
                  <p>Security Deposit: <strong>{lease.security_deposit}</strong></p>
                  <p>
                    Current Balance:{" "}
                    <strong className={lease.current_balance > 0 ? "text-danger" : "text-success"}>
                      {lease.current_balance}
                    </strong>
                  </p>
                </div>
              </div>

              {/* RENT BREAKDOWN */}
              <h6>Rent Breakdown</h6>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(lease.lease_rents || []).map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.rent_type?.name || "-"}</td>
                      <td>{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CHECKLIST */}
              <h6 className="mt-3">Move-in Checklist</h6>
              <ul>
                <li>Electricity Card: {lease.electricity_card_given ? "✅" : "❌"}</li>
                <li>Gas Card: {lease.gas_card_given ? "✅" : "❌"}</li>
                <li>Main Gate Key: {lease.main_gate_key_given ? "✅" : "❌"}</li>
                <li>Pocket Gate Key: {lease.pocket_gate_key_given ? "✅" : "❌"}</li>
                <li>Agreement Paper: {lease.agreement_paper_given ? "✅" : "❌"}</li>
                <li>Police Verification: {lease.police_verification_done ? "✅" : "❌"}</li>
              </ul>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
