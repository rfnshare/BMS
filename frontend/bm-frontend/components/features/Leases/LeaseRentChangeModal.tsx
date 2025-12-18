export default function LeaseRentChangeModal({ lease, onClose, onSaved }: any) {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const submit = async () => {
    await api.post("/leases/lease-rent-history/", {
      lease: lease.id,
      old_rent: lease.total_rent,
      new_rent: amount,
      remarks,
    });
    onSaved();
  };

  return (
    <Modal title="Change Rent" onClose={onClose}>
      <div className="mb-3">
        <label>Current Rent</label>
        <input className="form-control" value={lease.total_rent} disabled />
      </div>

      <div className="mb-3">
        <label>New Rent</label>
        <input
          type="number"
          className="form-control"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <textarea
        className="form-control"
        placeholder="Reason"
        value={remarks}
        onChange={e => setRemarks(e.target.value)}
      />

      <div className="text-end mt-3">
        <button className="btn btn-success" onClick={submit}>
          Apply Change
        </button>
      </div>
    </Modal>
  );
}
