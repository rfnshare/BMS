import { useEffect, useState } from "react";
import { RentType, RentTypeService } from "../../../logic/services/rentTypeService";
import RentTypeModal from "./RentTypeModal";

export default function RentTypeManager() {
  const [items, setItems] = useState<RentType[]>([]);
  const [editing, setEditing] = useState<RentType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const data = await RentTypeService.list();
    setItems(data.results || data);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm("Delete this rent type?")) return;
    await RentTypeService.delete(id);
    load();
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h6>Rent Types</h6>
        <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
          + Add
        </button>
      </div>

      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Status</th>
            <th width="120">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(rt => (
            <tr key={rt.id}>
              <td>{rt.name}</td>
              <td>{rt.code}</td>
              <td>
                <span className={`badge bg-${rt.is_active ? "success" : "secondary"}`}>
                  {rt.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-1"
                  onClick={() => { setEditing(rt); setShowModal(true); }}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger"
                  onClick={() => remove(rt.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <RentTypeModal
          rentType={editing || undefined}
          onClose={() => { setEditing(null); setShowModal(false); }}
          onSaved={() => { setEditing(null); setShowModal(false); load(); }}
        />
      )}
    </>
  );
}
