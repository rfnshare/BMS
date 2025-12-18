export default function LeaseInvoicePreview({ leaseId }: any) {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/invoices/?lease=${leaseId}`)
      .then(r => setInvoices(r.data.results));
  }, [leaseId]);

  return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Paid</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map(inv => (
          <tr key={inv.id}>
            <td>{inv.invoice_type}</td>
            <td>{inv.amount}</td>
            <td>{inv.paid_amount}</td>
            <td>{inv.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
