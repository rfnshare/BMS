import { useState, useEffect, useCallback } from "react";
import api from "../services/apiClient";
import { useNotify } from "../context/NotificationContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useUnitDocuments(unitId: number) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notifyError } = useNotify();

  // 1. Fetch Documents
  const loadDocuments = useCallback(async () => {
    try {
      const res = await api.get("documents/unit-documents/", {
        params: { unit: unitId },
      });
      // Handle both paginated and non-paginated responses
      setDocuments(res.data.results || res.data || []);
    } catch (err) {
      const msg = "Failed to load unit documents.";
      setError(msg);
      // We don't always want a toast for initial load failures to avoid spam
    }
  }, [unitId]);

  useEffect(() => {
    if (unitId) loadDocuments();
  }, [loadDocuments, unitId]);

  // 2. Upload Document (Handles Multipart/FormData)
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

      success("Document uploaded successfully!");
      await loadDocuments(); // Refresh the list
      return { success: true };
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Document
  const deleteDocument = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await api.delete(`documents/unit-documents/${id}/`);
      success("Document deleted successfully.");
      await loadDocuments(); // Refresh the list
    } catch (err: any) {
      notifyError("Failed to delete document.");
    }
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    setError // This allows the UI to clear its own errors
  };
}