const CHECKLIST = [
  ["electricity_card_given", "Electricity Card"],
  ["gas_card_given", "Gas Card"],
  ["main_gate_key_given", "Main Gate Key"],
  ["pocket_gate_key_given", "Pocket Gate Key"],
  ["agreement_paper_given", "Agreement Paper"],
  ["police_verification_done", "Police Verification"],
];

export default function LeaseChecklistTab({ form, setForm }: any) {
  const toggle = (k: string) =>
    setForm((p: any) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="row g-3">
      {CHECKLIST.map(([key, label]) => (
        <div key={key} className="col-md-6">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!form[key]}
              onChange={() => toggle(key)}
            />
            <label className="form-check-label">
              {label}
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
