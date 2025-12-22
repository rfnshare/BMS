import { useState } from "react";
import { useUnits } from "../../../logic/hooks/useUnits";
import { Spinner, Badge, Button, Row, Col, InputGroup, Form } from "react-bootstrap";

// Modals & Sub-Features
import UnitModal from "./UnitModal";
import UnitDocumentsModal from "./UnitDocumentsModal";
import UnitDetailsModal from "./UnitDetailsModal";
import FloorManager from "./FloorManager";

export default function UnitManager() {
  const { units, floors, loading, stats, filters, setFilters, pagination, actions } = useUnits();
  const [activeTab, setActiveTab] = useState<'units' | 'floors'>('units');
  const [activeModal, setActiveModal] = useState<{
    type: 'edit' | 'create' | 'view' | 'docs' | null,
    data: any
  }>({ type: null, data: null });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      vacant: "bg-success-subtle text-success border-success",
      occupied: "bg-danger-subtle text-danger border-danger",
      maintenance: "bg-warning-subtle text-warning border-warning",
    };
    return map[status?.toLowerCase()] || "bg-light text-muted border";
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. INDUSTRIAL HEADER */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-primary bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Property Infrastructure</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Control & Asset Inventory</p>
            </div>

            <div className="bg-light p-1 rounded-pill d-inline-flex border shadow-sm w-100 w-md-auto">
              <button
                onClick={() => setActiveTab('units')}
                className={`btn btn-sm rounded-pill px-4 fw-bold flex-grow-1 transition-all ${activeTab === 'units' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
              >
                UNITS
              </button>
              <button
                onClick={() => setActiveTab('floors')}
                className={`btn btn-sm rounded-pill px-4 fw-bold flex-grow-1 transition-all ${activeTab === 'floors' ? 'btn-primary shadow-sm' : 'btn-light border-0 text-muted'}`}
              >
                FLOORS
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'units' ? (
        <>
          {/* 2. ASSET KPI CARDS */}
          <Row className="g-2 g-md-3 mb-4">
            {[
              { label: "Total Assets", val: pagination.totalCount, color: "primary", icon: "bi-building" },
              { label: "Vacant", val: stats.vacant, color: "success", icon: "bi-door-open" },
              { label: "Occupied", val: stats.occupied, color: "danger", icon: "bi-people" },
            ].map((s, i) => (
              <Col key={i} xs={4} md={4}>
                <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
                  <small className="text-muted fw-bold text-uppercase ls-1 d-none d-md-block" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className={`fw-bold mb-0 text-${s.color} fs-4 fs-md-2`}>{s.val.toString().padStart(2, '0')}</h3>
                    <i className={`bi ${s.icon} d-none d-md-block opacity-25`}></i>
                  </div>
                  <small className="text-muted fw-bold text-uppercase ls-1 d-md-none" style={{ fontSize: '0.5rem' }}>{s.label}</small>
                </div>
              </Col>
            ))}
          </Row>

          {/* 3. FILTER PILL BAR */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
            <Row className="g-2">
              <Col xs={12} md={5}>
                <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
                  <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                  <Form.Control
                    className="bg-light border-0 py-2 shadow-none fw-medium"
                    placeholder="Search units..."
                    value={filters.search}
                    onChange={e => setFilters({...filters, search: e.target.value, page: 1})}
                  />
                </InputGroup>
              </Col>
              <Col xs={6} md={3}>
                <Form.Select
                  size="sm" className="bg-light border-0 rounded-pill ps-3 fw-bold text-muted py-2 shadow-none"
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value as any, page: 1})}
                >
                  <option value="">Status: All</option>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                </Form.Select>
              </Col>
              <Col xs={6} md={4}>
                <Button
                  variant="primary"
                  className="w-100 rounded-pill fw-bold shadow-sm py-2 btn-sm"
                  onClick={() => setActiveModal({type: 'create', data: null})}
                >
                  <i className="bi bi-plus-lg me-1"></i> ADD UNIT
                </Button>
              </Col>
            </Row>
          </div>

          {loading && units.length === 0 ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <>
              {/* 4. DESKTOP VIEW (TABLE) */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block mb-3">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light border-bottom">
                    <tr className="text-muted x-small fw-bold text-uppercase ls-1">
                      <th className="ps-4 py-3">Unit Identity</th>
                      <th>Level</th>
                      <th className="text-center">Availability</th>
                      <th className="pe-4 text-end">Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u: any) => (
                      <tr key={u.id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{u.name}</div>
                          <div className="text-muted x-small fw-bold ls-1 text-uppercase">Rent: ৳{Number(u.monthly_rent || 0).toLocaleString()}</div>
                        </td>
                        <td>
                            <Badge bg="light" className="text-dark border fw-bold px-3 py-2 rounded-pill">
                                {floors.find((f: any) => f.id === u.floor)?.name || `Level ${u.floor}`}
                            </Badge>
                        </td>
                        <td className="text-center">
                          <Badge pill className={`border px-3 py-2 x-small ${getStatusBadge(u.status)}`}>
                            {u.status?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="pe-4 text-end">
                            <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                              <button className="btn btn-sm btn-white px-3 border-end" onClick={() => setActiveModal({type: 'view', data: u})}><i className="bi bi-speedometer2 text-primary"></i></button>
                              <button className="btn btn-sm btn-white px-3 border-end" onClick={() => setActiveModal({type: 'docs', data: u})}><i className="bi bi-folder2-open text-info"></i></button>
                              <button className="btn btn-sm btn-white px-3 border-end" onClick={() => setActiveModal({type: 'edit', data: u})}><i className="bi bi-pencil-square text-warning"></i></button>
                              <button className="btn btn-sm btn-white px-3 text-danger" onClick={() => actions.deleteUnit(u.id)}><i className="bi bi-trash3"></i></button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5. MOBILE VIEW (CARDS) - ✅ FIXED VISIBILITY */}
              <div className="d-block d-md-none vstack gap-2 mb-4">
                {units.map((u: any) => (
                  <div key={u.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="fw-bold text-dark">{u.name}</div>
                      <Badge pill className={`x-small border px-2 py-1 ${getStatusBadge(u.status)}`}>
                        {u.status?.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="d-flex justify-content-between align-items-end mt-2">
                      <div className="x-small text-muted fw-bold ls-1 text-uppercase">
                        <div className="mb-1">Level: {floors.find((f: any) => f.id === u.floor)?.name || u.floor}</div>
                        <div className="text-primary">৳{Number(u.monthly_rent || 0).toLocaleString()} / month</div>
                      </div>

                      <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                        <button className="btn btn-sm btn-white px-2 border-end" onClick={() => setActiveModal({type: 'view', data: u})}><i className="bi bi-speedometer2 text-primary"></i></button>
                          <button className="btn btn-sm btn-white px-3 border-end" onClick={() => setActiveModal({type: 'docs', data: u})}><i className="bi bi-folder2-open text-info"></i></button>
                        <button className="btn btn-sm btn-white px-2 border-end" onClick={() => setActiveModal({type: 'edit', data: u})}><i className="bi bi-pencil-square text-warning"></i></button>
                        <button className="btn btn-sm btn-white px-2 text-danger" onClick={() => actions.deleteUnit(u.id)}><i className="bi bi-trash3"></i></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 6. PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm border mb-5">
                <div className="small text-muted fw-bold ls-1 text-uppercase" style={{fontSize: '0.6rem'}}>
                  Pg {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" disabled={pagination.currentPage === 1} onClick={() => setFilters({...filters, page: filters.page - 1})}>PREV</button>
                    <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" disabled={pagination.currentPage === pagination.totalPages} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</button>
                </div>
            </div>
          )}
        </>
      ) : (
        <FloorManager />
      )}

      {/* MODALS */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <UnitModal floors={floors} unit={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} onSaved={actions.refresh} />
      )}
      {activeModal.type === 'view' && <UnitDetailsModal unit={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} />}
      {activeModal.type === 'view' && <UnitDetailsModal unit={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} />}
      {activeModal.type === 'docs' && <UnitDocumentsModal unit={activeModal.data} onClose={() => setActiveModal({type: null, data: null})} />}
    </div>
  );
}