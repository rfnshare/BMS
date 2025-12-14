// logic/hooks/useUnits.ts
import { useEffect, useState } from 'react';
import { FloorService, Floor } from '../services/floorService';
import { UnitService, Unit, UnitDocument } from '../services/unitService';

export function useUnits() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // --- Floors ---
  const loadFloors = async (params?: any) => {
    setLoading(true);
    try {
      const data = await FloorService.list(params);
      setFloors(data.results || data);
    } catch (err: any) {
      setMessage(err?.response?.data || 'Failed to load floors');
    } finally { setLoading(false); }
  };

  const createFloor = async (payload: Partial<Floor>) => {
    setLoading(true);
    try {
      const f = await FloorService.create(payload);
      setFloors(prev => [f, ...prev]);
      return f;
    } finally { setLoading(false); }
  };

  const updateFloor = async (id: number, payload: Partial<Floor>) => {
    setLoading(true);
    try {
      const f = await FloorService.update(id, payload);
      setFloors(prev => prev.map(p => (p.id === id ? f : p)));
      if (selectedFloor?.id === id) setSelectedFloor(f);
      return f;
    } finally { setLoading(false); }
  };

  const deleteFloor = async (id: number) => {
    setLoading(true);
    try {
      await FloorService.destroy(id);
      setFloors(prev => prev.filter(f => f.id !== id));
      if (selectedFloor?.id === id) { setSelectedFloor(null); setUnits([]); }
      return true;
    } finally { setLoading(false); }
  };

  // --- Units ---
  const loadUnitsForFloor = async (floorId: number, params?: any) => {
    setLoading(true);
    try {
      // Swagger shows /buildings/units/?floor=... for list
      const data = await UnitService.list({ ...params, floor: floorId });
      const results = data.results || data;
      setUnits(results);
    } catch (err: any) {
      setMessage(err?.response?.data || 'Failed to load units');
    } finally { setLoading(false); }
  };

  const createUnit = async (payload: any) => {
    setLoading(true);
    try {
      const u = await UnitService.create(payload);
      // If unit belongs to selectedFloor, add to list
      if (!selectedFloor || u.floor === selectedFloor.id) setUnits(prev => [u, ...prev]);
      return u;
    } finally { setLoading(false); }
  };

  const updateUnit = async (id: number, payload: any) => {
    setLoading(true);
    try {
      const u = await UnitService.update(id, payload);
      setUnits(prev => prev.map(item => (item.id === id ? u : item)));
      if (selectedUnit?.id === id) setSelectedUnit(u);
      return u;
    } finally { setLoading(false); }
  };

  const deleteUnit = async (id: number) => {
    setLoading(true);
    try {
      await UnitService.destroy(id);
      setUnits(prev => prev.filter(u => u.id !== id));
      if (selectedUnit?.id === id) setSelectedUnit(null);
      return true;
    } finally { setLoading(false); }
  };

  const loadUnitDetails = async (id: number) => {
    setLoading(true);
    try {
      const u = await UnitService.retrieve(id);
      setSelectedUnit(u);
      return u;
    } finally { setLoading(false); }
  };

  // --- Documents ---
  const uploadUnitDocument = async (unitId: number, formData: FormData) => {
    setLoading(true);
    try {
      const doc = await UnitService.uploadDocument(unitId, formData);
      // append to selected unit documents
      if (selectedUnit && selectedUnit.id === unitId) {
        setSelectedUnit({ ...selectedUnit, documents: [ ...(selectedUnit.documents || []), doc ]});
      }
      return doc;
    } finally { setLoading(false); }
  };

  const deleteUnitDocument = async (unitId: number, docId: number) => {
    setLoading(true);
    try {
      await UnitService.deleteDocument(unitId, docId);
      if (selectedUnit && selectedUnit.id === unitId) {
        setSelectedUnit({ ...selectedUnit, documents: (selectedUnit.documents || []).filter(d => d.id !== docId) });
      }
      return true;
    } finally { setLoading(false); }
  };

  // initial load
  useEffect(() => {
    loadFloors();
  }, []);

  return {
    // data
    floors,
    selectedFloor,
    units,
    selectedUnit,

    // state
    loading,
    message,

    // setters / actions
    setSelectedFloor,
    setSelectedUnit,
    setMessage,

    // floors
    loadFloors,
    createFloor,
    updateFloor,
    deleteFloor,

    // units
    loadUnitsForFloor,
    createUnit,
    updateUnit,
    deleteUnit,
    loadUnitDetails,

    // documents
    uploadUnitDocument,
    deleteUnitDocument,
  };
}
