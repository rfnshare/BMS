import { useEffect, useState } from "react";
import { Renter, RenterService } from "../../../logic/services/renterService";
import RenterModal from "./RenterModal";
import RenterDocumentsModal from "./RenterDocumentsModal";
import Link from "next/link";

export default function RenterManager() {
  const [renters, setRenters] = useState<Renter[]>([]);
  const [editing, setEditing] = useState<Renter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [docRenter, setDocRenter] = useState<Renter | null>(null);

  const load = async () => {
    const res = await RenterService.list();
    setRenters(res.results || res);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4>Renters</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Renter
        </button>
      </div>

      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th width="60">Photo</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th width="220">Actions</th>
          </tr>
        </thead>

        <tbody>
          {renters.map(r => (
            <tr key={r.id ?? Math.random()} className="align-middle">

              {/* PROFILE PIC (clickable if id exists) */}
              <td>
                {r.id ? (
                  <Link href={`/admin-dashboard/renters/${r.id}`}>
                    {r.profile_pic ? (
                      <img
                        src={r.profile_pic}
                        alt={r.full_name}
                        className="rounded-circle border"
                        style={{
                          width: "42px",
                          height: "42px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {r.full_name
                          .split(" ")
                          .map(n => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                  </Link>
                ) : null}
              </td>

              {/* NAME (clickable if id exists) */}
              <td>
                {r.id ? (
                  <Link
                    href={`/admin-dashboard/renters/${r.id}`}
                    className="fw-semibold text-decoration-none text-dark"
                  >
                    {r.full_name}
                  </Link>
                ) : (
                  <span className="fw-semibold">{r.full_name}</span>
                )}

                {r.email && (
                  <div className="text-muted small">{r.email}</div>
                )}
              </td>

              {/* PHONE */}
              <td>{r.phone_number}</td>

              {/* STATUS */}
              <td>
                <span
                  className={`badge ${
                    r.status === "active"
                      ? "bg-success"
                      : r.status === "former"
                      ? "bg-secondary"
                      : "bg-warning text-dark"
                  }`}
                >
                  {r.status}
                </span>
              </td>

              {/* ACTIONS (unchanged) */}
              <td>
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => setDocRenter(r)}
                >
                  Documents
                </button>

                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => {
                    setEditing(r);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    if (!confirm("Delete renter?")) return;
                    await RenterService.destroy(r.id);
                    load();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <RenterModal
          renter={editing}
          onClose={() => {
            setEditing(null);
            setShowModal(false);
          }}
          onSaved={load}
        />
      )}

      {docRenter && (
        <RenterDocumentsModal
          renter={docRenter}
          onClose={() => setDocRenter(null)}
        />
      )}
    </>
  );
}