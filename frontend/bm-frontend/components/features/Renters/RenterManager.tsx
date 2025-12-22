import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Spinner, Badge } from "react-bootstrap";
import Link from "next/link";

// Logic & Context
import { Renter, RenterService } from "../../../logic/services/renterService";
import { useNotify } from "../../../logic/context/NotificationContext";

// Feature Modals
import RenterModal from "./RenterModal";
import RenterDocumentsModal from "./RenterDocumentsModal";

export default function RenterManager() {
  const router = useRouter();
  const { error, success } = useNotify();

  // State Management
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRenter, setEditingRenter] = useState<Renter | null>(null);
  const [docRenter, setDocRenter] = useState<Renter | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await RenterService.list({ page });
      setRenters(res.results || res);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      error("Failed to load renter directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(currentPage); }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-success-subtle text-success border-success-subtle",
      prospective: "bg-warning-subtle text-warning border-warning-subtle",
      former: "bg-secondary-subtle text-secondary border-secondary-subtle",
    };
    return map[status] || "bg-light text-dark border";
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* --- 1. HEADER SECTION (Design Match: UnitManager) --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="bg-white p-3 rounded-4 shadow-sm border-start border-4 border-primary flex-grow-1">
          <h4 className="fw-bold mb-1 text-dark">Renter Directory</h4>
          <p className="text-muted x-small mb-0">Manage resident profiles and documentation.</p>
        </div>
        <button className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold d-flex align-items-center gap-2" onClick={() => { setEditingRenter(null); setShowModal(true); }}>
          <i className="bi bi-plus-lg"></i> Add Renter
        </button>
      </div>

      {loading && renters.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* --- 2. MOBILE LIST VIEW (Individual Cards) --- */}
          <div className="d-block d-md-none">
            {renters.map((r) => (
              <div key={r.id} className="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden bg-white">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <Link href={`/admin-dashboard/renters/${r.id}`}>
                          {r.profile_pic ? (
                            <img src={r.profile_pic} className="rounded-circle border border-2 border-white shadow-sm" style={{ width: "45px", height: "45px", objectFit: "cover" }} />
                          ) : (
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold border" style={{ width: "45px", height: "45px", fontSize: "0.8rem" }}>
                              {r.full_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </Link>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold text-dark mb-0">{r.full_name}</h6>
                      <small className="text-muted x-small">UID: #{r.id}</small>
                    </div>
                    <Badge pill className={`x-small border px-2 py-1 ${getStatusBadge(r.status)}`}>
                      {r.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Action Group in Mobile (Matching UnitManager Style) */}
                  <div className="d-flex justify-content-center bg-light rounded-3 p-1">
                    <div className="btn-group w-100 bg-white shadow-sm border rounded-pill overflow-hidden">
                      <button className="btn btn-white py-2 border-end" onClick={() => router.push(`/admin-dashboard/renters/${r.id}`)}><i className="bi bi-eye text-primary"></i></button>
                      <button className="btn btn-white py-2 border-end" onClick={() => setDocRenter(r)}><i className="bi bi-folder2-open text-info"></i></button>
                      <button className="btn btn-white py-2 border-end" onClick={() => { setEditingRenter(r); setShowModal(true); }}><i className="bi bi-pencil-square text-warning"></i></button>
                      <button className="btn btn-white py-2 text-danger" onClick={async () => { if(confirm("Delete record?")) { await RenterService.destroy(r.id); success("Renter deleted."); load(currentPage); }}}><i className="bi bi-trash3"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- 3. DESKTOP TABLE VIEW (Matching UnitManager Layout) --- */}
          <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light border-bottom">
                  <tr className="text-muted small text-uppercase fw-bold">
                    <th className="ps-4 py-3">Resident</th>
                    <th>Contact Info</th>
                    <th className="text-center">Status</th>
                    <th>Phone</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renters.map((r) => (
                    <tr key={r.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                            <Link href={`/admin-dashboard/renters/${r.id}`}>
                          {r.profile_pic ? (
                            <img src={r.profile_pic} className="rounded-circle border border-2 border-white shadow-sm" style={{ width: "45px", height: "45px", objectFit: "cover" }} />
                          ) : (
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold border" style={{ width: "45px", height: "45px", fontSize: "0.8rem" }}>
                              {r.full_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </Link>
                          <div className="fw-bold text-dark">{r.full_name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="small fw-semibold">{r.email}</div>
                        <small className="text-muted x-small">UID: {r.id}</small>
                      </td>
                      <td className="text-center">
                        <span className={`badge border px-3 py-2 rounded-pill ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="fw-bold small">{r.phone_number}</td>

                      {/* Desktop Action Group (Exact copy of UnitManager logic) */}
                      <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                          <button className="btn btn-sm btn-white border-end" onClick={() => router.push(`/admin-dashboard/renters/${r.id}`)} title="View Details">
                            <i className="bi bi-eye text-primary"></i>
                          </button>
                          <button className="btn btn-sm btn-white border-end" onClick={() => setDocRenter(r)} title="Documents">
                            <i className="bi bi-folder2-open text-info"></i>
                          </button>
                          <button className="btn btn-sm btn-white border-end" onClick={() => { setEditingRenter(r); setShowModal(true); }} title="Edit Profile">
                            <i className="bi bi-pencil-square text-warning"></i>
                          </button>
                          <button className="btn btn-sm btn-white" title="Delete Record" onClick={async () => { if(confirm("Delete record?")) { await RenterService.destroy(r.id); success("Renter deleted."); load(currentPage); }}}>
                            <i className="bi bi-trash3 text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* --- 4. PAGINATION (Clean Pill Design) --- */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border mt-3">
          <div className="small text-muted">Page <b>{currentPage}</b> of <b>{totalPages}</b></div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && <RenterModal renter={editingRenter} onClose={() => setShowModal(false)} onSaved={() => load(currentPage)} />}
      {docRenter && <RenterDocumentsModal renter={docRenter} onClose={() => setDocRenter(null)} />}
    </div>
  );
}