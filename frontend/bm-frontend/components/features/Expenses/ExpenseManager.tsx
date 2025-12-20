import { useEffect, useState } from "react";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import ExpenseModal from "./ExpenseModal";
import { Spinner } from "react-bootstrap";

export default function ExpenseManager() {
  const [data, setData] = useState<any>({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);

  // Filters matching your Backend ExpenseFilter
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    date_month: "", // Matches backend: filter_by_month
    lease: "",      // Matches backend field: lease
    page: 1,
    ordering: "-date"
  });

  const [activeModal, setActiveModal] = useState<{ type: 'edit' | 'create' | null, data: any }>({ type: null, data: null });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await ExpenseService.list(filters);
      setData(res);
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.page, filters.search, filters.date_month, filters.lease]);

  const handleDelete = async (id: number) => {
    if (confirm("⚠️ Are you sure you want to delete this expense record?")) {
      try {
        await ExpenseService.destroy(id);
        loadExpenses();
      } catch (err: any) {
        alert(getErrorMessage(err));
      }
    }
  };

  const currentTotal = data.results?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0;

  return (
    <div className="bg-white rounded-4 shadow-sm overflow-hidden">
      {/* 1. HEADER & SUMMARY */}
      <div className="p-3 p-md-4 border-bottom bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div className="d-flex justify-content-between align-items-center w-100 w-md-auto">
                <div>
                    <h5 className="fw-bold text-dark m-0">Expense Tracker</h5>
                    <p className="text-muted small m-0 d-none d-md-block">Log maintenance & operational costs.</p>
                </div>
                {/* Total shown prominently on mobile header */}
                <div className="text-end d-md-none">
                    <div className="x-small text-muted text-uppercase fw-bold">Total</div>
                    <div className="h5 fw-bold text-danger mb-0">৳{currentTotal.toLocaleString()}</div>
                </div>
            </div>

            <div className="text-end d-none d-md-block">
                <div className="small text-muted text-uppercase fw-bold">Page Total</div>
                <div className="fs-4 fw-bold text-danger">৳{currentTotal.toLocaleString()}</div>
            </div>
        </div>

        {/* 2. RESPONSIVE FILTERS */}
        <div className="row g-2">
            <div className="col-12 col-md-3">
                <input
                    type="text"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                />
            </div>
            <div className="col-6 col-md-2">
                <select
                    className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
                >
                    <option value="">All Categories</option>
                    {ExpenseService.getCategories().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
            <div className="col-6 col-md-2">
                <input
                    type="month"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                    value={filters.date_month}
                    onChange={(e) => setFilters({...filters, date_month: e.target.value, page: 1})}
                />
            </div>
            <div className="col-12 col-md-5 d-flex gap-2">
                <input
                    type="number"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill w-50"
                    placeholder="Lease ID"
                    value={filters.lease}
                    onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})}
                />
                <button
                    className="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm w-50"
                    onClick={() => setActiveModal({ type: 'create', data: null })}
                >
                    <i className="bi bi-plus-lg me-1"></i>Record
                </button>
            </div>
        </div>
      </div>

      {/* 3. MOBILE LIST VIEW (Cards) */}
      <div className="d-block d-md-none">
        {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
        ) : (
            data.results.map((exp: any) => (
                <div key={exp.id} className="p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <div className="fw-bold text-dark">{exp.title}</div>
                            <span className="badge bg-light text-muted border fw-normal text-capitalize x-small">
                                {exp.category}
                            </span>
                        </div>
                        <div className="text-end">
                            <div className="fw-bold text-danger">৳{Number(exp.amount).toLocaleString()}</div>
                            <div className="x-small text-muted">{exp.date}</div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="x-small">
                            {exp.lease ? (
                                <span className="text-secondary">
                                    <i className="bi bi-link-45deg me-1"></i>{exp.renter_name || `Lease #${exp.lease}`}
                                </span>
                            ) : <span className="text-muted italic">General</span>}
                        </div>
                        <div className="btn-group shadow-sm">
                            {exp.attachment && (
                                <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border py-1 px-2">
                                    <i className="bi bi-paperclip text-success"></i>
                                </a>
                            )}
                            <button className="btn btn-sm btn-light border py-1 px-2" onClick={() => setActiveModal({type: 'edit', data: exp})}>
                                <i className="bi bi-pencil text-warning"></i>
                            </button>
                            <button className="btn btn-sm btn-light border py-1 px-2" onClick={() => handleDelete(exp.id)}>
                                <i className="bi bi-trash text-danger"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* 4. DESKTOP TABLE VIEW */}
      <div className="d-none d-md-block table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr className="text-muted x-small fw-bold text-uppercase">
              <th className="ps-4 py-3">Date</th>
              <th>Details</th>
              <th>Related Lease</th>
              <th>Amount</th>
              <th>File</th>
              <th className="pe-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" variant="danger" /></td></tr>
            ) : data.results.map((exp: any) => (
              <tr key={exp.id}>
                <td className="ps-4 text-dark fw-bold small">{exp.date}</td>
                <td>
                    <div className="fw-bold text-dark">{exp.title}</div>
                    <span className="badge bg-light text-muted border fw-normal text-capitalize mt-1">
                        {exp.category}
                    </span>
                </td>
                <td>
                    {exp.lease ? (
                        <span className="badge bg-secondary-subtle text-secondary border-secondary">
                            <i className="bi bi-person me-1"></i>
                            {exp.renter_name || `Lease #${exp.lease}`}
                        </span>
                    ) : <span className="text-muted small fst-italic">General</span>}
                </td>
                <td className="fw-bold text-danger">৳{Number(exp.amount).toLocaleString()}</td>
                <td>
                    {exp.attachment ? (
                        <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-white text-success border-success">
                            <i className="bi bi-paperclip"></i>
                        </a>
                    ) : <span className="text-muted small opacity-50">-</span>}
                </td>
                <td className="pe-4 text-end">
                    <div className="btn-group shadow-sm rounded-3">
                        <button className="btn btn-sm btn-white border-end" onClick={() => setActiveModal({type: 'edit', data: exp})}>
                            <i className="bi bi-pencil text-warning"></i>
                        </button>
                        <button className="btn btn-sm btn-white text-danger" onClick={() => handleDelete(exp.id)}>
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. RESPONSIVE PAGINATION */}
      <div className="p-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <span className="text-muted x-small">Records: {data.count}</span>
        <div className="d-flex gap-2 w-100 w-md-auto">
          <button className="btn btn-sm btn-light border rounded-pill px-4 flex-grow-1" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</button>
          <button className="btn btn-sm btn-light border rounded-pill px-4 flex-grow-1" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
        </div>
      </div>

      {/* MODAL */}
      {(activeModal.type === 'create' || activeModal.type === 'edit') && (
        <ExpenseModal
            expense={activeModal.data}
            onClose={() => setActiveModal({type: null, data: null})}
            onSuccess={() => { setActiveModal({type: null, data: null}); loadExpenses(); }}
        />
      )}
    </div>
  );
}