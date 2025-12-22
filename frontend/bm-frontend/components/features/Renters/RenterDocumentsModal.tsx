import React, { useState } from 'react';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { useRenterDocs } from '../../../logic/hooks/useRenterDocs';

export default function RenterDocumentsModal({ renter, onClose }: any) {
  const { documents, loading, uploading, uploadDoc, deleteDoc } = useRenterDocs(renter);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('nid');

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    const ok = await uploadDoc(selectedFile, docType);
    if (ok) setSelectedFile(null);
  };

  return (
    <Modal show onHide={onClose} centered fullscreen="sm-down" contentClassName="border-0 shadow-lg rounded-4">
      <Modal.Header closeButton className="bg-light p-3">
        <Modal.Title className="h6 fw-bold mb-0">
          <i className="bi bi-files me-2 text-primary"></i> Docs: {renter?.full_name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        <div className="bg-light p-3 rounded-4 mb-4 border border-dashed">
          <label className="small fw-bold text-muted text-uppercase mb-2 d-block">Upload New Record <span className="text-danger">*</span></label>
          <div className="vstack gap-2">
            <select className="form-select py-2 small" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="nid">National ID (NID)</option>
              <option value="passport">Passport</option>
              <option value="other">Other</option>
            </select>
            <input type="file" className="form-control py-1 px-2 small" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            <Button variant="primary" className="fw-bold rounded-pill w-100 mt-2 py-2 shadow-sm" onClick={handleConfirmUpload} disabled={uploading || !selectedFile}>
              {uploading ? <Spinner size="sm" /> : "Confirm Upload"}
            </Button>
          </div>
        </div>

        <h6 className="fw-bold small text-muted text-uppercase mb-3" style={{fontSize: '0.6rem'}}>Stored Files</h6>
        <div className="vstack gap-2 overflow-auto" style={{ maxHeight: '40vh' }}>
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4 text-muted small italic">No documents found.</div>
          ) : (
            documents.map((doc) => (
                <div key={doc.id} className="d-flex align-items-center justify-content-between p-2 border rounded-3 bg-white shadow-xs">
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                        <i className="bi bi-file-earmark-check text-success fs-4"></i>
                        <div className="text-truncate">
                            <div className="fw-bold small text-capitalize">{doc.doc_type}</div>
                            <a href={doc.file} target="_blank" className="x-small text-decoration-none">View File</a>
                        </div>
                    </div>
                    <button className="btn btn-sm text-danger p-2 border-0 bg-transparent" onClick={() => deleteDoc(doc.id)}>
                        <i className="bi bi-trash fs-5"></i>
                    </button>
                </div>
            ))
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light p-2 border-0">
        <Button variant="outline-secondary" className="w-100 rounded-pill fw-bold" onClick={onClose}>Close Window</Button>
      </Modal.Footer>
    </Modal>
  );
}