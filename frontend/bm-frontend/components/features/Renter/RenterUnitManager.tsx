import { useEffect, useState } from "react";
import api from "../../../logic/services/apiClient";
import { getErrorMessage } from "../../../logic/utils/getErrorMessage";

export default function RenterUnitManager() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyUnits = async () => {
    setLoading(true);
    try {
      // Backend automatically filters based on the Renter's Token
      // Only units assigned to 'Me' will be returned
      const res = await api.get("/buildings/units/");
      setUnits(res.data.results || res.data);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMyUnits(); }, []);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary shadow-sm"></div>
      <p className="mt-2 text-muted small">Fetching unit details...</p>
    </div>
  );

  if (units.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light animate__animated animate__fadeIn">
        <i className="bi bi-building-exclamation display-4 text-muted opacity-50"></i>
        <h5 className="mt-3 fw-bold">No Assigned Units</h5>
        <p className="text-muted">You are currently not assigned to any property units.</p>
      </div>
    );
  }

  return (
    <div className="row g-4 animate__animated animate__fadeIn">
      {units.map((unit) => (
        <div key={unit.id} className="col-lg-6 mx-auto">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">

            {/* 1. UNIT HEADER */}
            <div className="card-header bg-primary text-white p-4 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="fw-bold mb-0">{unit.name}</h3>
                  <div className="small opacity-75 fw-medium text-uppercase ls-1">Current Residence</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                   <i className="bi bi-building-check fs-3"></i>
                </div>
              </div>
            </div>

            {/* 2. UNIT BODY DATA */}
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-4 text-center">
                    <div className="x-small text-muted text-uppercase fw-bold mb-1">Floor</div>
                    <div className="h5 fw-bold mb-0">{unit.floor || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-4 text-center">
                    <div className="x-small text-muted text-uppercase fw-bold mb-1">Total Area</div>
                    <div className="h5 fw-bold mb-0">{unit.total_area || '0'} SFT</div>
                  </div>
                </div>
              </div>

              {/* PROPERTY SPECS */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold text-muted small text-uppercase mb-3">Unit Specifications</h6>
                <div className="vstack gap-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small"><i className="bi bi-door-open me-2"></i>Bedrooms</span>
                    <span className="fw-bold text-dark">{unit.bed_room || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small"><i className="bi bi-droplet me-2"></i>Bathrooms</span>
                    <span className="fw-bold text-dark">{unit.bath_room || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small"><i className="bi bi-square me-2"></i>Unit Type</span>
                    <span className="badge bg-light text-primary border border-primary-subtle rounded-pill">
                      {unit.unit_type || 'Residential'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. UNIT FOOTER */}
            <div className="card-footer bg-light border-0 p-3 px-4 text-center">
              <span className="small text-muted">Last Updated: <strong>{new Date(unit.updated_at).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}