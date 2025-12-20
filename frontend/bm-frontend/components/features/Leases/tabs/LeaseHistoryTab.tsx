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
    <div className="animate__animated animate__fadeIn">
      {history.length === 0 ? (
        <div className="text-center py-5 text-muted small border rounded-4 bg-light">
          No rent changes recorded.
        </div>
      ) : (
        <div className="timeline ps-2">
          {history.map((h, i) => (
            <div key={i} className="mb-3 ps-3 border-start border-2 border-primary position-relative">
              <div className="position-absolute translate-middle-x bg-primary rounded-circle"
                   style={{ width: '10px', height: '10px', left: '-1px', top: '5px' }}></div>
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold text-dark small">Rent Adjustment</div>
                    <div className="text-muted x-small">{new Date(h.effective_date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-success">৳{h.new_rent}</div>
                    <div className="text-muted x-small text-decoration-line-through">Was ৳{h.old_rent}</div>
                  </div>
                </div>
                {h.remarks && <div className="mt-2 p-2 bg-light rounded-3 x-small text-secondary italic">"{h.remarks}"</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}