import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Renter, RenterService } from "../../../logic/services/renterService";

export default function RenterProfileManager() {
  const router = useRouter();
  const { id } = router.query;

  const [renter, setRenter] = useState<Renter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await RenterService.get(Number(id));
        setRenter(data);
      } catch {
        setError("Failed to load renter profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router.isReady, id]);

  if (loading) return <div>Loading renter profile...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!renter) return null;

  const InfoRow = ({ label, value }: { label: string; value?: any }) => (
    <div className="col-md-6 mb-2">
      <div className="fw-semibold text-muted small">{label}</div>
      <div>{value || "-"}</div>
    </div>
  );

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="card mb-4">
        <div className="card-body d-flex align-items-center gap-4">
          <img
            src={renter.profile_pic || "/avatar.png"}
            alt={renter.full_name}
            className="rounded-circle border"
            style={{ width: 96, height: 96, objectFit: "cover" }}
          />

          <div className="flex-grow-1">
            <h4 className="mb-1">{renter.full_name}</h4>
            <div className="text-muted">{renter.phone_number}</div>
            {renter.email && <div className="text-muted">{renter.email}</div>}
            <div className="mt-1 small">
              Notification: <strong>{renter.notification_preference}</strong>
            </div>
          </div>

          <span
            className={`badge fs-6 ${
              renter.status === "active"
                ? "bg-success"
                : renter.status === "former"
                ? "bg-secondary"
                : "bg-warning text-dark"
            }`}
          >
            {renter.status}
          </span>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Personal Information</div>
        <div className="card-body row">
          <InfoRow label="Date of Birth" value={renter.date_of_birth} />
          <InfoRow label="Gender" value={renter.gender} />
          <InfoRow label="Marital Status" value={renter.marital_status} />
          <InfoRow label="Nationality" value={renter.nationality} />
          <InfoRow label="Alternate Phone" value={renter.alternate_phone} />
        </div>
      </div>

      {/* ADDRESS */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Address Information</div>
        <div className="card-body row">
          <InfoRow label="Present Address" value={renter.present_address} />
          <InfoRow label="Permanent Address" value={renter.permanent_address} />
        </div>
      </div>

      {/* RESIDENCE HISTORY */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Residence History</div>
        <div className="card-body row">
          <InfoRow label="Previous Address" value={renter.previous_address} />
          <InfoRow label="From Date" value={renter.from_date} />
          <InfoRow label="To Date" value={renter.to_date} />
          <InfoRow label="Landlord Name" value={renter.landlord_name} />
          <InfoRow label="Landlord Phone" value={renter.landlord_phone} />
          <InfoRow label="Reason for Leaving" value={renter.reason_for_leaving} />
        </div>
      </div>

      {/* EMERGENCY & WORK */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Emergency & Occupation</div>
        <div className="card-body row">
          <InfoRow label="Emergency Contact Name" value={renter.emergency_contact_name} />
          <InfoRow label="Relation" value={renter.relation} />
          <InfoRow label="Emergency Phone" value={renter.emergency_contact_phone} />
          <InfoRow label="Occupation" value={renter.occupation} />
          <InfoRow label="Company" value={renter.company} />
          <InfoRow label="Office Address" value={renter.office_address} />
          <InfoRow label="Monthly Income" value={renter.monthly_income} />
        </div>
      </div>

      {/* DOCUMENTS */}
      <div className="card mb-4">
        <div className="card-header fw-bold">Documents</div>
        <div className="card-body d-flex gap-4 flex-wrap">
          {renter.profile_pic && (
            <div>
              <div className="fw-semibold mb-1">Profile Picture</div>
              <img
                src={renter.profile_pic}
                className="img-thumbnail"
                style={{ maxHeight: 180 }}
              />
            </div>
          )}

          {renter.nid_scan && (
            <div>
              <div className="fw-semibold mb-1">NID Scan</div>
              {renter.nid_scan.endsWith(".pdf") ? (
                <a href={renter.nid_scan} target="_blank" rel="noreferrer">
                  View NID PDF
                </a>
              ) : (
                <img
                  src={renter.nid_scan}
                  className="img-thumbnail"
                  style={{ maxHeight: 180 }}
                />
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}