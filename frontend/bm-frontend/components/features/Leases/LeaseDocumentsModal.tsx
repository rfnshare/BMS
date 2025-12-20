import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { Spinner, Modal, Button, Form } from "react-bootstrap";

interface Props {
  leaseId: number;
  onClose: () => void;
  leaseLabel?: string;
}

export default function LeaseDocumentsModal({ leaseId, onClose, leaseLabel }: Props) {
  const [docs, setDocs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("agreement");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const DOCUMENT_CATEGORIES = [
    { value: "agreement", label: "Lease Agreement" },
    { value: "police_verification", label: "Police Verification" },
    { value: "handover", label: "Handover Document" },
    { value: "other", label: "Other Attachment" },
  ];

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/documents/lease-documents/?lease=${leaseId}`);
      setDocs(res.data.results || res.data);
    } catch (err) { console.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDocs(); }, [leaseId]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("lease", String(leaseId));
    fd.append("doc_type", docType);
    fd.append("file", file);

    try {
      await api.post("/documents/lease-documents/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFile(null);
      loadDocs();
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ Delete this legal document?")) return;
    try {
      await api.delete(`/documents/lease-documents/${id}/`);
      loadDocs();
    } catch (err) { alert("Failed to delete."); }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="lg"
      centered
      fullscreen="sm-down" // 🔥 Fullscreen on mobile
      scrollable
    >
      {/* 1. NATIVE-STYLE APP BAR */}
      <Modal.Header closeButton className="bg-dark text-white border-0 py-3 px-3">
        <div>
          <Modal.Title className="h6 fw-bold mb-0">Legal Archive</Modal.Title>
          <small className="opacity-75 x-small">{leaseLabel || `Lease #${leaseId}`}</small>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 bg-light">
        {/* 2. THUMB-FRIENDLY UPLOAD SECTION */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
          <label className="form-label small fw-bold text-primary text-uppercase mb-3">
            <i className="bi bi-cloud-arrow-up-fill me-2"></i>New Attachment
          </label>
          <div className="vstack gap-2">
            <Form.Select
              className="rounded-3 bg-light border-0 py-2"
              value={docType}
              onChange={e => setDocType(e.target.value)}
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </Form.Select>

            <Form.Control
              type="file"
              className="rounded-3 bg-light border-0 py-2"
              onChange={(e: any) => setFile(e.target.files?.[0] || null)}
            />

            <Button
              variant="primary"
              className="w-100 rounded-pill fw-bold py-2 mt-2 shadow-sm"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? <Spinner size="sm" /> : 'CONFIRM UPLOAD'}
            </Button>
          </div>
        </div>

        {/* 3. FULL-WIDTH DOCUMENT LIST */}
        <div className="mx-n1">
          <h6 className="fw-bold text-muted small text-uppercase mb-3 px-1">Stored Files</h6>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-5 text-muted small italic">
               <i className="bi bi-folder-x fs-1 opacity-25 d-block mb-2"></i>
               No documents found.
            </div>
          ) : (
            <div className="vstack gap-2">
              {docs.map(d => (
                <div key={d.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                       <i className={`bi bi-file-earmark-${d.file.endsWith('.pdf') ? 'pdf' : 'image'} fs-3`}></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                       <div className="fw-bold text-dark small text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {d.doc_type?.replace('_', ' ')}
                       </div>
                       <a
                         href={d.file}
                         target="_blank"
                         rel="noreferrer"
                         className="fw-bold text-primary small"
                       >
                         View Document <i className="bi bi-box-arrow-up-right ms-1"></i>
                       </a>
                    </div>
                    <button
                      className="btn btn-outline-danger border-0 rounded-circle p-2"
                      onClick={() => handleDelete(d.id)}
                    >
                      <i className="bi bi-trash-fill fs-5"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>

      {/* 4. STICKY FOOTER */}
      <Modal.Footer className="border-0 p-3 bg-white shadow-sm">
        <Button variant="secondary" className="w-100 rounded-pill fw-bold py-2" onClick={onClose}>
          Exit Archive
        </Button>
      </Modal.Footer>
    </Modal>
  );
}