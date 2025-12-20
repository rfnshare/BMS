import React from "react";

export default function LeaseFinancialTab({ form, update, totalRent }: any) {

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
      <div className="row g-3">

        {/* DEPOSIT AMOUNT CARD */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <label className="form-label x-small fw-bold text-muted text-uppercase">
              <i className="bi bi-shield-lock me-2"></i>Security Deposit *
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text border-0 bg-light">৳</span>
              <input
                type="number"
                inputMode="decimal"
                className="form-control border-0 bg-light fw-bold fs-4"
                placeholder="0.00"
                value={form.security_deposit || ""}
                onChange={(e) => update("security_deposit", Number(e.target.value))}
              />
            </div>
            <p className="text-muted x-small mt-2 mb-0 italic">
              Usually 1-2 months rent.
            </p>
          </div>
        </div>

        {/* DEPOSIT STATUS CARD */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <label className="form-label x-small fw-bold text-muted text-uppercase">
              <i className="bi bi-flag me-2"></i>Deposit Status
            </label>
            <select
              className={`form-select form-select-lg border-0 bg-${getStatusColor(form.deposit_status)} bg-opacity-10 text-${getStatusColor(form.deposit_status)} fw-bold`}
              value={form.deposit_status || "pending"}
              onChange={(e) => update("deposit_status", e.target.value)}
            >
              <option value="pending">🟡 Pending</option>
              <option value="paid">🟢 Paid</option>
              <option value="adjusted">🔵 Adjusted</option>
              <option value="refunded">🔴 Refunded</option>
            </select>
            <p className="text-muted x-small mt-2 mb-0 italic">
              Current fund status.
            </p>
          </div>
        </div>

        {/* SUMMARY OVERVIEW CARD */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10 border-start border-4 border-primary">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h6 className="fw-bold mb-1">Financial Summary</h6>
                <p className="x-small text-muted mb-0">Total calculated cost.</p>
              </div>
              <div className="text-start text-md-end">
                <div className="row g-3">
                  <div className="col-6 col-md-auto border-end border-dark-subtle pe-3">
                    <div className="x-small text-muted text-uppercase fw-bold">Monthly Rent</div>
                    <div className="h5 fw-bold text-dark mb-0">৳{totalRent.toLocaleString()}</div>
                  </div>
                  <div className="col-6 col-md-auto">
                    <div className="x-small text-muted text-uppercase fw-bold">Upfront Total</div>
                    <div className="h5 fw-bold text-primary mb-0">
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