import { useState } from "react";
import { Unit, UnitService } from "../services/unitService";
import { Floor } from "../services/floorService";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";

// Helper to handle Decimal/Number inputs safely
const toFormNumber = (val: any): number | "" => {
  if (val === null || val === undefined || val === "") return "";
  const parsed = Number(val);
  return isNaN(parsed) ? "" : parsed;
};

export function useUnitForm(unit: Unit | null, floors: Floor[], onSaved: () => void, onClose: () => void) {
  const { success, error: notifyError } = useNotify();

  // 1. Unified State Object
  const [form, setForm] = useState({
    name: unit?.name ?? "",
    floor: unit?.floor ? (floors.find(f => f.id === (unit.floor as any)) || null) : null,
    unit_type: unit?.unit_type ?? "residential",
    status: unit?.status ?? "vacant",
    monthly_rent: toFormNumber(unit?.monthly_rent),
    security_deposit: toFormNumber(unit?.security_deposit),
    remarks: unit?.remarks ?? "",
    // Meter Fields
    prepaid_electricity_meter_no: unit?.prepaid_electricity_meter_no ?? "",
    prepaid_electricity_old_meter_no: unit?.prepaid_electricity_old_meter_no ?? "",
    prepaid_electricity_customer_no: unit?.prepaid_electricity_customer_no ?? "",
    prepaid_gas_meter_customer_code: unit?.prepaid_gas_meter_customer_code ?? "",
    prepaid_gas_meter_prepaid_code: unit?.prepaid_gas_meter_prepaid_code ?? "",
    prepaid_gas_meter_no: unit?.prepaid_gas_meter_no ?? "",
    prepaid_gas_card_no: unit?.prepaid_gas_card_no ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 2. Update helper that clears errors when user types
  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // 3. Save Logic
  const save = async () => {
    // Client-side validation
    if (!form.name.trim()) {
      setErrors({ name: ["Unit name is required"] });
      return;
    }
    if (!form.floor) {
      setErrors({ floor: ["Please select a floor"] });
      return;
    }

    setIsSaving(true);
    const payload = {
      ...form,
      floor: form.floor?.id, // Convert floor object to ID for API
      monthly_rent: form.monthly_rent === "" ? null : form.monthly_rent,
      security_deposit: form.security_deposit === "" ? null : form.security_deposit
    };

    try {
      if (unit) {
        await UnitService.update(unit.id, payload);
        success(`Unit "${form.name}" updated!`);
      } else {
        await UnitService.create(payload);
        success(`New unit "${form.name}" created!`);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      if (err.response?.data) {
        setErrors(err.response.data); // Map backend errors (e.g., "Duplicate meter number")
      } else {
        notifyError(getErrorMessage(err));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { form, errors, isSaving, update, save };
}