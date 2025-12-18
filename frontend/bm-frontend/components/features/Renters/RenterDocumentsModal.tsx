import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

interface Props {
  renter: any;
  onClose: () => void;
}

const DOC_TYPES = [
  { value: "nid", label: "NID" },
  { value: "passport", label: "Passport" },
  { value: "other", label: "Other" },
];

export default function RenterDocumentsModal({ renter, onClose }: Props) {
  const [docs, setDocs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("nid");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/documents/renter-documents/", {
        params: { renter: renter.id },
      });
      setDocs(res.data.results || res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!file) {
      setError("Select a file to upload");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("renter", String(renter.id)); // ✅ MUST be string
      fd.append("doc_type", docType);
      fd.append("file", file); // ✅ real File object

      await api.post("/documents/renter-documents/", fd);
      setFile(null);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5>Documents – {renter.full_name}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-2 mb-3">
              <div className="col-md-3">
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

              <div className="col-md-6">
                <input
                  type="file"
                  className="form-control"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="col-md-3">
                <button
                  className="btn btn-success w-100"
                  disabled={uploading}
                  onClick={upload}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File</th>
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
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          api
                            .delete(`/documents/renter-documents/${d.id}/`)
                            .then(load)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {docs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
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