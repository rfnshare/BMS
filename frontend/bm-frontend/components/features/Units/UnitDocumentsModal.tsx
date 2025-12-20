import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

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
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("electricity_meter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const res = await api.get("documents/unit-documents/", { params: { unit: unit.id } });
      setDocuments(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => { loadDocuments(); }, []);

  const upload = async () => {
    if (!file) { setError("Please select a file"); return; }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("unit", unit.id);
      formData.append("doc_type", docType);
      formData.append("file", file);
      await api.post("documents/unit-documents/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteDoc = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    try {
      await api.delete(`documents/unit-documents/${id}/`);
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal show onHide={onClose} size="lg" centered fullscreen="sm-down">
      <Modal.Header closeButton className="bg-dark text-white p-3">
        <Modal.Title className="h6 fw-bold mb-0">📁 Docs: {unit.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 bg-light">
        {error && <Alert variant="danger" className="py-2 small border-0">{error}</Alert>}

        {/* UPLOAD CARD */}
        <div className="bg-white p-3 rounded-4 mb-4 border border-dashed shadow-sm">
          <h6 className="fw-bold mb-3 x-small text-muted text-uppercase">Upload New File</h6>
          <div className="vstack gap-2">
            <select className="form-select form-select-sm bg-light" value={docType} onChange={e => setDocType(e.target.value)}>
              {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <input type="file" className="form-control form-control-sm" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button variant="success" className="w-100 btn-sm fw-bold rounded-pill shadow-sm" onClick={upload} disabled={loading || !file}>
              {loading ? <Spinner size="sm" /> : "Upload to Server"}
            </Button>
          </div>
        </div>

        {/* LIST */}
        <h6 className="fw-bold x-small text-muted text-uppercase mb-3 px-1">Files ({documents.length})</h6>
        <div className="vstack gap-2" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {documents.length === 0 ? (
            <div className="text-center py-4 text-muted small">No files found.</div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="d-flex justify-content-between align-items-center p-2 bg-white border rounded-3 shadow-sm">
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                  <i className="bi bi-file-earmark-text text-primary fs-4"></i>
                  <div className="text-truncate">
                    <div className="fw-bold x-small text-uppercase">{doc.doc_type.replace('_', ' ')}</div>
                    <a href={doc.file} target="_blank" rel="noreferrer" className="x-small text-decoration-none">View</a>
                  </div>
                </div>
                <button className="btn btn-sm text-danger" onClick={() => deleteDoc(doc.id)}><i className="bi bi-trash"></i></button>
              </div>
            ))
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white p-3 border-top">
        <Button variant="secondary" className="w-100 rounded-pill fw-bold" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}