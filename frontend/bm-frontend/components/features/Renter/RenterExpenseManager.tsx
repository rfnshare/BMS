import { useEffect, useState } from "react";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Card, Container } from "react-bootstrap";

export default function RenterExpenseManager() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await ExpenseService.list();
      const results = data.results || [];
      setExpenses(results);
      const total = results.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      setTotalAmount(total);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, []);

  const getCategoryBadge = (category: string) => {
    const colors: any = { maintenance: 'info', utility: 'primary', repair: 'warning', other: 'secondary' };
    return (
      <Badge bg={colors[category] || 'secondary'} className="text-capitalize px-3 rounded-pill x-small border-0">
        {category}
      </Badge>
    );
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted small">Loading Ledger...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn pb-5">
      {/* 1. SUMMARY KPI CARD */}
      <Container className="px-2" style={{ maxWidth: '800px' }}>
        <Card className="border-0 shadow-sm rounded-4 p-3 mb-4 bg-white border-start border-4 border-primary">
          <div className="text-muted x-small fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
            Total Extra Expenses
          </div>
          <div className="h2 fw-bold text-dark mb-0">৳{totalAmount.toLocaleString()}</div>
          <div className="x-small text-muted mt-1">Based on {expenses.length} records</div>
        </Card>
      </Container>

      {/* 2. MAIN LISTING AREA */}
      <Container className="px-2" style={{ maxWidth: '800px' }}>
        {expenses.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm mx-1">
            <i className="bi bi-receipt-cutoff fs-1 text-muted opacity-25"></i>
            <p className="text-muted small mt-2">No additional expenses recorded.</p>
          </div>
        ) : (
          <div className="vstack gap-3">
            {/* MOBILE VIEW: Ticket-style Cards */}
            <div className="d-md-none vstack gap-2">
              {expenses.map(exp => (
                <div key={exp.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <div className="min-vw-0 flex-grow-1">
                      {/* 🚀 FIX: Forced wrapping for long technical descriptions */}
                      <div className="fw-bold text-dark small" style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
                        {exp.title}
                      </div>
                      <div className="text-muted x-small mt-1 text-truncate">{exp.description}</div>
                    </div>
                    <div className="flex-shrink-0">{getCategoryBadge(exp.category)}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end pt-2 border-top mt-2">
                    <div>
                      <div className="text-muted x-small fw-bold">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(exp.date).toLocaleDateString()}
                      </div>
                      <div className="fw-bold text-primary fs-5">৳{Number(exp.amount).toLocaleString()}</div>
                    </div>
                    {exp.attachment && (
                      <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border rounded-pill px-3 x-small fw-bold">
                        <i className="bi bi-paperclip"></i> View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Legacy Table */}
            <div className="d-none d-md-block card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-4">Expense Details</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark">{exp.title}</div>
                          <div className="small text-muted">{exp.description}</div>
                        </td>
                        <td>{getCategoryBadge(exp.category)}</td>
                        <td className="small">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="fw-bold text-dark">৳{Number(exp.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}