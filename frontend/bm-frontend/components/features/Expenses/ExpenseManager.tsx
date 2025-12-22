import { useExpenses } from "../../../logic/hooks/useExpenses";
import { ExpenseService } from "../../../logic/services/expenseService";
import { useNotify } from "../../../logic/context/NotificationContext";
import { Spinner, Badge, InputGroup, Form, Row, Col } from "react-bootstrap";
import ExpenseModal from "./ExpenseModal";
import { useState } from "react";

export default function ExpenseManager() {
  const { success, error: notifyError } = useNotify();
  const { data, loading, filters, setFilters, refresh } = useExpenses({
    category: "", search: "", date_month: "", lease: "", page: 1, ordering: "-date"
  });

  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | null, data: any }>({ type: null, data: null });

  const handleDelete = async (id: number) => {
    if (window.confirm("⚠️ Delete this expense record? This cannot be undone.")) {
      try {
        await ExpenseService.destroy(id);
        success("Expense record removed.");
        refresh();
      } catch (err) {
        notifyError("Failed to delete record.");
      }
    }
  };

  const currentTotal = data.results?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0;

  return (
    <div className="animate__animated animate__fadeIn">

      {/* 1. HEADER CARD (Revenue & Billing Control Style) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-danger bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">Expense Tracker</h4>
              <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1">Maintenance & Operational Costs</p>
            </div>
            <div className="text-md-end">
              <div className="x-small text-muted fw-bold text-uppercase">Total for this view</div>
              <h3 className="fw-bold text-danger mb-0">৳{currentTotal.toLocaleString()}</h3>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm py-2"
                onClick={() => setActiveModal({ type: 'create', data: null })}
              >
                <i className="bi bi-plus-lg me-2"></i>Record Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER SECTION */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
        <Row className="g-2">
          <Col xs={12} md={3}>
            <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden border-0">
              <InputGroup.Text className="bg-light border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
              <Form.Control
                className="bg-light border-0"
                placeholder="Search..."
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              />
            </InputGroup>
          </Col>
          <Col xs={6} md={2}>
            <Form.Select
              size="sm" className="bg-light border-0 rounded-pill ps-3"
              onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
            >
              <option value="">All Categories</option>
              {ExpenseService.getCategories().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Form.Select>
          </Col>
          <Col xs={6} md={2}>
            <Form.Control
                type="month" size="sm" className="bg-light border-0 rounded-pill px-3"
                onChange={(e) => setFilters({...filters, date_month: e.target.value, page: 1})}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Control
                type="number" size="sm" className="bg-light border-0 rounded-pill px-3"
                placeholder="Lease ID"
                onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})}
            />
          </Col>
        </Row>
      </div>

      {/* 3. DESKTOP TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white d-none d-md-block">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase">
              <th className="ps-4 py-3">Date</th>
              <th>Details</th>
              <th>Related Lease</th>
              <th>Amount</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="danger" size="sm" /></td></tr>
            ) : data.results.map((exp: any) => (
              <tr key={exp.id}>
                <td className="ps-4 small fw-bold">{exp.date}</td>
                <td>
                  <div className="fw-bold small">{exp.title}</div>
                  <Badge bg="light" className="text-muted border fw-normal text-capitalize x-small">{exp.category}</Badge>
                </td>
                <td>
                    {exp.lease ? (
                        <Badge bg="secondary-subtle" className="text-secondary border-secondary fw-normal">
                            LS-{exp.lease}
                        </Badge>
                    ) : <span className="text-muted x-small italic">General</span>}
                </td>
                <td className="fw-bold text-danger">৳{Number(exp.amount).toLocaleString()}</td>
                <td className="text-end pe-4">
                  <div className="btn-group shadow-sm border rounded-3 overflow-hidden bg-white">
                    {exp.attachment && (
                        <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-white border-end"><i className="bi bi-paperclip text-success"></i></a>
                    )}
                    <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'edit', data: exp})}><i className="bi bi-pencil-square text-warning"></i></button>
                    <button className="btn btn-sm btn-white" onClick={() => handleDelete(exp.id)}><i className="bi bi-trash text-danger"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. MOBILE CARDS */}
      <div className="d-block d-md-none">
        {data.results.map((exp: any) => (
          <div key={exp.id} className="p-3 bg-white border-bottom mb-2 rounded-4 shadow-sm border mx-2">
            <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold text-dark">{exp.title}</span>
                <span className="fw-bold text-danger">৳{Number(exp.amount).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <Badge bg="light" className="text-muted border fw-normal x-small">{exp.category.toUpperCase()}</Badge>
                <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                    <button className="btn btn-white btn-sm px-3" onClick={() => setActiveModal({type: 'edit', data: exp})}><i className="bi bi-pencil-square text-warning"></i></button>
                    <button className="btn btn-white btn-sm px-3 text-danger" onClick={() => handleDelete(exp.id)}><i className="bi bi-trash"></i></button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. MODAL */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <ExpenseModal
            expense={activeModal.data}
            onClose={() => setActiveModal({type: null, data: null})}
            onSuccess={() => {
                success(activeModal.type === 'edit' ? "Expense updated." : "Expense recorded.");
                setActiveModal({type: null, data: null});
                refresh();
            }}
        />
      )}
    </div>
  );
}