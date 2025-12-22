import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";
import { useNotify } from "../../../logic/context/NotificationContext"; // ✅ Global Notify
import { Spinner, Modal, Button, Form } from "react-bootstrap";

interface Props {
  leaseId: number;
  onClose: () => void;
  leaseLabel?: string;
}

export default function LeaseDocumentsModal({ leaseId, onClose, leaseLabel }: Props) {
  const { success, error: notifyError } = useNotify(); // ✅ Access Global Toasts

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

  // 1. Logic: Load Stored Files
  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/documents/lease-documents/?lease=${leaseId}`);
      setDocs(res.data.results || res.data);
    } catch (err) {
      notifyError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, [leaseId]);

  // 2. Logic: Handle Upload
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
      success("Legal document uploaded successfully."); // ✅ Success Toast
      loadDocs();
    } catch (err) {
      notifyError("Upload failed. Ensure file size is within limits.");
    } finally {
      setUploading(false);
    }
  };

  // 3. Logic: Handle Deletion
  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ This will permanently remove the legal record. Continue?")) return;
    try {
      await api.delete(`/documents/lease-documents/${id}/`);
      success("Document removed from archive."); // ✅ Success Toast
      loadDocs();
    } catch (err) {
      notifyError("Failed to delete document.");
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="lg"
      centered
      fullscreen="sm-down"
      scrollable
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      {/* HEADER: Blueprint Style */}
      <Modal.Header closeButton className="bg-dark text-white border-0 py-3 px-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-20 rounded-3 p-2">
            <i className="bi bi-shield-lock fs-5"></i>
          </div>
          <div>
            <Modal.Title className="h6 fw-bold mb-0">Legal Archive</Modal.Title>
            <div className="text-white opacity-50 fw-bold text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>
              {leaseLabel || `Lease ID: #${leaseId}`}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4 bg-light">
        {/* UPLOAD SECTION: Blueprint Pill Inputs */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 animate__animated animate__fadeInDown">
          <label className="text-muted small fw-bold text-uppercase ls-1 mb-3">
            <i className="bi bi-cloud-arrow-up me-2 text-primary"></i>New Attachment
          </label>
          <div className="vstack gap-2">
            <Form.Select
              className="rounded-pill bg-light border-0 py-2 ps-3 small fw-bold"
              value={docType}
              onChange={e => setDocType(e.target.value)}
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </Form.Select>

            <Form.Control
              type="file"
              className="rounded-pill bg-light border-0 py-2 ps-3 small"
              onChange={(e: any) => setFile(e.target.files?.[0] || null)}
            />

            <Button
              variant="primary"
              className="w-100 rounded-pill fw-bold py-2 mt-2 shadow-sm"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? <Spinner size="sm" animation="border" /> : (
                <><i className="bi bi-check2-circle me-2"></i>CONFIRM UPLOAD</>
              )}
            </Button>
          </div>
        </div>

        {/* DOCUMENT LIST */}
        <div className="mx-0 animate__animated animate__fadeIn">
          <h6 className="fw-bold text-muted small text-uppercase ls-1 mb-3 px-1">Stored Files ({docs.length})</h6>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          ) : docs.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
               <i className="bi bi-folder-x display-4 text-light mb-3"></i>
               <p className="text-muted small italic mb-0">No documents found in this archive.</p>
            </div>
          ) : (
            <div className="vstack gap-2">
              {docs.map(d => (
                <div key={d.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
                  <div className="d-flex align-items-center">
                    <div className="bg-light p-2 rounded-3 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                       <i className={`bi bi-file-earmark-${d.file.endsWith('.pdf') ? 'pdf-fill' : 'image-fill'} fs-4`}></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                       <div className="fw-bold text-dark text-uppercase ls-1" style={{ fontSize: '0.65rem' }}>
                          {d.doc_type?.replace('_', ' ')}
                       </div>
                       <a
                         href={d.file}
                         target="_blank"
                         rel="noreferrer"
                         className="text-primary small fw-bold text-decoration-none"
                       >
                         View Attachment <i className="bi bi-box-arrow-up-right ms-1"></i>
                       </a>
                    </div>
                    <button
                      className="btn btn-outline-danger border-0 rounded-pill p-2"
                      onClick={() => handleDelete(d.id)}
                    >
                      <i className="bi bi-trash3 fs-5"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top p-3 bg-white shadow-sm">
        <Button variant="light" className="w-100 rounded-pill fw-bold py-2 border text-muted" onClick={onClose}>
          Exit Archive
        </Button>
      </Modal.Footer>
    </Modal>
  );
}