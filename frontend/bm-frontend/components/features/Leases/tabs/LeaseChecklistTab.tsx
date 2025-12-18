const CHECKLIST_ITEMS = [
  { key: "electricity_card_given", label: "Electricity Card", icon: "lightning-charge", color: "warning" },
  { key: "gas_card_given", label: "Gas Card", icon: "fire", color: "danger" },
  { key: "main_gate_key_given", label: "Main Gate Key", icon: "key", color: "primary" },
  { key: "pocket_gate_key_given", label: "Pocket Gate Key", icon: "lock", color: "info" },
  { key: "agreement_paper_given", label: "Agreement Signed", icon: "file-earmark-check", color: "success" },
  { key: "police_verification_done", label: "Police Verified", icon: "shield-check", color: "dark" },
];

export default function LeaseChecklistTab({ form, update }: any) {
  return (
    <div className="row g-3 animate__animated animate__fadeIn">
      {CHECKLIST_ITEMS.map((item) => (
        <div key={item.key} className="col-md-6">
          <div
            className={`p-3 rounded-4 border d-flex align-items-center justify-content-between transition-all ${
              form[item.key] ? "bg-success bg-opacity-10 border-success" : "bg-white"
            }`}
          >
            <div className="d-flex align-items-center gap-3">
              <div className={`bg-${item.color} bg-opacity-10 p-2 rounded-3 text-${item.color}`}>
                <i className={`bi bi-${item.icon} fs-4`}></i>
              </div>
              <span className="fw-bold small">{item.label}</span>
            </div>
            <div className="form-check form-switch fs-4">
              <input
                className="form-check-input"
                type="checkbox"
                checked={!!form[item.key]}
                onChange={e => update(item.key, e.target.checked)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}