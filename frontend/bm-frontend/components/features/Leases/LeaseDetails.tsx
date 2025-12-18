import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import LeaseDocumentsTab from "./tabs/LeaseDocumentsTab";

export default function LeaseDetails({ leaseId }: { leaseId: number }) {
  const [lease, setLease] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/leases/${leaseId}/`)
      .then(r => setLease(r.data))
      .catch(() => setError("Failed to load lease"));
  }, [leaseId]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!lease) return <div>Loading…</div>;

  return (
    <div className="accordion">

      {/* BASIC INFO */}
      <Section title="Lease Overview">
        <Row label="Renter">{lease.renter_name}</Row>
        <Row label="Unit">{lease.unit_name}</Row>
        <Row label="Status">{lease.status}</Row>
        <Row label="Deposit Status">{lease.deposit_status}</Row>
        <Row label="Start Date">{lease.start_date}</Row>
        <Row label="End Date">{lease.end_date || "-"}</Row>
      </Section>

      {/* RENT BREAKDOWN */}
      <Section title="Rent Breakdown">
        <table className="table table-sm">
          <tbody>
            {lease.lease_rents.map((r: any) => (
              <tr key={r.id}>
                <td>{r.rent_type_name}</td>
                <td className="text-end">{r.amount}</td>
              </tr>
            ))}
            <tr className="fw-bold">
              <td>Total</td>
              <td className="text-end">{lease.total_rent}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* CURRENT BALANCE */}
      <Section title="Financial Status">
        <Row label="Current Balance">
          <strong>{lease.current_balance}</strong>
        </Row>
      </Section>

      {/* CHECKLIST */}
      <Section title="Move-in Checklist">
        {Object.entries(lease.checklist).map(([k, v]) => (
          <div key={k}>
            <input type="checkbox" checked={v as boolean} disabled /> {k}
          </div>
        ))}
      </Section>

      {/* DOCUMENTS */}
      <Section title="Documents">
        <LeaseDocumentsTab leaseId={lease.id} readOnly />
      </Section>

    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="card mb-3">
      <div className="card-header fw-bold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function Row({ label, children }: any) {
  return (
    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">{label}</span>
      <span>{children}</span>
    </div>
  );
}
