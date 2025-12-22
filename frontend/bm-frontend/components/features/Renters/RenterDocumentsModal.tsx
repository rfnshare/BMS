import React, { useState } from 'react';
import { Spinner, Modal, Button, Row, Col, Form, Badge } from 'react-bootstrap';
import { useRenterDocs } from '../../../logic/hooks/useRenterDocs';

export default function RenterDocumentsModal({ renter, onClose }: any) {
  const { documents, loading, uploading, uploadDoc, deleteDoc } = useRenterDocs(renter);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('nid');

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    const ok = await uploadDoc(selectedFile, docType);
    if (ok) {
        setSelectedFile(null);
        // Reset file input visually
        const fileInput = document.getElementById('renterFileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    }
  };

  return (
    <Modal
        show onHide={onClose} centered size="xl"
        fullscreen="lg-down" // ✅ Mobile Fullscreen
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* 1. HEADER: Blueprint Dark Theme */}
      <Modal.Header closeButton closeVariant="white" className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-shield-lock fs-5 text-primary"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">
              Resident Document Vault
            </Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase mt-1" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
               Archive for: {renter?.full_name}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        <Row className="g-4">

          {/* 2. LEFT: UPLOAD OPERATIONS (Operations Pane) */}
          <Col lg={5}>
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-top border-4 border-success h-100">
              <h6 className="fw-bold text-success mb-4 text-uppercase small ls-1 border-bottom pb-2">
                <i className="bi bi-cloud-arrow-up me-2"></i>New Document Intake
              </h6>

              <Form.Group className="mb-3">
                <Form.Label className="x-small fw-bold text-muted text-uppercase ls-1 mb-1">Classification <span className="text-danger">*</span></Form.Label>
                <Form.Select
                    className="rounded-pill bg-light border-0 py-2 ps-3 fw-bold small shadow-none"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                >
                    <option value="nid">National ID (NID)</option>
                    <option value="passport">International Passport</option>
                    <option value="other">Other Legal Record</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="x-small fw-bold text-muted text-uppercase ls-1 mb-1">File Source <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    id="renterFileInput"
                    type="file"
                    className="rounded-pill bg-light border-0 py-2 ps-3 small"
                    onChange={(e: any) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </Form.Group>

              <Button
                variant="success"
                className="w-100 rounded-pill fw-bold py-2 shadow-sm mt-auto ls-1"
                onClick={handleConfirmUpload}
                disabled={uploading || !selectedFile}
              >
                {uploading ? <Spinner size="sm" /> : <><i className="bi bi-check-circle me-2"></i>COMMIT TO VAULT</>}
              </Button>
            </div>
          </Col>

          {/* 3. RIGHT: STORED ARCHIVES (Archive Pane) */}
          <Col lg={7}>
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-4 border-primary h-100">
              <h6 className="fw-bold text-primary mb-4 text-uppercase small ls-1 border-bottom pb-2">
                <i className="bi bi-archive me-2"></i>Verified Records ({documents.length})
              </h6>

              <div className="vstack gap-2 overflow-auto no-scrollbar" style={{ maxHeight: '400px' }}>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" size="sm" />
                        <div className="x-small fw-bold text-muted ls-1 mt-2">ACCESSING ARCHIVES...</div>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-5 opacity-50">
                        <i className="bi bi-folder-x display-4 text-light"></i>
                        <p className="small text-muted italic mt-2">No legal records found in resident history.</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-light rounded-4 border border-light animate__animated animate__fadeIn">
                            <div className="d-flex align-items-center">
                                <div className="bg-white p-2 rounded-3 me-3 text-success shadow-sm d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-file-earmark-check fs-4"></i>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="fw-bold text-dark text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>{doc.doc_type}</div>
                                    <div className="x-small text-muted fw-bold opacity-75">LOGGED: {new Date().toLocaleDateString()}</div>
                                </div>
                                <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                    <Button
                                        variant="white" size="sm" className="px-3 border-end fw-bold x-small ls-1"
                                        href={doc.file} target="_blank"
                                    >
                                        VIEW
                                    </Button>
                                    <button className="btn btn-sm btn-white text-danger px-3 fw-bold" onClick={() => deleteDoc(doc.id)}>
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      {/* 4. FOOTER: Blueprint Pill Buttons */}
      <Modal.Footer className="bg-white border-top p-3 d-flex justify-content-end px-md-5">
        <Button variant="light" className="rounded-pill px-5 border text-muted small fw-bold ls-1" onClick={onClose}>
          EXIT VAULT
        </Button>
      </Modal.Footer>
    </Modal>
  );
}