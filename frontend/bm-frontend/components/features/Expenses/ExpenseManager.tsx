import { useExpenses } from "../../../logic/hooks/useExpenses";
import { ExpenseService } from "../../../logic/services/expenseService";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, InputGroup, Form, Row, Col, Button } from "react-bootstrap";
import ExpenseModal from "./ExpenseModal";
import { useState, useMemo } from "react";

export default function ExpenseManager() {
  const { success, error: notifyError } = useNotify();
  const { data, loading, filters, setFilters, refresh } = useExpenses({
    category: "", search: "", date_month: "", lease: "", page: 1, ordering: "-date"
  });

  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | null, data: any }>({ type: null, data: null });

  // 1. DYNAMIC EXPENDITURE STATS (Blueprint KPI Logic)
  const stats = useMemo(() => {
    const results = data.results || [];
    return {
      totalAmount: results.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0),
      count: data.count || 0,
      maintenanceCount: results.filter((e: any) => e.category === 'maintenance').length,
      utilityCount: results.filter((e: any) => e.category === 'utility').length,
    };
  }, [data]);

  const handleDelete = async (id: number) => {
    if (window.confirm("⚠️ Audit Protocol: Delete this expense record? This action is permanent.")) {
      try {
        await ExpenseService.destroy(id);
        success("Ledger updated: Expense record purged.");
        refresh();
      } catch (err) {
        notifyError("Action Denied: Could not remove record.");
      }
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 2. INDUSTRIAL HEADER (Right-Aligned Actions) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-danger bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">

            {/* Identity Block */}
            <div className="d-flex align-items-center gap-3">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger border border-danger border-opacity-10 d-none d-md-block">
                <i className="bi bi-wallet2 fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Operational Costs</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">Expenditure Tracking & Maintenance Ledger</p>
              </div>
            </div>

            {/* Action Stack */}
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
              <Button
                variant="danger"
                className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0"
                onClick={() => setActiveModal({ type: 'create', data: null })}
              >
                <i className="bi bi-plus-lg"></i>
                <span>RECORD EXPENSE</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXPENDITURE KPI OVERVIEW */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Total Outflow", val: `৳${stats.totalAmount.toLocaleString()}`, color: "danger", icon: "bi-graph-down-arrow" },
          { label: "Entry Count", val: stats.count, color: "primary", icon: "bi-hash" },
          { label: "Maintenance", val: stats.maintenanceCount, color: "warning", icon: "bi-tools" },
          { label: "Utilities", val: stats.utilityCount, color: "info", icon: "bi-lightning-charge" },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-${s.color} fs-5 fs-md-4`}>
                {typeof s.val === 'number' ? s.val.toString().padStart(2, '0') : s.val}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. FILTER PILL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white border">
        <Row className="g-2">
          <Col xs={12} md={4}>
            <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
              <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
              <Form.Control
                className="bg-light border-0 py-2 shadow-none fw-medium"
                placeholder="Search expense titles..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              />
            </InputGroup>
          </Col>
          <Col xs={6} md={2}>
            <Form.Select
              size="sm" className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold text-muted shadow-none"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
            >
              <option value="">All Categories</option>
              {ExpenseService.getCategories().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Form.Select>
          </Col>
          <Col xs={6} md={3}>
            <Form.Control
                type="month" size="sm" className="rounded-pill bg-light border-0 py-2 px-3 small fw-bold text-muted"
                value={filters.date_month}
                onChange={(e) => setFilters({...filters, date_month: e.target.value, page: 1})}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Control
                type="number" size="sm" className="rounded-pill bg-light border-0 py-2 px-3 small fw-bold text-muted"
                placeholder="Filter by Lease ID"
                value={filters.lease}
                onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})}
            />
          </Col>
        </Row>
      </div>

      {/* 5. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
              <th className="ps-4 py-3">Expense Date</th>
              <th>Identification</th>
              <th>Allocation</th>
              <th>Debit Amount</th>
              <th className="text-end pe-4">Management</th>
            </tr>
          </thead>
          <tbody>
            {loading && data.results?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="danger" size="sm" /></td></tr>
            ) : data.results?.map((exp: any) => (
              <tr key={exp.id}>
                <td className="ps-4">
                  <div className="fw-bold text-dark small">{exp.date}</div>
                  <div className="text-muted x-small fw-bold ls-1">ID: #{exp.id}</div>
                </td>
                <td>
                  <div className="fw-bold small text-dark">{exp.title}</div>
                  <Badge bg="light" className="text-muted border fw-bold text-uppercase x-small" style={{fontSize: '0.6rem'}}>{exp.category}</Badge>
                </td>
                <td>
                    {exp.lease ? (
                        <Badge pill bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 fw-bold x-small ls-1">
                            LEASE: #{exp.lease}
                        </Badge>
                    ) : <span className="text-muted x-small fw-bold ls-1 text-uppercase opacity-50">General Asset</span>}
                </td>
                <td><div className="fw-bold text-danger font-monospace">৳{Number(exp.amount).toLocaleString()}</div></td>
                <td className="text-end pe-4">
                  <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                    {exp.attachment && (
                        <Button variant="white" className="btn-sm border-end px-3" onClick={() => window.open(exp.attachment, '_blank')} title="View Receipt">
                          <i className="bi bi-paperclip text-success"></i>
                        </Button>
                    )}
                    <Button variant="white" className="btn-sm border-end px-3" onClick={() => setActiveModal({type: 'edit', data: exp})} title="Edit Entry">
                      <i className="bi bi-pencil-square text-warning"></i>
                    </Button>
                    <Button variant="white" className="btn-sm px-3 text-danger" onClick={() => handleDelete(exp.id)} title="Delete Record">
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. MOBILE ACTION CARDS */}
      <div className="d-block d-md-none vstack gap-2 p-2">
        {data.results?.map((exp: any) => (
          <div key={exp.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="fw-bold text-dark mb-1">{exp.title}</div>
                  <Badge bg="light" className="text-muted border fw-bold x-small ls-1">{exp.category.toUpperCase()}</Badge>
                </div>
                <div className="fw-bold text-danger font-monospace">৳{Number(exp.amount).toLocaleString()}</div>
            </div>
            <div className="d-flex justify-content-between align-items-end mt-3">
                <div className="x-small text-muted fw-bold ls-1 text-uppercase">
                    <div><i className="bi bi-calendar-event me-1"></i>{exp.date}</div>
                    {exp.lease && <div className="text-primary">LEASE: #{exp.lease}</div>}
                </div>
                <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                    {exp.attachment && (
                      <Button variant="white" className="btn-sm border-end px-3" onClick={() => window.open(exp.attachment, '_blank')}><i className="bi bi-paperclip text-success"></i></Button>
                    )}
                    <Button variant="white" className="btn-sm border-end px-3" onClick={() => setActiveModal({type: 'edit', data: exp})}><i className="bi bi-pencil-square text-warning"></i></Button>
                    <Button variant="white" className="btn-sm px-3 text-danger" onClick={() => handleDelete(exp.id)}><i className="bi bi-trash"></i></Button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* 7. ADAPTIVE PAGINATION */}
      <div className="p-3 bg-white rounded-4 shadow-sm border d-flex justify-content-between align-items-center mt-3 mb-5">
        <span className="text-muted x-small fw-bold ls-1 text-uppercase" style={{fontSize: '0.6rem'}}>Audit Total: {data.count} entries</span>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>PREV</Button>
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-4 fw-bold ls-1" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>NEXT</Button>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <ExpenseModal
            expense={activeModal.data}
            onClose={() => setActiveModal({type: null, data: null})}
            onSuccess={() => {
                setActiveModal({type: null, data: null});
                refresh();
            }}
        />
      )}
    </div>
  );
}