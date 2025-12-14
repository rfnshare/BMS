import { useEffect, useState } from "react";
import { Unit, UnitService } from "../../../logic/services/unitService";
import { Floor, FloorService } from "../../../logic/services/floorService";
import UnitModal from "./UnitModal";
import UnitDocumentsModal from "./UnitDocumentsModal";

export default function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [docUnit, setDocUnit] = useState<Unit | null>(null);

  // ========================
  // Load units + floors
  // ========================
  const loadData = async () => {
    const unitRes = await UnitService.list();
    const floorRes = await FloorService.list();
    setUnits(unitRes.results);
    setFloors(floorRes.results);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ========================
  // Unit modal handlers
  // ========================
  const openCreate = () => {
    setEditingUnit(null);
    setShowModal(true);
  };

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowModal(true);
  };

  const closeUnitModal = () => {
    setEditingUnit(null);
    setShowModal(false);
  };

  const onSaved = () => {
    closeUnitModal();
    loadData();
  };

  // ========================
  // Delete
  // ========================
  const deleteUnit = async (id: number) => {
    if (!confirm("Delete this unit?")) return;
    await UnitService.destroy(id);
    loadData();
  };

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h4>Units</h4>
        <button className="btn btn-primary" onClick={openCreate}>
          Add Unit
        </button>
      </div>

      {/* TABLE */}
      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Floor</th>
            <th>Type</th>
            <th>Status</th>
            <th>Rent</th>
            <th width="180">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{floors.find(f => f.id === u.floor)?.name}</td>
              <td>{u.unit_type}</td>
              <td>
                <span
                  className={`badge bg-${
                    u.status === "vacant"
                      ? "success"
                      : u.status === "occupied"
                      ? "danger"
                      : "warning"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td>{u.monthly_rent || "-"}</td>
              <td>
                {/* DOCUMENTS */}
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => setDocUnit(u)}
                >
                  Documents
                </button>

                {/* EDIT */}
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => openEdit(u)}
                >
                  Edit
                </button>

                {/* DELETE */}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteUnit(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {units.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No units found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ========================
          UNIT CREATE / EDIT MODAL
         ======================== */}
      {showModal && (
        <UnitModal
          floors={floors}
          unit={editingUnit}
          onClose={closeUnitModal}
          onSaved={onSaved}
        />
      )}

      {/* ========================
          UNIT DOCUMENTS MODAL
         ======================== */}
      {docUnit && (
        <UnitDocumentsModal
          unit={docUnit}
          onClose={() => setDocUnit(null)}
        />
      )}
    </div>
  );
}