import { useEffect, useState } from "react";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Tab Imports
import LeaseInfoTab from "./tabs/LeaseInfoTab";
import LeaseRentTab from "./tabs/LeaseRentTab";
import LeaseFinancialTab from "./tabs/LeaseFinancialTab";
import LeaseChecklistTab from "./tabs/LeaseChecklistTab";
import LeaseRemarksTab from "./tabs/LeaseRemarksTab";
import LeaseDocumentsTab from "./tabs/LeaseDocumentsTab";

interface Props {
  lease?: any; // Added: Optional lease object for Edit mode
  onClose: () => void;
  onSaved: () => void;
}

type TabType = "basic" | "rent" | "financial" | "checklist" | "remarks" | "docs";

export default function LeaseModal({ lease, onClose, onSaved }: Props) {
  const [tab, setTab] = useState<TabType>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set leaseId from prop if in edit mode
  const [leaseId, setLeaseId] = useState<number | null>(lease?.id || null);

  const [form, setForm] = useState<any>({
    renter: "",
    unit: "",
    start_date: new Date().toISOString().split('T')[0],
    security_deposit: 0,
    status: "active",
    deposit_status: "pending",
    remarks: "",
    lease_rents: [],
    electricity_card_given: false,
    gas_card_given: false,
    main_gate_key_given: false,
    pocket_gate_key_given: false,
    agreement_paper_given: false,
    police_verification_done: false,
  });

  // 1. Logic for Edit Mode: Populate form when lease prop changes
  useEffect(() => {
    if (lease) {
      setForm({
        ...lease,
        // Ensure ForeignKeys are IDs for the select inputs
        renter: lease.renter?.id || lease.renter,
        unit: lease.unit?.id || lease.unit,
        // Ensure checklist fields are boolean
        electricity_card_given: !!lease.electricity_card_given,
        gas_card_given: !!lease.gas_card_given,
        main_gate_key_given: !!lease.main_gate_key_given,
        pocket_gate_key_given: !!lease.pocket_gate_key_given,
        agreement_paper_given: !!lease.agreement_paper_given,
        police_verification_done: !!lease.police_verification_done,
      });
      setLeaseId(lease.id);
    }
  }, [lease]);

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const updateRent = (i: number, k: string, v: any) => {
    const rows = [...form.lease_rents];
    rows[i] = { ...rows[i], [k]: v };
    update("lease_rents", rows);
  };

  const addRentRow = () => update("lease_rents", [...form.lease_rents, { rent_type: "", amount: "" }]);
  const removeRent = (i: number) => update("lease_rents", form.lease_rents.filter((_: any, idx: number) => idx !== i));

  const totalRent = form.lease_rents.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

  // 2. Submission Logic: Support both POST (Create) and PUT (Update)
  const saveLease = async () => {
    setError(null);
    if (!form.renter || !form.unit) {
      setError("Renter and Unit are required.");
      setTab("basic");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        lease_rents: form.lease_rents.map((r: any) => ({
          // If editing, rent_type might be an object, we need the ID
          rent_type: r.rent_type?.id || Number(r.rent_type),
          amount: Number(r.amount)
        }))
      };

      if (leaseId) {
        // UPDATE MODE
        await LeaseService.update(leaseId, payload);
        onSaved();
        onClose(); // Usually close on edit success
      } else {
        // CREATE MODE
        const res = await LeaseService.create(payload);
        setLeaseId(res.id);
        onSaved();
        setTab("docs"); // Move to docs tab only on new creation
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered shadow-lg">
        <div className="modal-content border-0 rounded-4 overflow-hidden">

          <div className="modal-header bg-dark text-white p-4 border-0">
            <div className="d-flex align-items-center gap-3">
              <div className={`rounded-circle p-2 shadow ${leaseId ? 'bg-warning' : 'bg-primary'}`}>
                <i className={`bi bi-${leaseId ? 'pencil-square' : 'file-earmark-plus'} fs-4 text-white`}></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  {leaseId ? `Edit Lease Profile #${leaseId}` : 'Lease Agreement Setup'}
                </h5>
                <p className="small mb-0 text-white-50">
                  {leaseId ? 'Modify existing agreement terms' : 'Configuration workflow for new tenancies'}
                </p>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="bg-light px-4 py-2 border-bottom">
            <div className="nav nav-pills nav-fill gap-2">
              {[
                { id: "basic", label: "1. Identity", icon: "bi-person" },
                { id: "rent", label: "2. Rent Setup", icon: "bi-cash-stack" },
                { id: "financial", label: "3. Deposit", icon: "bi-shield-check" },
                { id: "checklist", label: "4. Handover", icon: "bi-key" },
                { id: "remarks", label: "5. Remarks", icon: "bi-chat-text" },
                { id: "docs", label: "6. Documents", icon: "bi-file-earmark-pdf" },
              ].map((item) => (
                <button
                  key={item.id}
                  disabled={item.id === "docs" && !leaseId}
                  className={`nav-link rounded-pill border-0 py-2 d-flex align-items-center justify-content-center gap-2 ${tab === item.id ? "active shadow" : "text-muted"}`}
                  onClick={() => setTab(item.id as TabType)}
                >
                  <i className={item.icon}></i>
                  <span className="small fw-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-body p-4 bg-light bg-opacity-50" style={{ minHeight: "460px" }}>
            {error && <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4">{error}</div>}

            {tab === "basic" && <LeaseInfoTab form={form} update={update} />}
            {tab === "rent" && <LeaseRentTab form={form} updateRent={updateRent} addRentRow={addRentRow} removeRent={removeRent} totalRent={totalRent} />}
            {tab === "financial" && <LeaseFinancialTab form={form} update={update} totalRent={totalRent} />}
            {tab === "checklist" && <LeaseChecklistTab form={form} update={update} />}
            {tab === "remarks" && <LeaseRemarksTab form={form} update={update} />}
            {tab === "docs" && <LeaseDocumentsTab leaseId={leaseId} />}
          </div>

          <div className="modal-footer border-0 p-4 bg-white shadow-lg">
            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={onClose}>Discard</button>

            <button
              className={`btn ${leaseId ? 'btn-warning' : 'btn-primary'} rounded-pill px-5 fw-bold shadow-sm`}
              disabled={loading}
              onClick={saveLease}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : leaseId ? (
                "Update Agreement"
              ) : (
                "Save & Continue"
              )}
            </button>

            {leaseId && tab !== "docs" && (
                <button className="btn btn-outline-success rounded-pill px-4 ms-2 fw-bold" onClick={() => setTab("docs")}>
                    Manage Documents <i className="bi bi-arrow-right ms-1"></i>
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}