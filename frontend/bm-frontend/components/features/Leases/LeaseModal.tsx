import { useEffect, useState } from "react";
import { LeaseService } from "../../../logic/services/leaseService";
import { RentTypeService } from "../../../logic/services/rentTypeService";
import { RenterService } from "../../../logic/services/renterService";
import { UnitService } from "../../../logic/services/unitService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function LeaseModal({ onClose, onSaved }: Props) {
  const [tab, setTab] = useState<"basic" | "rent" | "checklist" | "docs" | "remarks">("basic");

  const [renters, setRenters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [rentTypes, setRentTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaseId, setLeaseId] = useState<number | null>(null);

  const [form, setForm] = useState<any>({
    renter: "",
    unit: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
    security_deposit: "",
    status: "draft",
    deposit_status: "pending",

    electricity_card_given: false,
    gas_card_given: false,
    main_gate_key_given: false,
    pocket_gate_key_given: false,
    agreement_paper_given: false,
    police_verification_done: false,

    remarks: "",
    lease_rents: [],
  });

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    (async () => {
      try {
        const [r, u, rt] = await Promise.all([
          RenterService.list({ status: "active" }),
          UnitService.list({ status: "vacant" }),
          RentTypeService.list(),
        ]);
        setRenters(r.results);
        setUnits(u.results);
        setRentTypes(rt.results);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    })();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const update = (k: string, v: any) =>
    setForm((p: any) => ({ ...p, [k]: v }));

  const addRentRow = () =>
    update("lease_rents", [...form.lease_rents, { rent_type: "", amount: "" }]);

  const updateRent = (i: number, k: string, v: any) => {
    const rows = [...form.lease_rents];
    rows[i][k] = v;
    update("lease_rents", rows);
  };

  const removeRent = (i: number) =>
    update("lease_rents", form.lease_rents.filter((_: any, idx: number) => idx !== i));

  /* ---------------- SAVE ---------------- */

  const saveLease = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await LeaseService.create(form);
      setLeaseId(res.id);
      setTab("docs");
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5>Create Lease</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* TABS */}
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <ul className="nav nav-tabs mb-3">
              {[
                ["basic", "Basic Info"],
                ["rent", "Rent Types"],
                ["checklist", "Checklist"],
                ["docs", "Documents"],
                ["remarks", "Remarks"],
              ].map(([k, l]) => (
                <li key={k} className="nav-item">
                  <button
                    className={`nav-link ${tab === k ? "active" : ""}`}
                    onClick={() => setTab(k as any)}
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>

            {/* BASIC INFO */}
{tab === "basic" && (
  <div className="row g-3">
    <div className="col-md-6">
      <label>Renter</label>
      <select className="form-select" onChange={e => update("renter", e.target.value)}>
        <option value="">Select renter</option>
        {renters.map(r => (
          <option key={r.id} value={r.id}>{r.full_name}</option>
        ))}
      </select>
    </div>

    <div className="col-md-6">
      <label>Unit</label>
      <select className="form-select" onChange={e => update("unit", e.target.value)}>
        <option value="">Select unit</option>
        {units.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>

    <div className="col-md-4">
      <label>Start Date</label>
      <input
        type="date"
        className="form-control"
        value={form.start_date || ""}
        onChange={e => update("start_date", e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Security Deposit</label>
      <input
        type="number"
        className="form-control"
        value={form.security_deposit || ""}
        onChange={e => update("security_deposit", Number(e.target.value))}
      />
    </div>

    <div className="col-md-4">
      <label>Status</label>
      <select className="form-select"
        onChange={e => update("status", e.target.value)}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
      </select>
    </div>
  </div>
)}


            {/* RENT TYPES */}
            {tab === "rent" && (
              <>
                <button className="btn btn-sm btn-outline-primary mb-2" onClick={addRentRow}>
                  + Add Rent Type
                </button>

                {form.lease_rents.map((r: any, i: number) => (
                  <div key={i} className="row g-2 mb-2">
                    <div className="col-md-5">
                      <select className="form-select"
                        onChange={e => updateRent(i, "rent_type", e.target.value)}>
                        <option value="">Rent Type</option>
                        {rentTypes.map(rt => (
                          <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-5">
                      <input type="number" className="form-control"
                        placeholder="Amount"
                        onChange={e => updateRent(i, "amount", e.target.value)} />
                    </div>

                    <div className="col-md-2">
                      <button className="btn btn-danger" onClick={() => removeRent(i)}>✕</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* CHECKLIST */}
            {tab === "checklist" && (
              <div className="row">
                {[
                  ["electricity_card_given", "Electricity Card"],
                  ["gas_card_given", "Gas Card"],
                  ["main_gate_key_given", "Main Gate Key"],
                  ["pocket_gate_key_given", "Pocket Gate Key"],
                  ["agreement_paper_given", "Agreement Paper"],
                  ["police_verification_done", "Police Verification"],
                ].map(([k, l]) => (
                  <div key={k} className="col-md-4 form-check">
                    <input type="checkbox" className="form-check-input"
                      onChange={e => update(k, e.target.checked)} />
                    <label className="form-check-label">{l}</label>
                  </div>
                ))}
              </div>
            )}

            {/* DOCUMENTS */}
            {tab === "docs" && (
              <div className="text-muted">
                {leaseId
                  ? "Upload lease documents here (next step)"
                  : "Save lease first to upload documents"}
              </div>
            )}

            {/* REMARKS */}
            {tab === "remarks" && (
              <textarea className="form-control" rows={4}
                onChange={e => update("remarks", e.target.value)} />
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" disabled={loading} onClick={saveLease}>
              Save Lease
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
