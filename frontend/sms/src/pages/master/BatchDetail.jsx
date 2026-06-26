import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLayers } from "react-icons/fi";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/Detailpage.css";

export default function BatchDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const batch = state?.batch;

  if (!batch) return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
      <p style={{ color: "var(--text-muted)" }}>No batch data found.</p>
    </div>
  );

  return (
    <div className="detail-page fade-in">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Batches</button>
      <div className="detail-card">
        <div className="detail-card-header">
          <div className="detail-avatar"><FiLayers /></div>
          <div>
            <div className="detail-main-name">{batch.batchName}</div>
            <div className="detail-main-sub">{batch.batchCode}</div>
          </div>
          <div style={{ marginLeft: "auto" }}><StatusBadge status={batch.status} /></div>
        </div>
        <div className="detail-body">
          <div className="detail-grid">
            {[
              { label: "Batch ID", value: batch.id },
              { label: "Batch Code", value: batch.batchCode },
              { label: "Instructor", value: batch.instructorName || "—" },
              { label: "Instructor ID", value: batch.instructorId || "—" },
              { label: "Start Date", value: batch.startDate || "—" },
              { label: "End Date", value: batch.endDate || "—" },
              { label: "Status", value: <StatusBadge status={batch.status} /> },
            ].map(({ label, value }) => (
              <div key={label} className="detail-field">
                <div className="detail-field-label">{label}</div>
                <div className="detail-field-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}