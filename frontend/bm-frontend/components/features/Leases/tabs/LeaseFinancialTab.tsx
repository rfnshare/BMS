import React from "react";

export default function LeaseFinancialTab({ form, update, totalRent }: any) {

  // Helper to get color based on deposit status
  const getStatusColor = (status: string) => {
    const map: any = {
      pending: "warning",
      paid: "success",
      adjusted: "info",
      refunded: "danger",
    };
    return map[status] || "secondary";
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="row g-4">

        {/* DEPOSIT AMOUNT CARD */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <label className="form-label small fw-bold text-muted text-uppercase">
              <i className="bi bi-shield-lock me-2"></i>Security Deposit *
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text border-0 bg-light">৳</span>
              <input
                type="number"
                className="form-control border-0 bg-light fw-bold"
                placeholder="0.00"
                value={form.security_deposit || ""}
                onChange={(e) => update("security_deposit", Number(e.target.value))}
              />
            </div>
            <p className="text-muted x-small mt-2 mb-0 italic">
              Typically equal to 1-2 months of the base rent.
            </p>
          </div>
        </div>

        {/* DEPOSIT STATUS CARD */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <label className="form-label small fw-bold text-muted text-uppercase">
              <i className="bi bi-flag me-2"></i>Deposit Status
            </label>
            <select
              className={`form-select form-select-lg border-0 bg-${getStatusColor(form.deposit_status)} bg-opacity-10 text-${getStatusColor(form.deposit_status)} fw-bold`}
              value={form.deposit_status || "pending"}
              onChange={(e) => update("deposit_status", e.target.value)}
            >
              <option value="pending">🟡 Pending (Not Received)</option>
              <option value="paid">🟢 Paid (In Bank)</option>
              <option value="adjusted">🔵 Adjusted (Deducted)</option>
              <option value="refunded">🔴 Refunded (Returned)</option>
            </select>
            <p className="text-muted x-small mt-2 mb-0 italic">
              Current state of the security funds.
            </p>
          </div>
        </div>

        {/* SUMMARY OVERVIEW CARD */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary bg-opacity-10 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1">Financial Summary Preview</h6>
                <p className="small text-muted mb-0">Aggregate numbers based on current configuration.</p>
              </div>
              <div className="text-end">
                <div className="row g-4">
                  <div className="col-auto border-end pe-4">
                    <div className="small text-muted text-uppercase fw-bold">Monthly Rent</div>
                    <div className="fs-4 fw-bold text-dark">৳{totalRent.toLocaleString()}</div>
                  </div>
                  <div className="col-auto">
                    <div className="small text-muted text-uppercase fw-bold">Initial Pay-in</div>
                    <div className="fs-4 fw-bold text-primary">
                      ৳{(totalRent + (Number(form.security_deposit) || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}