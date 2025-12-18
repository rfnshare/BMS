import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  leaseId: number;
  onClose: () => void;
}

export default function LeaseRentHistoryModal({ leaseId, onClose }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/leases/lease-rent-history/", {
        params: { lease: leaseId },
      });
      setHistory(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5>Rent Change History</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <p className="text-muted">Loading history…</p>
            ) : history.length === 0 ? (
              <div className="alert alert-info">
                No rent changes recorded for this lease.
              </div>
            ) : (
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Effective Date</th>
                    <th>Old Rent</th>
                    <th>New Rent</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td>{h.effective_date}</td>
                      <td>{h.old_rent}</td>
                      <td>
                        <span className="fw-bold text-success">
                          {h.new_rent}
                        </span>
                      </td>
                      <td>{h.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

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
  );
}
