import { useEffect, useState } from "react";
import { Renter, RenterService } from "../../../logic/services/renterService";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import RenterModal from "./RenterModal";
import RenterDocumentsModal from "./RenterDocumentsModal";
import Link from "next/link";
import { Spinner } from "react-bootstrap";

// --- LOCAL HELPER: Summary Card ---
function SummaryCard({ title, value, subtitle, icon, color, loading }: any) {
  return (
    <div className="col-md-4">
      <div className={`card border-0 shadow-sm rounded-4 border-start border-4 border-${color} h-100 bg-white`}>
        <div className="card-body p-3 d-flex align-items-center gap-3">
          <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle p-3`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
          <div>
            <div className="text-muted x-small fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>{title}</div>
            <div className="fs-4 fw-bold text-dark">
              {loading ? <Spinner animation="border" size="sm" /> : value.toString().padStart(2, '0')}
            </div>
            <div className="x-small text-muted" style={{fontSize: '0.7rem'}}>{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RenterManager() {
  const [renters, setRenters] = useState<Renter[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Renter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [docRenter, setDocRenter] = useState<Renter | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      // 🚀 EXACT Logic and Endpoints from your working code
      const [listRes, statsRes] = await Promise.all([
        RenterService.list({ page }),
        api.get("/renters/")
      ]);

      setRenters(listRes.results || listRes);
      setTotalPages(listRes.total_pages || 1);

      const allRenters = statsRes.data.results || statsRes.data || [];
      setStats({
        total: allRenters.length,
        verified: allRenters.filter((r: any) => r.nid && r.nid !== "").length,
        pending: allRenters.filter((r: any) => !r.nid || r.nid === "").length
      });
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(currentPage); }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const map: any = {
      active: "bg-success-subtle text-success border-success",
      prospective: "bg-warning-subtle text-warning border-warning",
      former: "bg-secondary-subtle text-secondary border-secondary",
    };
    return map[status] || "bg-light text-dark border";
  };

  return (
    <div className="p-3 p-md-4">
      {/* 1. HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Renter Directory</h2>
          <p className="text-muted small mb-0">Manage profiles and identity verification.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-white border rounded-pill px-4 shadow-sm fw-bold small" onClick={() => loadData(currentPage)}>
            <i className="bi bi-arrow-clockwise me-2"></i>Refresh
          </button>
          <button className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>Add Renter
          </button>
        </div>
      </div>

      {/* 2. STATS */}
      <div className="row g-3 mb-4">
        <SummaryCard title="Total Residents" value={stats.total} subtitle="Active Records" icon="bi-people" color="primary" loading={loading} />
        <SummaryCard title="Verified" value={stats.verified} subtitle="NID Scanned" icon="bi-patch-check" color="success" loading={loading} />
        <SummaryCard title="Legal" value={stats.pending} subtitle="Docs Pending" icon="bi-file-earmark-person" color="warning" loading={loading} />
      </div>

      {/* 3. TABLE/LIST SECTION */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-lines-fill text-primary fs-5"></i>
            <h5 className="fw-bold mb-0">Identity Management</h5>
          </div>
        </div>

        <div className="card-body p-0">
          {/* MOBILE LIST */}
          <div className="d-md-none p-3">
            {loading ? <div className="text-center py-4"><Spinner animation="border" /></div> :
              renters.map(r => (
                <div key={r.id} className="card border shadow-sm rounded-4 mb-3 p-3">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <Link href={`/admin-dashboard/renters/${r.id}`}>
                      {r.profile_pic ? <img src={r.profile_pic} className="rounded-circle border" style={{ width: "50px", height: "50px", objectFit: "cover" }} /> :
                      <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: "50px", height: "50px" }}>{r.full_name.substring(0,2).toUpperCase()}</div>}
                    </Link>
                    <div className="flex-grow-1">
                      <Link href={`/admin-dashboard/renters/${r.id}`} className="fw-bold text-dark text-decoration-none d-block">{r.full_name}</Link>
                      <span className={`badge border x-small rounded-pill mt-1 ${getStatusBadge(r.status)}`}>{r.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="bg-light rounded-3 p-2 mb-3 small">
                    <div><i className="bi bi-telephone me-2"></i>{r.phone_number}</div>
                    <div className="text-muted text-truncate"><i className="bi bi-envelope me-2"></i>{r.email}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-light border rounded-pill flex-grow-1 btn-sm fw-bold" onClick={() => setDocRenter(r)}>📂 Docs</button>
                    <button className="btn btn-light border rounded-pill flex-grow-1 btn-sm fw-bold" onClick={() => { setEditing(r); setShowModal(true); }}>✏️ Edit</button>
                    <button className="btn btn-outline-danger border rounded-pill btn-sm" onClick={async () => { if(confirm("Delete?")) { await RenterService.destroy(r.id); loadData(currentPage); } }}>🗑️</button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* DESKTOP TABLE */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr className="text-muted small text-uppercase fw-bold">
                    <th className="ps-4 py-3" style={{ width: "80px" }}>Identity</th>
                    <th>Full Name</th>
                    <th>Contact Info</th>
                    <th className="text-center">Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" /></td></tr> :
                    renters.map(r => (
                      <tr key={r.id}>
                        <td className="ps-4">
                          <Link href={`/admin-dashboard/renters/${r.id}`}>
                            {r.profile_pic ? <img src={r.profile_pic} className="rounded-circle border" style={{ width: "40px", height: "40px", objectFit: "cover" }} /> :
                            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: "40px", height: "40px", fontSize: '0.75rem' }}>{r.full_name.substring(0,2).toUpperCase()}</div>}
                          </Link>
                        </td>
                        <td>
                          <Link href={`/admin-dashboard/renters/${r.id}`} className="fw-bold text-dark text-decoration-none">{r.full_name}</Link>
                          <div className="text-muted x-small">UID: {r.id}</div>
                        </td>
                        <td><div className="small fw-semibold">{r.phone_number}</div><div className="x-small text-muted">{r.email}</div></td>
                        <td className="text-center"><span className={`badge border px-3 py-2 rounded-pill text-capitalize ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                        <td className="pe-4 text-end">
                          <div className="btn-group shadow-sm bg-white rounded-3">
                            <button className="btn btn-sm btn-white border" onClick={() => setDocRenter(r)}>📂</button>
                            <button className="btn btn-sm btn-white border" onClick={() => { setEditing(r); setShowModal(true); }}>✏️</button>
                            <button className="btn btn-sm btn-outline-danger border" onClick={async () => { if(confirm("Delete?")) { await RenterService.destroy(r.id); loadData(currentPage); } }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border">
          <div className="small text-muted">Page <b>{currentPage}</b> of <b>{totalPages}</b></div>
          <nav><ul className="pagination pagination-sm mb-0 gap-1">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link border-0 rounded-pill px-3 shadow-sm" onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link border-0 rounded-pill px-3 shadow-sm" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </li>
          </ul></nav>
        </div>
      )}

      {showModal && <RenterModal renter={editing} onClose={() => { setEditing(null); setShowModal(false); }} onSaved={() => loadData(currentPage)} />}
      {docRenter && <RenterDocumentsModal renter={docRenter} onClose={() => setDocRenter(null)} />}
    </div>
  );
}