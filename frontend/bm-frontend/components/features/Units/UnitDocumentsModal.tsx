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
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("electricity_meter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // Load documents
  // =========================
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

  // =========================
  // Upload document
  // =========================
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

  // =========================
  // Delete document
  // =========================
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
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">
              Documents – {unit.name}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">

            {/* ERROR */}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {/* UPLOAD */}
            <div className="row g-2 mb-4">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                >
                  {DOC_TYPES.map(d => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-5">
                <input
                  type="file"
                  className="form-control"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    // OPTIONAL: client-side validation
                    const allowed = ["application/pdf", "image/jpeg", "image/png"];
                    if (!allowed.includes(f.type)) {
                      setError("Only PDF, JPG, and PNG files are allowed");
                      return;
                    }

                    setError(null);
                    setFile(f);
                  }}
                />
              </div>

              <div className="col-md-3">
                <button
                  className="btn btn-success w-100"
                  onClick={upload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            {/* DOCUMENT LIST */}
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File</th>
                  <th>Uploaded</th>
                  <th width="80"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.doc_type}</td>
                    <td>
                      <a href={doc.file} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </td>
                    <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteDoc(doc.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {documents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No documents uploaded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}