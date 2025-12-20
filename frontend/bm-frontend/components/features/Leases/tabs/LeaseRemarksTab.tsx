import React from "react";

export default function LeaseRemarksTab({ form, update }: any) {
  return (
    <div className="animate__animated animate__fadeIn">
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="bi bi-chat-left-text text-primary"></i>
          <h6 className="fw-bold mb-0 small text-uppercase">Internal Notes</h6>
        </div>

        <textarea
          className="form-control border-0 bg-light p-3 rounded-4 shadow-inner mb-2"
          rows={6}
          placeholder="Enter special terms, waivers, or notes..."
          value={form.remarks || ""}
          onChange={(e) => update("remarks", e.target.value)}
          style={{ resize: 'none' }}
        />

        <div className="text-end">
          <small className="text-muted x-small italic">
            {form.remarks?.length || 0} chars
          </small>
        </div>
      </div>
    </div>
  );
}