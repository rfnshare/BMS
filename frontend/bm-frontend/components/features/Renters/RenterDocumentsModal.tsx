import React, { useState, useEffect, useCallback } from 'react';
import { Renter, RenterService } from '../../../logic/services/renterService';
import { Spinner, Alert } from 'react-bootstrap';

interface RenterDoc {
  id: number;
  doc_type: string;
  file: string;
  uploaded_at: string;
}

interface Props {
  renter: Renter | null;
  onClose: () => void;
}

export default function RenterDocumentsModal({ renter, onClose }: Props) {
  const [documents, setDocuments] = useState<RenterDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for new upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('nid');

  // ========================
  // 1. Fetch Documents
  // ========================
  const loadDocs = useCallback(async () => {
    if (!renter) return;
    setLoading(true);
    try {
      const data = await RenterService.listDocuments(renter.id);
      // Handle DRF results array
      setDocuments(data.results || data);
    } catch (err) {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [renter]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  // ========================
  // 2. Upload Logic
  // ========================
  const handleUpload = async () => {
    if (!selectedFile || !renter) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doc_type', docType);
    formData.append('renter', renter.id.toString()); // Backend perform_create needs this

    try {
      setUploading(true);
      setError(null);
      await RenterService.uploadDocument(formData);
      setSelectedFile(null); // Clear input
      loadDocs(); // Refresh the list
    } catch (err) {
      setError("Upload failed. Check file type and size.");
    } finally {
      setUploading(false);
    }
  };

  // ========================
  // 3. Delete Logic
  // ========================
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await RenterService.deleteDocument(id);
        setDocuments(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        setError("Could not delete document.");
      }
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 p-4 bg-light">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-files me-2 text-primary"></i>
              Documents: {renter?.full_name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {error && <Alert variant="danger" className="border-0 small">{error}</Alert>}

            {/* UPLOAD SECTION */}
            <div className="bg-light p-3 rounded-4 mb-4 border border-dashed text-center">
              <h6 className="fw-bold small text-muted text-uppercase mb-3">Upload New Record</h6>
              <div className="vstack gap-2">
                <select className="form-select form-select-sm" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="nid">National ID (NID)</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
                <input
                    type="file"
                    className="form-control form-control-sm"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <button
                  className="btn btn-primary btn-sm w-100 fw-bold"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? <Spinner size="sm" /> : "Upload to Server"}
                </button>
              </div>
            </div>

            {/* LIST SECTION */}
            <h6 className="fw-bold small text-muted text-uppercase mb-3">Stored Files</h6>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
              ) : documents.length === 0 ? (
                <p className="text-muted small text-center py-3">No documents uploaded yet.</p>
              ) : (
                <div className="vstack gap-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-white">
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <i className="bi bi-file-earmark-check text-success fs-5"></i>
                        <div className="text-truncate">
                          <div className="fw-bold small text-capitalize">{doc.doc_type}</div>
                          <a href={doc.file} target="_blank" rel="noreferrer" className="x-small text-primary">View Document</a>
                        </div>
                      </div>
                      <button className="btn btn-sm text-danger border-0" onClick={() => handleDelete(doc.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer border-0 p-3 bg-light">
            <button className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}