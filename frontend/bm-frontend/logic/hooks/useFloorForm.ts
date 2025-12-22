import { useState } from "react";
import { Floor, FloorService } from "../services/floorService";
import { useNotify } from "../context/NotificationContext"; // ✅ Added
import { getErrorMessage } from "../utils/getErrorMessage"; // ✅ Added for clean error strings

export function useFloorForm(floor: Floor | null, onSaved: () => void, onClose: () => void) {
  const { success, error: notifyError } = useNotify(); // ✅ Initialize notifications

  // 1. Data States
  const [name, setName] = useState(floor?.name || "");
  const [number, setNumber] = useState<number | "">(floor?.number ?? "");
  const [description, setDescription] = useState(floor?.description || "");

  // 2. UI States
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({}); // ✅ Improved for backend compatibility

  // 3. Client-Side Validation Logic
  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};
    if (!name.trim()) newErrors.name = ["Floor name is required"];
    if (number === "" || number === null) newErrors.number = ["Level number is required"];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Update Helpers (Clears errors on type)
  const updateName = (val: string) => {
    setName(val);
    if (errors.name) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const updateNumber = (val: string) => {
    setNumber(val === "" ? "" : Number(val));
    if (errors.number) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.number;
        return next;
      });
    }
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
      if (floor) {
        await FloorService.update(floor.id, payload);
        success("Floor updated successfully!"); // ✅ Success notification
      } else {
        await FloorService.create(payload);
        success("New floor created successfully!"); // ✅ Success notification
      }

      onSaved();
      onClose();
    } catch (err: any) {
      // ✅ Handle Backend Validation Errors (e.g., 400 Bad Request)
      if (err.response?.data) {
        setErrors(err.response.data);
        notifyError("Please correct the highlighted errors.");
      } else {
        // ✅ Handle Network/Server Errors
        notifyError(getErrorMessage(err));
      }
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