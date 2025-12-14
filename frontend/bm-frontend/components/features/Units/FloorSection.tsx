import { useEffect, useState } from "react";
import { Floor, FloorService } from "../../../logic/services/floorService";

export default function FloorSection() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFloors = async () => {
    setLoading(true);
    try {
      const data = await FloorService.list();
      setFloors(data.results); // ✅ IMPORTANT
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloors();
  }, []);

  const handleCreate = async () => {
    if (!name || !number) return;

    await FloorService.create({
      name,
      number: Number(number),
    });

    setName("");
    setNumber("");
    loadFloors();
  };

  return (
    <div className="mb-5">
      <h5 className="mb-3">Floors</h5>

      <div className="row g-2 mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Floor Name (e.g. 1st Floor)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="col">
          <input
            className="form-control"
            type="number"
            placeholder="Floor Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={loading}
          >
            Add Floor
          </button>
        </div>
      </div>

      <ul className="list-group">
        {floors.map((floor) => (
          <li key={floor.id} className="list-group-item">
            <strong>{floor.name}</strong> (#{floor.number})
          </li>
        ))}
      </ul>
    </div>
  );
}
