import { useEffect, useState } from "react";
import api from "../../../../logic/services/apiClient";

export default function LeaseHistoryTab({ leaseId }: { leaseId: number }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (leaseId) {
      api.get("/leases/lease-rent-history/", { params: { lease: leaseId } })
        .then(res => setHistory(res.data.results || res.data));
    }
  }, [leaseId]);

  return (
    <div className="animate__animated animate__fadeIn p-2">
      <div className="timeline">
        {history.length === 0 ? (
          <div className="text-center py-5 text-muted small">No historical rent changes recorded.</div>
        ) : history.map((h, i) => (
          <div key={i} className="mb-4 ps-4 border-start border-2 border-primary position-relative">
            <div className="position-absolute translate-middle-x bg-primary rounded-circle"
                 style={{ width: '12px', height: '12px', left: '-1px', top: '0' }}></div>
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold text-dark">Rent Adjustment</div>
                  <div className="text-muted small">{h.effective_date}</div>
                </div>
                <div className="text-end">
                  <div className="fs-5 fw-bold text-success">৳{h.new_rent}</div>
                  <div className="text-muted x-small text-decoration-line-through">Was ৳{h.old_rent}</div>
                </div>
              </div>
              {h.remarks && <div className="mt-2 p-2 bg-light rounded-3 small text-secondary italic">"{h.remarks}"</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}