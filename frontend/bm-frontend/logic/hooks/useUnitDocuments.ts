import { useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useUnitDocuments(unitId: number) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await api.get("documents/unit-documents/", {
        params: { unit: unitId },
      });
      setDocuments(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [unitId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = async (file: File, docType: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("unit", String(unitId));
      formData.append("doc_type", docType);
      formData.append("file", file);

      await api.post("documents/unit-documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadDocuments();
      return { success: true };
    } catch (err) {
      setError(getErrorMessage(err));
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      await api.delete(`documents/unit-documents/${id}/`);
      await loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return { documents, loading, error, uploadDocument, deleteDocument, setError };
}