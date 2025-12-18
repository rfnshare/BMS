import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  leaseId: number;
  leaseLabel?: string;
  onClose: () => void;
}

const DOC_TYPES = [
  { value: "agreement", label: "Agreement" },
  { value: "police_verification", label: "Police Verification" },
  { value: "handover", label: "Handover" },
  { value: "other", label: "Other" },
];

export default function LeaseDocumentsModal({ leaseId, leaseLabel, onClose }: Props) {
  const [docs, setDocs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("agreement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocs = async () => {
    try {
      const res = await api.get("/lease-documents/", {
        params: { lease: leaseId },
      });
      setDocs(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      setError("Only PDF, JPG, PNG files are allowed");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("lease", String(leaseId));
      fd.append("doc_type", docType);
      fd.append("file", file);

      await api.post("/lease-documents/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      loadDocs();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this document?")) return;

    try {
      await api.delete(`/lease-documents/${id}/`);
      loadDocs();
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
            <h5>
              Lease Documents {leaseLabel && <small>({leaseLabel})</small>}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">

            {error && <div className="alert alert-danger">{error}</div>}

            {/* UPLOAD */}
            <div className="row g-2 mb-4">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                >
                  {DOC_TYPES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-5">
                <input
                  type="file"
                  className="form-control"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="col-md-3">
                <button
                  className="btn btn-success w-100"
                  disabled={loading}
                  onClick={upload}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* LIST */}
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
                {docs.map(d => (
                  <tr key={d.id}>
                    <td>{d.doc_type}</td>
                    <td>
                      <a href={d.file} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </td>
                    <td>{new Date(d.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => remove(d.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {docs.length === 0 && (
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
