import { useEffect, useState } from "react";
import { Renter, RenterService } from "../../../logic/services/renterService";
import RenterModal from "./RenterModal";
import RenterDocumentsModal from "./RenterDocumentsModal";
import Link from "next/link";

export default function RenterManager() {
  const [renters, setRenters] = useState<Renter[]>([]);
  const [editing, setEditing] = useState<Renter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [docRenter, setDocRenter] = useState<Renter | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (page: number = 1) => {
    setLoading(true);
    try {
      // 🔥 Passing page as a param to the service
      const res = await RenterService.list({ page });
      setRenters(res.results || res);

      // 🔥 Extracting metadata from your API response
      setTotalCount(res.count || 0);
      setTotalPages(res.total_pages || 1);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Reload data when current page changes
  useEffect(() => { load(currentPage); }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const map: any = {
      active: "bg-success-subtle text-success border-success",
      prospective: "bg-warning-subtle text-warning border-warning",
      former: "bg-secondary-subtle text-secondary border-secondary",
    };
    return map[status] || "bg-light text-dark border";
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Renters Directory</h4>
          <p className="text-muted small mb-0">Manage all registered tenants and their profiles.</p>
        </div>
        <button className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold" onClick={() => setShowModal(true)}>
          + Add New Renter
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
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
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : renters.map(r => (
                <tr key={r.id} className="transition-all">
                  <td className="ps-4">
                    <Link href={`/admin-dashboard/renters/${r.id}`}>
                      {r.profile_pic ? (
                        <img src={r.profile_pic} alt="" className="rounded-circle border" style={{ width: "45px", height: "45px", objectFit: "cover" }} />
                      ) : (
                        <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: "45px", height: "45px", fontSize: "0.8rem" }}>
                          {r.full_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/admin-dashboard/renters/${r.id}`} className="fw-bold text-dark text-decoration-none d-block">
                      {r.full_name}
                    </Link>
                    <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>UID: {r.id}</small>
                  </td>
                  <td>
                    <div className="fw-semibold">{r.phone_number}</div>
                    <div className="text-muted small">{r.email}</div>
                  </td>
                  <td className="text-center">
                    <span className={`badge border px-3 py-2 rounded-pill text-capitalize ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm bg-white rounded-3">
                      <button className="btn btn-sm btn-white border" onClick={() => setDocRenter(r)} title="Documents">📂</button>
                      <button className="btn btn-sm btn-white border" onClick={() => { setEditing(r); setShowModal(true); }} title="Edit">✏️</button>
                      <button className="btn btn-sm btn-outline-danger border" onClick={async () => { if(confirm("Delete Renter?")) { await RenterService.destroy(r.id); load(currentPage); } }} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 NEW: PAGINATION UI */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border">
          <div className="small text-muted">
            Showing page <b>{currentPage}</b> of <b>{totalPages}</b> (Total <b>{totalCount}</b> renters)
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(prev => prev - 1)}>
                   Prev
                </button>
              </li>

              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(prev => prev + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {showModal && <RenterModal renter={editing} onClose={() => { setEditing(null); setShowModal(false); }} onSaved={() => load(currentPage)} />}
      {docRenter && <RenterDocumentsModal renter={docRenter} onClose={() => setDocRenter(null)} />}
    </div>
  );

}