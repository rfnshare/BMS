import React from "react";

export default function LeaseRemarksTab({ form, update }: any) {
  return (
    <div className="animate__animated animate__fadeIn">
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
            <i className="bi bi-chat-left-text fs-5"></i>
          </div>
          <h6 className="fw-bold mb-0">Internal Remarks & Special Terms</h6>
        </div>

        <p className="text-muted small mb-4">
          Use this section to document any specific arrangements, late fee waivers,
          or maintenance promises made to the renter during the negotiation.
        </p>

        <textarea
          className="form-control border-0 bg-light p-4 rounded-4 shadow-inner"
          rows={8}
          placeholder="Enter special terms, parking arrangements, or historical notes here..."
          value={form.remarks || ""}
          onChange={(e) => update("remarks", e.target.value)}
          style={{ resize: 'none' }}
        />

        <div className="text-end mt-2">
          <small className="text-muted italic">
            Characters: {form.remarks?.length || 0} (Internal view only)
          </small>
        </div>
      </div>
    </div>
  );
}