import { useEffect, useState, useMemo } from "react";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Added Notifications
import { Spinner, Table, Badge, Row, Col, Button } from "react-bootstrap";

export default function RenterExpenseManager() {
  const { error: notifyError } = useNotify();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. EXPENDITURE KPI STATS (Blueprint Logic)
  const stats = useMemo(() => {
    return {
      total: expenses.reduce((acc, curr) => acc + Number(curr.amount), 0),
      count: expenses.length,
      maintenance: expenses.filter(e => e.category === 'maintenance').length,
      repairs: expenses.filter(e => e.category === 'repair').length
    };
  }, [expenses]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await ExpenseService.list();
      setExpenses(data.results || []);
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, []);

  const getCategoryBadge = (category: string) => {
    const colors: any = {
        maintenance: 'bg-info-subtle text-info border-info',
        utility: 'bg-primary-subtle text-primary border-primary',
        repair: 'bg-warning-subtle text-warning border-warning',
        other: 'bg-light text-muted border-light'
    };
    return (
      <Badge pill className={`px-3 py-2 fw-bold ls-1 text-uppercase border ${colors[category] || colors.other}`} style={{ fontSize: '0.6rem' }}>
        {category}
      </Badge>
    );
  };

  if (loading) return (
    <div className="text-center py-5 vstack gap-3 animate__animated animate__fadeIn">
      <Spinner animation="grow" variant="danger" size="sm" />
      <p className="text-muted fw-bold x-small text-uppercase ls-1">Analyzing Ledger Entries...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">

      {/* 2. INDUSTRIAL HEADER BLOCK */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-4 border-danger bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger border border-danger border-opacity-10 d-none d-md-block">
                <i className="bi bi-wallet2 fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark text-uppercase ls-1">Extra Expenditures</h4>
                <p className="text-muted x-small mb-0 text-uppercase fw-bold ls-1 opacity-75">
                    Non-Rent Charges & Supplementary Service Logs
                </p>
              </div>
            </div>
            <div className="d-flex gap-2 w-100 w-md-auto ms-md-auto">
                <Button variant="light" className="rounded-pill px-4 fw-bold small border ls-1 text-muted shadow-sm flex-grow-1" onClick={loadExpenses}>
                    <i className="bi bi-arrow-clockwise me-2"></i>REFRESH
                </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESIDENT EXPENSE KPIs */}
      <Row className="g-2 g-md-3 mb-4">
        {[
          { label: "Total Outflow", val: `৳${stats.total.toLocaleString()}`, color: "danger", icon: "bi-cash-stack" },
          { label: "Entry Count", val: stats.count, color: "primary", icon: "bi-hash" },
          { label: "Maintenance", val: stats.maintenance, color: "info", icon: "bi-tools" },
          { label: "Repairs Log", val: stats.repairs, color: "warning", icon: "bi-gear-wide" },
        ].map((s, i) => (
          <Col key={i} xs={6} md={3}>
            <div className={`card border-0 shadow-sm rounded-4 p-2 p-md-3 border-start border-4 border-${s.color} bg-white h-100`}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <small className="text-muted fw-bold text-uppercase ls-1" style={{ fontSize: '0.6rem' }}>{s.label}</small>
                <div className={`text-${s.color} opacity-25 d-none d-md-block`}><i className={`bi ${s.icon}`}></i></div>
              </div>
              <div className={`h4 fw-bold mb-0 text-${s.color === 'danger' ? 'danger' : 'dark'} fs-5 fs-md-4 font-monospace`}>
                {typeof s.val === 'string' ? s.val : s.val.toString().padStart(2, '0')}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 4. DATA VIEW: INDUSTRIAL TABLE (Desktop) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3 d-none d-md-block">
        <Table hover className="align-middle mb-0">
          <thead className="bg-light border-bottom">
            <tr className="text-muted x-small fw-bold text-uppercase ls-1">
              <th className="ps-4 py-3">Expense Identification</th>
              <th className="text-center">Category</th>
              <th>Transaction Date</th>
              <th>Debit Amount</th>
              <th className="pe-4 text-end">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-5 text-muted x-small fw-bold ls-1">NO ADDITIONAL EXPENDITURES RECORDED.</td></tr>
            ) : expenses.map(exp => (
              <tr key={exp.id}>
                <td className="ps-4 py-3">
                  <div className="fw-bold text-dark small">{exp.title}</div>
                  <div className="text-muted x-small fw-medium opacity-75">{exp.description || 'No detailed breakdown provided.'}</div>
                </td>
                <td className="text-center">{getCategoryBadge(exp.category)}</td>
                <td className="small text-muted fw-bold ls-1 font-monospace">
                  {new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td><div className="fw-bold text-danger font-monospace">৳{Number(exp.amount).toLocaleString()}</div></td>
                <td className="pe-4 text-end">
                  {exp.attachment && (
                    <Button
                        variant="white"
                        size="sm"
                        className="rounded-pill border shadow-sm px-3 fw-bold x-small ls-1"
                        onClick={() => window.open(exp.attachment, '_blank')}
                    >
                      <i className="bi bi-file-earmark-pdf me-1 text-danger"></i> RECEIPT
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* 5. MOBILE VIEW: EXPENSE FEED */}
      <div className="d-block d-md-none vstack gap-2 p-2">
        {expenses.map(exp => (
          <div key={exp.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-start mb-2">
                {getCategoryBadge(exp.category)}
                <div className="fw-bold text-danger font-monospace">৳{Number(exp.amount).toLocaleString()}</div>
            </div>

            <div className="fw-bold text-dark mb-1 small">{exp.title}</div>
            <div className="text-muted x-small mb-3">{exp.description}</div>

            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-light">
                <div className="x-small text-muted fw-bold ls-1 font-monospace">
                   <i className="bi bi-calendar-event me-1"></i>
                   {new Date(exp.date).toLocaleDateString()}
                </div>
                {exp.attachment && (
                    <Button variant="light" size="sm" className="rounded-pill border py-0 px-3 x-small fw-bold ls-1" onClick={() => window.open(exp.attachment, '_blank')}>
                        VIEW RECEIPT
                    </Button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}