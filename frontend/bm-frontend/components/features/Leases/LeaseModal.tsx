import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { LeaseService } from "../../../logic/services/leaseService";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

// Tab Imports
import LeaseInfoTab from "./tabs/LeaseInfoTab";
import LeaseRentTab from "./tabs/LeaseRentTab";
import LeaseFinancialTab from "./tabs/LeaseFinancialTab";
import LeaseChecklistTab from "./tabs/LeaseChecklistTab";
import LeaseRemarksTab from "./tabs/LeaseRemarksTab";
import LeaseDocumentsTab from "./tabs/LeaseDocumentsTab";

export default function LeaseModal({ lease, onClose, onSaved }: any) {
  const [tab, setTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const saveLease = async () => {
    setError(null);
    if (!form.renter || !form.unit) { setError("Tenant and Unit are required."); return; }
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
        onSaved(); onClose();
      } else {
        const res = await LeaseService.create(payload);
        setLeaseId(res.id);
        onSaved(); setTab("docs");
      }
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
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
      centered // 🔥 Horizontal and Vertical centering
      fullscreen="lg-down" // 🔥 Fullscreen on mobile, centered box on desktop
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <Modal.Title className="h6 fw-bold mb-0">
           {leaseId ? `Modify Lease #${leaseId}` : 'New Lease Configuration'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light">
        <div className="row g-0">
          {/* 3x2 Grid for Steps on Mobile */}
          <div className="col-12 col-lg-3 border-end bg-white sticky-top shadow-sm">
            <div className="p-2">
              <div className="row row-cols-3 row-cols-lg-1 g-2 justify-content-center">
                {steps.map((item) => (
                  <div className="col" key={item.id}>
                    <button
                      className={`w-100 btn btn-sm py-2 d-flex flex-column flex-lg-row align-items-center gap-2 border-0 transition-all ${tab === item.id ? "bg-primary text-white shadow" : "text-muted hover-bg-light"}`}
                      onClick={() => setTab(item.id)}
                    >
                      <i className={`${item.icon} fs-5`}></i>
                      <span className="small fw-bold lh-1" style={{fontSize: '0.7rem'}}>{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9 p-3 p-md-4">
            {error && <div className="alert alert-danger border-0 small mb-4">{error}</div>}
            <div className="mx-auto" style={{ maxWidth: '800px' }}>
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
      </Modal.Body>

      <Modal.Footer className="p-3 bg-white border-top shadow-lg d-flex justify-content-center gap-2">
        <Button variant="light" className="rounded-pill px-4 border" onClick={onClose}>Discard</Button>
        <Button variant={leaseId ? 'warning' : 'primary'} className="rounded-pill px-5 fw-bold shadow-sm" disabled={loading} onClick={saveLease}>
           {loading ? <Spinner size="sm" /> : leaseId ? "Update" : "Save & Continue"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}