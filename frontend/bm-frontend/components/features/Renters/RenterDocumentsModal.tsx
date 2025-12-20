import React, { useState, useEffect, useCallback } from 'react';
import { Renter, RenterService } from '../../../logic/services/renterService';
import { Spinner, Alert, Modal, Button } from 'react-bootstrap';

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('nid');

  const loadDocs = useCallback(async () => {
    if (!renter) return;
    setLoading(true);
    try {
      const data = await RenterService.listDocuments(renter.id);
      setDocuments(data.results || data);
    } catch (err) {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [renter]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async () => {
    if (!selectedFile || !renter) {
      setError("Please select a file first.");
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doc_type', docType);
    formData.append('renter', renter.id.toString());
    try {
      setUploading(true);
      setError(null);
      await RenterService.uploadDocument(formData);
      setSelectedFile(null);
      loadDocs();
    } catch (err) {
      setError("Upload failed. Check file size.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this document?")) {
      try {
        await RenterService.deleteDocument(id);
        setDocuments(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        setError("Could not delete document.");
      }
    }
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-light p-3">
        <Modal.Title className="h6 fw-bold mb-0">
          <i className="bi bi-files me-2 text-primary"></i>
          Docs: {renter?.full_name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {error && <Alert variant="danger" className="py-2 small border-0 mb-3">{error}</Alert>}

        {/* UPLOAD CARD */}
        <div className="bg-light p-3 rounded-4 mb-4 border border-dashed">
          <h6 className="fw-bold small text-muted text-uppercase mb-3" style={{fontSize: '0.6rem'}}>Upload New Record</h6>
          <div className="vstack gap-2">
            <select className="form-select py-2 small" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="nid">National ID (NID)</option>
              <option value="passport">Passport</option>
              <option value="other">Other</option>
            </select>
            <input
                type="file"
                className="form-control py-1 px-2 small"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Button
              variant="primary"
              className="fw-bold rounded-pill w-100 mt-2 py-2 shadow-sm"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? <Spinner size="sm" /> : "Confirm Upload"}
            </Button>
          </div>
        </div>

        {/* LIST SECTION */}
        <h6 className="fw-bold small text-muted text-uppercase mb-3" style={{fontSize: '0.6rem'}}>Stored Files</h6>
        <div className="vstack gap-2 overflow-auto" style={{ maxHeight: '40vh' }}>
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4 text-muted small">No documents found.</div>
          ) : (
            documents.map((doc) => (
                <div key={doc.id} className="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-white">
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                        <i className="bi bi-file-earmark-check text-success fs-4"></i>
                        <div className="text-truncate">
                            <div className="fw-bold small text-capitalize">{doc.doc_type}</div>
                            <a href={doc.file} target="_blank" rel="noreferrer" className="x-small text-decoration-none">View File</a>
                        </div>
                    </div>
                    <button className="btn btn-sm text-danger p-2" onClick={() => handleDelete(doc.id)}>
                        <i className="bi bi-trash fs-5"></i>
                    </button>
                </div>
            ))
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light p-3 border-0">
        <Button variant="outline-secondary" className="w-100 rounded-pill fw-bold" onClick={onClose}>Done</Button>
      </Modal.Footer>
    </Modal>
  );
}