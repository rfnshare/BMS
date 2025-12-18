import React, { useState } from 'react';

interface Renter {
  id: string;
  full_name: string;
}

interface Props {
  renter: Renter | null;
  onClose: () => void;
}

export default function RenterDocumentsModal({ renter, onClose }: Props) {
  // 1. Define the missing 'error' state
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Example handler to show how 'setError' is used
  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null); // Clear previous errors
      // Upload logic here...
    } catch (err) {
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 p-4">
            <h5 className="modal-title fw-bold">Documents: {renter?.full_name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Fix: 'error' is now defined via useState above */}
            {error && (
              <div className="alert alert-danger border-0 small">
                {error}
              </div>
            )}

            <div className="bg-light p-3 rounded-4 mb-4 border border-dashed text-center">
              <h6 className="fw-bold small text-muted text-uppercase mb-3">
                Upload New Document
              </h6>
              <input type="file" className="form-control form-control-sm mb-2" />
              <button
                className="btn btn-primary btn-sm w-100"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>

            <div className="document-list">
              <p className="text-muted small">No documents uploaded yet.</p>
            </div>
          </div>

          <div className="modal-footer border-0 p-4">
            <button className="btn btn-light rounded-3" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}