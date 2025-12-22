import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify

// Tab Imports
import LeaseInfoTab from "./tabs/LeaseInfoTab";
import LeaseRentTab from "./tabs/LeaseRentTab";
import LeaseFinancialTab from "./tabs/LeaseFinancialTab";
import LeaseChecklistTab from "./tabs/LeaseChecklistTab";
import LeaseRemarksTab from "./tabs/LeaseRemarksTab";
import LeaseDocumentsTab from "./tabs/LeaseDocumentsTab";

export default function LeaseModal({ lease, onClose, onSuccess }: any) {
  const { success, error: notifyError } = useNotify(); // ✅ Use Professional Notifications

  const [tab, setTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [leaseId, setLeaseId] = useState<number | null>(lease?.id || null);

  const [form, setForm] = useState<any>({
    renter: "", unit: "",
    start_date: new Date().toISOString().split('T')[0],
    security_deposit: 0, status: "active",
    lease_rents: [],
    electricity_card_given: false, gas_card_given: false,
    main_gate_key_given: false, agreement_paper_given: false,
  });

  useEffect(() => {
    if (lease) {
      setForm({ ...lease,
        renter: lease.renter?.id || lease.renter,
        unit: lease.unit?.id || lease.unit
      });
      setLeaseId(lease.id);
    }
  }, [lease]);

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const totalRent = form.lease_rents.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

  // 1. Logic: Save Lease
  const saveLease = async () => {
    if (!form.renter || !form.unit) {
        notifyError("Tenant and Unit are required.");
        return;
    }

    setLoading(true);
    try {
      const payload = { ...form,
        lease_rents: form.lease_rents.map((r: any) => ({
          rent_type: r.rent_type?.id || Number(r.rent_type),
          amount: Number(r.amount)
        }))
      };

      if (leaseId) {
        await LeaseService.update(leaseId, payload);
        success("Lease agreement updated successfully."); // ✅ Context Success
        onSuccess(); // Triggers refresh in Manager
      } else {
        const res = await LeaseService.create(payload);
        setLeaseId(res.id);
        success("Lease created! Now upload required documents."); // ✅ Step-based feedback
        onSuccess(); // Refresh list in background
        setTab("docs"); // Move to final step
      }
    } catch (err) {
        notifyError(getErrorMessage(err));
    } finally {
        setLoading(false);
    }
  };

  // 2. Logic: Handle Discard
  const handleDiscard = () => {
    // We notify "Discarded" only if it's a new unsaved form or if user changed something
    onClose();
  };

  const steps = [
    { id: "basic", label: "Identity", icon: "bi-person" },
    { id: "rent", label: "Billing", icon: "bi-cash-stack" },
    { id: "financial", label: "Deposit", icon: "bi-shield-check" },
    { id: "checklist", label: "Handover", icon: "bi-key" },
    { id: "remarks", label: "Notes", icon: "bi-chat-text" },
    { id: "docs", label: "Files", icon: "bi-file-earmark-pdf" },
  ];

  return (
    <Modal
      show onHide={onClose} size="xl"
      centered
      fullscreen="lg-down"
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* HEADER: Matches the Dark Sidebar/Theme logic */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <Modal.Title className="h6 fw-bold mb-0">
           {leaseId ? (
             <><i className="bi bi-pencil-square me-2 text-warning"></i>Modify Lease #{leaseId}</>
           ) : (
             <><i className="bi bi-plus-circle me-2 text-primary"></i>New Lease Configuration</>
           )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light">
        <div className="row g-0">

          {/* TAB NAVIGATION (Mobile: 3x2 Grid, Desktop: Sidebar) */}
          <div className="col-12 col-lg-3 border-end bg-white sticky-top shadow-sm shadow-lg-none">
            <div className="p-2 p-lg-3">
              <div className="row row-cols-3 row-cols-lg-1 g-2 justify-content-center">
                {steps.map((item) => (
                  <div className="col" key={item.id}>
                    <button
                      className={`w-100 btn btn-sm py-2 px-lg-3 d-flex flex-column flex-lg-row align-items-center gap-2 border-0 rounded-3 transition-all ${
                          tab === item.id 
                          ? "bg-primary text-white shadow-sm fw-bold" 
                          : "text-muted hover-bg-light fw-medium"
                      }`}
                      onClick={() => setTab(item.id)}
                    >
                      <i className={`${item.icon} ${tab === item.id ? 'opacity-100' : 'opacity-50'} fs-5`}></i>
                      <span className="small lh-1 text-uppercase ls-1" style={{fontSize: '0.65rem'}}>{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="col-12 col-lg-9 p-3 p-md-5 bg-white bg-lg-light">
            <div className="mx-auto" style={{ maxWidth: '800px' }}>
                <div className="animate__animated animate__fadeIn">
                    {tab === "basic" && <LeaseInfoTab form={form} update={update} />}
                    {tab === "rent" && <LeaseRentTab form={form} updateRent={(i:any, k:any, v:any) => {
                      const rows = [...form.lease_rents]; rows[i] = { ...rows[i], [k]: v }; update("lease_rents", rows);
                    }} addRentRow={() => update("lease_rents", [...form.lease_rents, { rent_type: "", amount: "" }])} removeRent={(i:any) => update("lease_rents", form.lease_rents.filter((_:any, idx:any) => idx !== i))} totalRent={totalRent} />}
                    {tab === "financial" && <LeaseFinancialTab form={form} update={update} totalRent={totalRent} />}
                    {tab === "checklist" && <LeaseChecklistTab form={form} update={update} />}
                    {tab === "remarks" && <LeaseRemarksTab form={form} update={update} />}
                    {tab === "docs" && <LeaseDocumentsTab leaseId={leaseId} />}
                </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="p-3 bg-white border-top shadow-sm d-flex justify-content-end gap-2 px-md-5">
        <Button variant="light" className="rounded-pill px-4 border text-muted small fw-bold" onClick={handleDiscard}>
            Discard Changes
        </Button>
        <Button
            variant={leaseId ? 'warning' : 'primary'}
            className="rounded-pill px-5 fw-bold shadow-sm"
            disabled={loading}
            onClick={saveLease}
        >
           {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
           {leaseId ? "Update Agreement" : "Save & Continue"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}