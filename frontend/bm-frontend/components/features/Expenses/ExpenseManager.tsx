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
    <div className="bg-white">
      {/* 1. HEADER & SUMMARY */}
      <div className="p-4 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h5 className="fw-bold text-dark m-0">Expense Tracker</h5>
                <p className="text-muted small m-0">Log maintenance & operational costs.</p>
            </div>
            <div className="text-end">
                <div className="small text-muted text-uppercase fw-bold">Page Total</div>
                <div className="fs-4 fw-bold text-danger">৳{currentTotal.toLocaleString()}</div>
            </div>
        </div>

        {/* 2. FILTERS */}
        <div className="d-flex flex-wrap justify-content-between gap-3">
            <div className="d-flex gap-2 flex-wrap">
                <input
                    type="text"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill"
                    placeholder="Search title..."
                    style={{ width: '200px' }}
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                />

                {/* 🔥 FIX: Changed 'px-3' to 'ps-3 pe-5' to fix arrow overlap */}
                <select
                    className="form-select form-select-sm bg-light border-0 ps-3 pe-5 rounded-pill w-auto"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
                >
                    <option value="">All Categories</option>
                    {ExpenseService.getCategories().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                <input
                    type="month"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill w-auto"
                    value={filters.date_month}
                    onChange={(e) => setFilters({...filters, date_month: e.target.value, page: 1})}
                />

                <input
                    type="number"
                    className="form-control form-control-sm bg-light border-0 px-3 rounded-pill w-auto"
                    placeholder="Lease ID"
                    style={{ width: '100px' }}
                    value={filters.lease}
                    onChange={(e) => setFilters({...filters, lease: e.target.value, page: 1})}
                />
            </div>

            <button
                className="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => setActiveModal({ type: 'create', data: null })}
            >
                <i className="bi bi-plus-lg me-2"></i>Record Expense
            </button>
        </div>
      </div>

      {/* 3. TABLE */}
      <div className="table-responsive">
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
                    {exp.description && (
                        <div className="text-muted x-small mt-1 text-truncate" style={{maxWidth: '250px'}}>
                            {exp.description}
                        </div>
                    )}
                </td>

                <td>
                    {exp.lease ? (
                        <span className="badge bg-secondary-subtle text-secondary border-secondary">
                            <i className="bi bi-person me-1"></i>
                            {exp.renter_name || `Lease #${exp.lease}`}
                        </span>
                    ) : (
                        <span className="text-muted small fst-italic">General</span>
                    )}
                </td>

                <td className="fw-bold text-danger">৳{Number(exp.amount).toLocaleString()}</td>

                <td>
                    {exp.attachment ? (
                        <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-white text-success border-success" title="View Receipt">
                            <i className="bi bi-paperclip"></i>
                        </a>
                    ) : (
                        <span className="text-muted small opacity-50">-</span>
                    )}
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

      {/* 4. PAGINATION */}
      <div className="p-3 border-top d-flex justify-content-between align-items-center">
        <span className="text-muted x-small">Records: {data.count}</span>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={!data.previous} onClick={() => setFilters({...filters, page: filters.page - 1})}>Prev</button>
          <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={!data.next} onClick={() => setFilters({...filters, page: filters.page + 1})}>Next</button>
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