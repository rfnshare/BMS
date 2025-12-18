import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  leaseId: number;
  onClose: () => void;
  leaseLabel?: string; // Optional label for UI context
}

export default function LeaseDocumentsModal({ leaseId, onClose, leaseLabel }: Props) {
  const [docs, setDocs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("agreement");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Match these exactly with your Django Model DOC_TYPES
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
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, [leaseId]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    // Logic: Files must be sent via FormData for Multipart encoding
    const fd = new FormData();
    fd.append("lease", String(leaseId));
    fd.append("doc_type", docType);
    fd.append("file", file);

    try {
      await api.post("/documents/lease-documents/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFile(null); // Clear input after success
      loadDocs();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this legal document?")) return;

    try {
      await api.delete(`/documents/lease-documents/${id}/`);
      loadDocs();
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered animate__animated animate__zoomIn">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

          {/* HEADER */}
          <div className="modal-header bg-dark text-white p-4 border-0">
            <div>
              <h5 className="fw-bold mb-0">Legal Documents Archive</h5>
              <small className="opacity-75">{leaseLabel || `Lease #${leaseId}`}</small>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light bg-opacity-50">

            {/* UPLOAD SECTION */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <label className="form-label small fw-bold text-muted text-uppercase mb-3">
                <i className="bi bi-cloud-upload me-2"></i>Upload New Attachment
              </label>
              <div className="row g-3">
                <div className="col-md-5">
                  <select
                    className="form-select border-0 bg-light p-2 rounded-3"
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                  >
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-7">
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control border-0 bg-light p-2 rounded-start-3"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    <button
                      className="btn btn-primary fw-bold px-4"
                      disabled={!file || uploading}
                      onClick={handleUpload}
                    >
                      {uploading ? <span className="spinner-border spinner-border-sm"></span> : 'UPLOAD'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCUMENT LIST */}
            <div className="row g-3">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
              ) : docs.length === 0 ? (
                <div className="text-center py-5 text-muted small italic">
                   <i className="bi bi-folder-x display-4 opacity-25"></i>
                   <p className="mt-2">No documents have been uploaded for this lease yet.</p>
                </div>
              ) : docs.map(d => (
                <div key={d.id} className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white hover-shadow transition-all">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3 text-primary">
                         <i className={`bi bi-file-earmark-${d.file.endsWith('.pdf') ? 'pdf' : 'image'} fs-3`}></i>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                         <div className="fw-bold text-truncate small text-uppercase" style={{ fontSize: '0.65rem' }}>
                            {d.doc_type?.replace('_', ' ')}
                         </div>
                         <a
                           href={d.file}
                           target="_blank"
                           rel="noreferrer"
                           className="small text-decoration-none fw-bold text-primary"
                         >
                           Download / View <i className="bi bi-box-arrow-up-right ms-1"></i>
                         </a>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                        onClick={() => handleDelete(d.id)}
                        title="Delete Document"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer border-0 p-3 bg-white">
            <button className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={onClose}>Finish Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}