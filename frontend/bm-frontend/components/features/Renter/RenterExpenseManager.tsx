import { useEffect, useState } from "react";
import { ExpenseService } from "../../../logic/services/expenseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Table, Badge, Card, Row, Col } from "react-bootstrap";

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

      // Calculate total for the summary card
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
    return <Badge bg={colors[category] || 'secondary'} className="text-capitalize px-3 rounded-pill">{category}</Badge>;
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="animate__animated animate__fadeIn">
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase mb-1">Total Extra Expenses</div>
            <div className="h2 fw-bold text-dark mb-0">৳{totalAmount.toLocaleString()}</div>
            <div className="small text-muted mt-1">Based on {expenses.length} records</div>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-white p-4 border-0">
          <h5 className="fw-bold mb-0 text-dark">Additional Charges & Expenses</h5>
        </div>

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
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
              {expenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted">No additional expenses recorded.</td></tr>
              ) : expenses.map(exp => (
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
          </Table>
        </div>
      </Card>
    </div>
  );
}