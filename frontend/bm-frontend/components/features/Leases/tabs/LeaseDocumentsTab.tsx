import { useState, useEffect } from "react";
import { LeaseDocumentService } from "../../../../logic/services/leaseDocumentService";

export default function LeaseDocumentsTab({ leaseId }: { leaseId: number | null }) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadDocs = async () => {
    if (!leaseId) return;
    const res = await LeaseDocumentService.list(leaseId);
    setFiles(res.results || res);
  };

  useEffect(() => { loadDocs(); }, [leaseId]);

  const handleFileSelect = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !leaseId) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("lease", String(leaseId));
    fd.append("file", file);
    fd.append("doc_type", "agreement"); // Default type

    try {
      await LeaseDocumentService.upload(fd);
      loadDocs();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">
      {!leaseId ? (
        <div className="text-center py-5 bg-light rounded-4 border-2 border-dashed">
          <i className="bi bi-lock-fill display-4 text-muted opacity-25"></i>
          <h5 className="mt-3 fw-bold text-muted">Uploads Locked</h5>
          <p className="small text-muted">Please "Save & Create Lease" in the previous tabs to unlock document uploads.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mb-0">Legal Archive</h6>
            <label className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm cursor-pointer">
              {uploading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-upload me-2"></i>}
              Upload Document
              <input type="file" hidden onChange={handleFileSelect} disabled={uploading} />
            </label>
          </div>

          <div className="row g-3">
            {files.map((doc) => (
              <div key={doc.id} className="col-md-6">
                <div className="p-3 border rounded-4 d-flex align-items-center gap-3 hover-bg-light transition-all">
                  <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
                    <i className="bi bi-file-earmark-pdf fs-4"></i>
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-bold small text-truncate">{doc.file.split('/').pop()}</div>
                    <a href={doc.file} target="_blank" rel="noreferrer" className="text-primary x-small text-decoration-none">
                      View Document <i className="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="text-center py-4 text-muted small italic">No documents uploaded yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}