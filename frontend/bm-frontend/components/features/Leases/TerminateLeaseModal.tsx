import { useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  lease: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TerminateLeaseModal({ lease, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const terminate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post(`/leases/${lease.id}/terminate/`);
      setResult(res.data);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="text-danger">Terminate Lease</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">

            {error && <div className="alert alert-danger">{error}</div>}

            {!result ? (
              <>
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action is irreversible.
                </div>

                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Renter</th>
                      <td>{lease.renter.full_name}</td>
                    </tr>
                    <tr>
                      <th>Unit</th>
                      <td>{lease.unit.name}</td>
                    </tr>
                    <tr>
                      <th>Start Date</th>
                      <td>{lease.start_date}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>
                        <span className="badge bg-success">{lease.status}</span>
                      </td>
                    </tr>
                    <tr>
                      <th>Current Balance</th>
                      <td>
                        <strong>{lease.current_balance}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-muted">
                  On termination:
                  <ul>
                    <li>Unit will become <b>vacant</b></li>
                    <li>Final settlement invoice may be created</li>
                    <li>Security deposit will be adjusted/refunded</li>
                  </ul>
                </p>
              </>
            ) : (
              <>
                <div className="alert alert-success">
                  Lease terminated successfully.
                </div>

                <p><b>Deposit Status:</b> {result.deposit_status || lease.deposit_status}</p>

                {result.created_invoices?.length > 0 && (
                  <>
                    <h6>Created Invoices</h6>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.created_invoices.map((inv: any) => (
                          <tr key={inv.id}>
                            <td>{inv.id}</td>
                            <td>{inv.type}</td>
                            <td>{inv.amount}</td>
                            <td>{inv.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>

            {!result && (
              <button
                className="btn btn-danger"
                disabled={loading}
                onClick={terminate}
              >
                Confirm Termination
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
