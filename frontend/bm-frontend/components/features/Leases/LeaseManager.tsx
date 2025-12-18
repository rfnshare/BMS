import { useEffect, useState } from "react";
import { LeaseService } from "../../../logic/services/leaseService";
import { RenterService } from "../../../logic/services/renterService";
import { UnitService } from "../../../logic/services/unitService";
import LeaseModal from "./LeaseModal";
import LeaseDetailsModal from "./LeaseDetailsModal";
import TerminateLeaseModal from "./TerminateLeaseModal";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

export default function LeaseManager() {
  const [leases, setLeases] = useState<any[]>([]);
  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [viewLease, setViewLease] = useState<any | null>(null);
  const [terminateLease, setTerminateLease] = useState<any | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    renter: "",
    unit: "",
    search: "",
  });

  /* ---------------- LOAD DATA ---------------- */

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [leaseRes, renterRes, unitRes] = await Promise.all([
        LeaseService.list(filters),
        RenterService.list({ status: "active" }),
        UnitService.list({ status: "occupied" }),
      ]);

      setLeases(leaseRes.results);
      setRenters(renterRes.results);
      setUnits(unitRes.results);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- TERMINATE ---------------- */

  const onTerminateSuccess = () => {
    setTerminateLease(null);
    loadData();
  };

  /* ---------------- UI ---------------- */

  return (
  <>
    <button
      className="btn btn-outline-secondary btn-sm"
      onClick={() => setShowRentTypes(true)}
    >
      Rent Types
    </button>

    <div className="bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Leases</h4>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Add Lease
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* FILTERS */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search renter / unit"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="terminated">Terminated</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.renter}
            onChange={(e) => setFilters({ ...filters, renter: e.target.value })}
          >
            <option value="">All Renters</option>
            {renters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.unit}
            onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
          >
            <option value="">All Units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Renter</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Start</th>
              <th width="220">Actions</th>
            </tr>
          </thead>
          <tbody>
  {(leases || []).map((l) => (
    <tr key={l.id}>
      <td>{l.renter?.full_name}</td>
      <td>{l.unit?.name}</td>
      <td>
        <span
          className={`badge bg-${
            l.status === "active"
              ? "success"
              : l.status === "terminated"
              ? "danger"
              : "secondary"
          }`}
        >
          {l.status}
        </span>
      </td>
      <td>{l.deposit_status}</td>
      <td>{l.start_date}</td>
      <td>
        <button
          className="btn btn-sm btn-outline-primary me-2"
          onClick={() => setViewLease(l)}
        >
          View
        </button>
        {l.status === "active" && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => setTerminateLease(l)}
          >
            Terminate
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* MODALS */}
      {showCreate && <LeaseModal onClose={() => setShowCreate(false)} onSaved={loadData} />}
      {viewLease && <LeaseDetailsModal lease={viewLease} onClose={() => setViewLease(null)} />}
      {terminateLease && (
        <TerminateLeaseModal
          lease={terminateLease}
          onClose={() => setTerminateLease(null)}
          onSuccess={onTerminateSuccess}
        />
      )}
    </div>
  </>
);

}