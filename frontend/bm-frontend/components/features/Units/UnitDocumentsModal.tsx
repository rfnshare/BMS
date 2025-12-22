import { useState } from "react";
import { Modal, Button, Form, Spinner, Alert, ListGroup } from "react-bootstrap";
import { useUnitDocuments } from "../../../logic/hooks/useUnitDocuments";

interface Props {
  unit: any;
  onClose: () => void;
}

const DOC_TYPES = [
  { value: "electricity_meter", label: "Electricity Meter" },
  { value: "gas_meter", label: "Gas Meter" },
  { value: "other", label: "Other" },
];

export default function UnitDocumentsModal({ unit, onClose }: Props) {
  const { documents, loading, error, uploadDocument, deleteDocument, setError } = useUnitDocuments(unit.id);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("electricity_meter");

  const handleUpload = async () => {
    if (!file) return setError("Please select a file first");
    const result = await uploadDocument(file, docType);
    if (result.success) setFile(null);
  };

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title className="h6">📁 Documents: {unit.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        {error && <Alert variant="danger" className="border-0 shadow-sm small">{error}</Alert>}

        {/* Upload Area */}
        <div className="card border-0 bg-white p-4 mb-4 rounded-4 shadow-sm">
          <div className="row g-2">
            <div className="col-md-4">
              <Form.Select value={docType} onChange={e => setDocType(e.target.value)}>
                {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </Form.Select>
            </div>
            <div className="col-md-5">
              <Form.Control type="file" onChange={e => setFile((e.target as any).files?.[0] || null)} />
            </div>
            <div className="col-md-3">
              <Button variant="success" className="w-100 fw-bold" onClick={handleUpload} disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Upload"}
              </Button>
            </div>
          </div>
        </div>

        {/* List */}
        <h6 className="fw-bold text-muted small text-uppercase mb-3">Stored Documents</h6>
        <ListGroup className="rounded-4 shadow-sm border-0">
          {documents.length === 0 ? (
            <div className="p-5 text-center text-muted bg-white">No documents found.</div>
          ) : (
            documents.map(doc => (
              <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center border-bottom">
                <div className="d-flex align-items-center">
                  <div className="bg-primary-subtle text-primary p-2 rounded-3 me-3">📄</div>
                  <div>
                    <div className="small fw-bold text-uppercase">{doc.doc_type.replace('_', ' ')}</div>
                    <div className="x-small text-muted">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="btn-group">
                  <Button variant="light" size="sm" className="border" href={doc.file} target="_blank">View</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => deleteDocument(doc.id)}>🗑️</Button>
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
}