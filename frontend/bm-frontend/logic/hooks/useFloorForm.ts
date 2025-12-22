import { useState } from "react";
import { Floor, FloorService } from "../services/floorService";

export function useFloorForm(floor: Floor | null, onSaved: () => void, onClose: () => void) {
  // 1. Data States
  const [name, setName] = useState(floor?.name || "");
  const [number, setNumber] = useState<number | "">(floor?.number ?? "");
  const [description, setDescription] = useState(floor?.description || "");

  // 2. UI States
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  // 3. Validation Logic
  const validateForm = () => {
    const newErrors: { name?: string; number?: string } = {};
    if (!name.trim()) newErrors.name = "Floor name is required";
    if (number === "" || number === null) newErrors.number = "Level number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Update Helpers (Clears errors on type)
  const updateName = (val: string) => {
    setName(val);
    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
  };

  const updateNumber = (val: string) => {
    setNumber(val === "" ? "" : Number(val));
    if (errors.number) setErrors(prev => ({ ...prev, number: "" }));
  };

  // 5. Save Logic
  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      name: name.trim(),
      number: Number(number),
      description: description.trim() || null
    };

    try {
      floor
        ? await FloorService.update(floor.id, payload)
        : await FloorService.create(payload);
      onSaved();
      onClose(); // Standardizing: save usually triggers a close
    } catch (err) {
      console.error("Failed to save floor:", err);
    } finally {
      setSaving(false);
    }
  };

  return {
    form: { name, number, description },
    setters: { updateName, updateNumber, setDescription },
    errors,
    saving,
    save
  };
}