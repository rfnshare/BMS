import { useEffect, useState } from "react";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Badge, Card, Row, Col } from "react-bootstrap";

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

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. SUMMARY KPI */}
      <Row className="mb-4 g-3 px-1">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-primary">
            <div className="text-muted x-small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Total Extra Expenses</div>
            <div className="h2 fw-bold text-dark mb-0">৳{totalAmount.toLocaleString()}</div>
            <div className="x-small text-muted mt-1">Based on {expenses.length} records</div>
          </Card>
        </Col>
      </Row>

      {/* 2. MAIN CONTENT AREA */}
      <div className="px-1">
        {expenses.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <i className="bi bi-wallet2 fs-1 text-muted opacity-25 mb-3"></i>
            <div className="text-muted">No additional expenses recorded yet.</div>
          </Card>
        ) : (
          <>
            {/* MOBILE VIEW: List Cards */}
            <div className="d-md-none vstack gap-2">
              {expenses.map(exp => (
                <Card key={exp.id} className="border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <div className="min-vw-0">
                      <div className="fw-bold text-dark small text-truncate">{exp.title}</div>
                      <div className="text-muted x-small text-truncate mt-1">{exp.description}</div>
                    </div>
                    <div className="flex-shrink-0">{getCategoryBadge(exp.category)}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end pt-2 border-top mt-1">
                    <div>
                      <div className="text-muted x-small fw-bold">{new Date(exp.date).toLocaleDateString()}</div>
                      <div className="fw-bold text-dark">৳{Number(exp.amount).toLocaleString()}</div>
                    </div>
                    {exp.attachment && (
                      <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border rounded-pill px-3 x-small fw-bold text-primary">
                        <i className="bi bi-paperclip me-1"></i> Receipt
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* DESKTOP VIEW: Table */}
            <div className="d-none d-md-block card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-header bg-white p-4 border-0">
                <h5 className="fw-bold mb-0 text-dark">Additional Charges & Expenses</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light small text-muted text-uppercase">
                    <tr>
                      <th className="ps-4">Title / Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th className="pe-4 text-end">Action</th>
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
                        <td className="pe-4 text-end">
                          {exp.attachment && (
                            <a href={exp.attachment} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border rounded-circle">
                              <i className="bi bi-file-earmark-arrow-down text-primary"></i>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}