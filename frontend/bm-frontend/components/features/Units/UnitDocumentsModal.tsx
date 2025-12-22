import { useState } from "react";
import { Modal, Button, Form, Spinner, Alert, ListGroup, InputGroup, Col, Row } from "react-bootstrap";
import { useUnitDocuments } from "../../../logic/hooks/useUnitDocuments";

interface Props {
  unit: any;
  onClose: () => void;
}

export default function UnitDocumentsModal({ unit, onClose }: Props) {
  const { documents, loading, error, uploadDocument, deleteDocument, setError } = useUnitDocuments(unit.id);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("electricity_meter");

  const handleUpload = async () => {
    if (!file) { setError("Please select a file first"); return; }
    const result = await uploadDocument(file, docType);
    if (result.success) {
      setFile(null);
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
    <Modal
      show onHide={onClose} size="lg" centered
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* HEADER: Blueprint Dark */}
      <Modal.Header closeButton className="bg-dark text-white p-3 p-md-4 border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-info bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-folder2-open fs-5 text-info"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0 text-uppercase ls-1">Asset Archives</Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem' }}>Unit: {unit.name}</div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {error && <Alert variant="danger" className="border-0 shadow-sm rounded-4 small py-2 mb-3">{error}</Alert>}

        {/* UPLOAD SECTION: Blueprint Pill Style */}
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4 border-top border-4 border-success">
          <h6 className="fw-bold text-success small text-uppercase ls-1 mb-3">Upload Technical Document</h6>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="x-small fw-bold text-muted ls-1 text-uppercase">1. Category</Form.Label>
              <Form.Select
                className="rounded-pill bg-light border-0 py-2 fw-bold small"
                value={docType} onChange={e => setDocType(e.target.value)}
              >
                <option value="electricity_meter">Electricity Meter Scan</option>
                <option value="gas_meter">Gas Meter Card</option>
                <option value="other">General Asset File</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label className="x-small fw-bold text-muted ls-1 text-uppercase">2. Select Image/PDF</Form.Label>
              <Form.Control
                id="fileInput" type="file"
                className="rounded-pill bg-light border-0 py-2 small"
                onChange={e => setFile((e.target as any).files?.[0] || null)}
              />
            </Col>
            <Col xs={12}>
              <Button
                variant="success"
                className="w-100 rounded-pill fw-bold shadow-sm py-2 mt-2"
                onClick={handleUpload} disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : <><i className="bi bi-cloud-arrow-up me-2"></i>COMMIT UPLOAD</>}
              </Button>
            </Col>
          </Row>
        </div>

        {/* LIST SECTION */}
        <h6 className="fw-bold text-muted small text-uppercase ls-1 mb-3 px-1">Stored Technical Files</h6>
        <div className="vstack gap-2">
          {documents.length === 0 ? (
            <div className="p-5 text-center text-muted bg-white rounded-4 border border-dashed">
                <i className="bi bi-file-earmark-x fs-1 opacity-25"></i>
                <p className="small mb-0 mt-2">No documents found for this infrastructure.</p>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="card border-0 shadow-sm rounded-4 bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
                      <i className="bi bi-file-earmark-medical"></i>
                    </div>
                    <div>
                      <div className="small fw-bold text-uppercase ls-1">{doc.doc_type.replace('_', ' ')}</div>
                      <div className="text-muted" style={{ fontSize: '0.6rem' }}>LOGGED: {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                    <Button variant="white" size="sm" className="px-3 border-end fw-bold x-small" href={doc.file} target="_blank">VIEW</Button>
                    <Button variant="white" size="sm" className="text-danger px-3" onClick={() => deleteDocument(doc.id)}>
                      <i className="bi bi-trash3"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-3 bg-white">
        <Button variant="light" className="rounded-pill px-4 border text-muted small fw-bold" onClick={onClose}>
          Exit Archive
        </Button>
      </Modal.Footer>
    </Modal>
  );
}