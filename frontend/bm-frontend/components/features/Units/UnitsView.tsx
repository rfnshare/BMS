// components/features/Units/UnitsView.tsx
import React, { useEffect } from 'react';
import FloorList from './FloorList';
import UnitList from './UnitList';
import UnitDetails from './UnitDetails';
import { useUnits } from '../../../logic/hooks/useUnits';

export default function UnitsView() {
  const u = useUnits();

  // When selected floor changes, load units
  useEffect(() => {
    if (u.selectedFloor) {
      u.loadUnitsForFloor(u.selectedFloor.id);
    }
  }, [u.selectedFloor]);

  return (
    <div className="container-fluid my-4">
      <h1 className="mb-4">🏢 Floors & Units</h1>
      <div className="row g-4">
        <div className="col-md-4">
          <FloorList
            floors={u.floors}
            loading={u.loading}
            onSelect={(f) => { u.setSelectedFloor(f); u.setMessage(null); }}
            onCreate={u.createFloor}
            onUpdate={u.updateFloor}
            onDelete={u.deleteFloor}
            selectedFloor={u.selectedFloor}
          />
        </div>

        <div className="col-md-8">
          <UnitList
            floor={u.selectedFloor}
            units={u.units}
            loading={u.loading}
            onAdd={() => { /* handled by modal in UnitList */ }}
            onEdit={u.updateUnit}
            onDelete={u.deleteUnit}
            onView={async (id: number) => await u.loadUnitDetails(id)}
            onCreate={u.createUnit}
          />

          <div className="mt-4">
            <UnitDetails
              unit={u.selectedUnit}
              loading={u.loading}
              onUpload={(unitId, fd) => u.uploadUnitDocument(unitId, fd)}
              onDeleteDocument={(unitId, docId) => u.deleteUnitDocument(unitId, docId)}
            />
          </div>
        </div>
      </div>

      {u.message && <div className="mt-3 alert alert-info">{u.message}</div>}
    </div>
  );
}
