import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Spinner, Badge, Button, Row, Col, InputGroup, Form } from "react-bootstrap";
import Link from "next/link";

// Logic & Context
import { Renter, RenterService } from "../../../logic/services/renterService";
import { useNotify } from "../../../logic/context/NotificationContext";

// Feature Modals
import RenterModal from "./RenterModal";
import RenterDocumentsModal from "./RenterDocumentsModal";

export default function RenterManager() {
  const router = useRouter();
  const { error: notifyError, success } = useNotify();

  // 1. Core State
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | 'docs' | null, data: any }>({ type: null, data: null });

  // 2. Pagination & Search
  const [filters, setFilters] = useState({ page: 1, search: "" });
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });

  const load = async () => {
    setLoading(true);
    try {
      // Standardized API call with parameters
      const res = await RenterService.list({ page: filters.page, search: filters.search });
      setRenters(res.results || res);
      setPagination({
          totalPages: res.total_pages || 1,
          totalCount: res.count || (res.results ? res.results.length : res.length)
      });
    } catch (err) {
      notifyError("Sync Error: Failed to retrieve resident directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  // 3. KPI Stats (Derived from current view or global count)
  const stats = useMemo(() => {
      return {
          total: pagination.totalCount,
          active: renters.filter(r => r.status === 'active').length,
          prospective: renters.filter(r => r.status === 'prospective').length
      };
  }, [renters, pagination.totalCount]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-success-subtle text-success border-success",
      prospective: "bg-warning-subtle text-warning border-warning",
      former: "bg-secondary-subtle text-secondary border-secondary",
    };
    return map[status?.toLowerCase()] || "bg-light text-muted border";
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* --- 1. INDUSTRIAL HEADER (Blueprint Match) --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Resident Directory</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Tenant Profiles & Legal Identity</p>
            </div>
            <Button
                className="rounded-pill px-4 fw-bold shadow-sm py-2 btn-sm"
                onClick={() => setActiveModal({ type: 'create', data: null })}
            >
              <i className="bi bi-plus-lg me-2"></i>REGISTER RESIDENT
            </Button>
          </div>
        </div>
      </div>

      {/* --- 2. KPI OVERVIEW --- */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Total Residents", val: stats.total, color: "primary", icon: "bi-people" },
          { label: "Active Tenants", val: stats.active, color: "success", icon: "bi-person-check" },
          { label: "Prospective", val: stats.prospective, color: "warning", icon: "bi-person-plus" },
        ].map((item, i) => (
          <Col key={i} xs={4} md={4}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${item.color} bg-white h-100`}>
                <small className="text-muted fw-bold text-uppercase ls-1 d-none d-md-block" style={{ fontSize: '0.6rem' }}>{item.label}</small>
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className={`fw-bold mb-0 text-${item.color} fs-4 fs-md-2`}>{item.val.toString().padStart(2, '0')}</h3>
                    <i className={`bi ${item.icon} d-none d-md-block opacity-25 fs-4`}></i>
                </div>
                <small className="text-muted fw-bold text-uppercase ls-1 d-md-none" style={{ fontSize: '0.5rem' }}>{item.label}</small>
            </div>
          </Col>
        ))}
      </Row>

      {/* --- 3. FILTER PILL BAR --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-2 bg-white border">
        <Row className="g-2 align-items-center">
            <Col xs={12} md={8}>
                <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                    <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                    <Form.Control
                        className="bg-light border-0 py-2 shadow-none fw-medium"
                        placeholder="Search by name, email, or UID..."
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
                    />
                </InputGroup>
            </Col>
            <Col xs={12} md={4}>
                <div className="text-muted x-small fw-bold ls-1 text-uppercase text-md-end pe-3">
                    Syncing {renters.length} results
                </div>
            </Col>
        </Row>
      </div>

      {loading && renters.length === 0 ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></div>
      ) : (
        <>
          {/* --- 4. MOBILE CARD VIEW --- */}
          <div className="d-block d-md-none vstack gap-2 mb-4">
            {renters.map((r) => (
              <div key={r.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                        {r.profile_pic ? (
                            <img src={r.profile_pic} className="rounded-circle border border-2 border-white shadow-sm" style={{ width: "35px", height: "35px", objectFit: "cover" }} />
                        ) : (
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold border small" style={{ width: "35px", height: "35px" }}>
                                {r.full_name.substring(0, 1)}
                            </div>
                        )}
                        <div className="fw-bold text-dark small">{r.full_name}</div>
                    </div>
                    <Badge pill className={`x-small border px-2 py-1 ${getStatusBadge(r.status)}`}>{r.status?.toUpperCase()}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-end mt-2">
                    <div className="x-small text-muted fw-bold ls-1">
                        <div><i className="bi bi-telephone me-1"></i>{r.phone_number}</div>
                        <div className="mt-1 opacity-50">UID: #{r.id}</div>
                    </div>
                    <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                        <button className="btn btn-sm btn-white px-2 border-end" onClick={() => router.push(`/admin-dashboard/renters/${r.id}`)}><i className="bi bi-speedometer2 text-primary"></i></button>
                        <button className="btn btn-sm btn-white px-2" onClick={() => setActiveModal({type: 'edit', data: r})}><i className="bi bi-pencil-square text-warning"></i></button>
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- 5. DESKTOP TABLE VIEW --- */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block mb-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                  <th className="ps-4 py-3">Resident Identity</th>
                  <th>Legal Contact</th>
                  <th className="text-center">Status</th>
                  <th>Primary Phone</th>
                  <th className="pe-4 text-end">Management</th>
                </tr>
              </thead>
              <tbody>
                {renters.map((r) => (
                  <tr key={r.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <Link href={`/admin-dashboard/renters/${r.id}`}>
                          {r.profile_pic ? (
                            <img src={r.profile_pic} className="rounded-circle border border-2 border-white shadow-sm" style={{ width: "42px", height: "42px", objectFit: "cover" }} />
                          ) : (
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold border" style={{ width: "42px", height: "42px", fontSize: "0.8rem" }}>
                              {r.full_name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <div>
                            <div className="fw-bold text-dark small">{r.full_name}</div>
                            <div className="text-muted x-small fw-bold ls-1">UID: {r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold text-primary">{r.email || 'No email registered'}</div>
                    </td>
                    <td className="text-center">
                        <Badge pill className={`border px-3 py-2 x-small ${getStatusBadge(r.status)}`}>
                          {r.status?.toUpperCase()}
                        </Badge>
                    </td>
                    <td className="fw-bold small text-dark font-monospace">{r.phone_number}</td>
                    <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                          <button className="btn btn-sm btn-white px-3 border-end" onClick={() => router.push(`/admin-dashboard/renters/${r.id}`)} title="Dashboard"><i className="bi bi-speedometer2 text-primary"></i></button>
                          <button className="btn btn-sm btn-white px-3 border-end" onClick={() => setActiveModal({type: 'docs', data: r})} title="Vault"><i className="bi bi-shield-lock text-info"></i></button>
                          <button className="btn btn-sm btn-white px-3 border-end" onClick={() => setActiveModal({type: 'edit', data: r})} title="Edit Profile"><i className="bi bi-pencil-square text-warning"></i></button>
                          <button className="btn btn-sm btn-white px-3 text-danger" onClick={async () => { if(confirm("Permanent purge this resident record?")) { await RenterService.destroy(r.id); success("Record purged."); load(); }}} title="Purge"><i className="bi bi-trash3"></i></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- 6. PAGINATION --- */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border mb-5">
          <div className="small text-muted fw-bold ls-1 text-uppercase" style={{fontSize: '0.6rem'}}>Page {filters.page} of {pagination.totalPages}</div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold ls-1" disabled={filters.page === 1} onClick={() => setFilters({...filters, page: filters.page - 1})}>PREV</button>
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-bold ls-1" disabled={filters.page === pagination.totalPages} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</button>
          </div>
        </div>
      )}

      {/* Modals Integration */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <RenterModal renter={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} onSaved={load} />
      )}
      {activeModal.type === 'docs' && (
        <RenterDocumentsModal renter={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} />
      )}
    </div>
  );
}