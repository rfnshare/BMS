import { useState, useEffect, useCallback } from 'react';
import { Renter, RenterService } from '../services/renterService';
import { useNotify } from '../context/NotificationContext';

export function useRenterDocs(renter: Renter | null) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { success, error } = useNotify();

  const loadDocs = useCallback(async () => {
    if (!renter) return;
    setLoading(true);
    try {
      const data = await RenterService.listDocuments(renter.id);
      setDocuments(data.results || data);
    } catch (err) {
      error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [renter, error]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const uploadDoc = async (file: File, type: string) => {
    if (!renter) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('doc_type', type);
    fd.append('renter', renter.id.toString());

    setUploading(true);
    try {
      await RenterService.uploadDocument(fd);
      success("Document uploaded successfully.");
      await loadDocs();
      return true;
    } catch (err) {
      error("Upload failed.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id: number) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await RenterService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      success("Document deleted.");
    } catch (err) {
      error("Could not delete document.");
    }
  };

  return { documents, loading, uploading, uploadDoc, deleteDoc };
}