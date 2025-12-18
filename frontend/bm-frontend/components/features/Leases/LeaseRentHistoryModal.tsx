import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  leaseId: number;
  onClose: () => void;
}

export default function LeaseRentHistoryModal({ leaseId, onClose }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/leases/lease-rent-history/", {
          params: { lease: leaseId },
        });
        // Sort by date descending
        const data = res.data.results || res.data;
        setHistory(data.sort((a: any, b: any) =>
          new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
        ));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [leaseId]);

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

          <div className="modal-header bg-primary text-white p-4 border-0">
            <h5 className="modal-title fw-bold">Rent Audit Trail</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light bg-opacity-50" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : history.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-clock-history display-1 text-muted opacity-25"></i>
                <p className="text-muted mt-3">No rent changes have been recorded for this lease.</p>
              </div>
            ) : (
              <div className="timeline">
                {history.map((h, i) => {
                  const isIncrease = Number(h.new_rent) > Number(h.old_rent);
                  return (
                    <div key={h.id} className="card border-0 shadow-sm rounded-4 mb-3">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <div className={`rounded-circle p-2 bg-${isIncrease ? 'success' : 'danger'} bg-opacity-10 text-${isIncrease ? 'success' : 'danger'}`}>
                              <i className={`bi bi-arrow-${isIncrease ? 'up' : 'down'}-right fs-5`}></i>
                            </div>
                            <div>
                              <div className="fw-bold fs-5">৳{Number(h.new_rent).toLocaleString()}</div>
                              <div className="text-muted small">Effective: {h.effective_date}</div>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-light text-dark border fw-normal mb-1">Previous: ৳{Number(h.old_rent).toLocaleString()}</span>
                            <div className="small text-muted">Changed on {new Date(h.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {h.remarks && (
                          <div className="mt-2 p-2 bg-light rounded-3 small italic text-secondary">
                             <i className="bi bi-chat-quote me-2"></i>"{h.remarks}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer border-0 p-3 bg-white">
            <button className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close History</button>
          </div>
        </div>
      </div>
    </div>
  );
}