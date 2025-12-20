import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

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
  // ✅ States defined correctly
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("electricity_meter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const res = await api.get("documents/unit-documents/", {
        params: { unit: unit.id },
      });
      setDocuments(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const upload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("unit", unit.id);
      formData.append("doc_type", docType);
      formData.append("file", file);

      await api.post("documents/unit-documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
    setError(null);
    try {
      await api.delete(`documents/unit-documents/${id}/`);
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">

          {/* HEADER */}
          <div className="modal-header bg-dark text-white rounded-top-4 border-0">
            <h5 className="fw-bold mb-0 px-2">📁 Documents: {unit.name}</h5>
            <button className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* ERROR ALERT */}
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4 small">
                ⚠️ {error}
              </div>
            )}

            {/* UPLOAD ZONE (Visual improvement) */}
            <div className="card border-0 bg-light p-4 mb-4 rounded-4 shadow-sm" style={{ border: '2px dashed #dee2e6' }}>
              <h6 className="fw-bold mb-3 text-muted small text-uppercase">Quick Upload Section</h6>
              <div className="row g-2 justify-content-center">
                <div className="col-md-4">
                  <select className="form-select border-0 shadow-sm" value={docType} onChange={e => setDocType(e.target.value)}>
                    {DOC_TYPES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <input type="file" className="form-control border-0 shadow-sm" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-success w-100 fw-bold shadow-sm" onClick={upload} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : "Upload"}
                  </button>
                </div>
              </div>
              <small className="mt-3 text-muted italic small">Allowed formats: PDF, JPG, PNG (Max 5MB)</small>
            </div>

            {/* DOCUMENT LIST */}
            <h6 className="fw-bold text-muted small text-uppercase mb-3 px-1">Stored Documents</h6>
            <div className="list-group list-group-flush rounded-4 border overflow-hidden shadow-sm">
              {documents.length === 0 ? (
                <div className="p-5 text-center text-muted bg-white small italic">No documents found for this unit.</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center p-3 bg-white hover-light">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle text-primary p-2 rounded-3 me-3">📄</div>
                      <div>
                        <span className="badge bg-secondary-subtle text-secondary me-2 text-uppercase font-monospace" style={{ fontSize: '0.7rem' }}>
                          {doc.doc_type.replace('_',' ')}
                        </span>
                        <div className="small text-muted mt-1">Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="btn-group shadow-sm">
                      <a href={doc.file} target="_blank" rel="noreferrer" className="btn btn-sm btn-white border px-3 fw-bold">View</a>
                      <button className="btn btn-sm btn-outline-danger border" onClick={() => deleteDoc(doc.id)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="modal-footer border-0 bg-light rounded-bottom-4">
            <button className="btn btn-secondary px-4 fw-bold" onClick={onClose}>Close Manager</button>
          </div>
        </div>
      </div>
    </div>
  );
}