import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUserCheck } from "react-icons/fi";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/Detailpage.css";

export default function InstructorDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const instructor = state?.instructor;

  if (!instructor) return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
      <p style={{ color: "var(--text-muted)" }}>No instructor data found.</p>
    </div>
  );

  const initials = instructor.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "IN";

  return (
    <div className="detail-page fade-in">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Instructors</button>
      <div className="detail-card">
        <div className="detail-card-header">
          <div className="detail-avatar">{initials}</div>
          <div>
            <div className="detail-main-name">{instructor.name}</div>
            <div className="detail-main-sub">{instructor.email}</div>
          </div>
          <div style={{ marginLeft: "auto" }}><StatusBadge status={instructor.status} /></div>
        </div>
        <div className="detail-body">
          <div className="detail-grid">
            {[
              { label: "Instructor ID", value: instructor.id },
              { label: "Email", value: instructor.email },
              { label: "Phone", value: instructor.phone || "—" },
              { label: "Specialization", value: instructor.specialization || "—" },
              { label: "Status", value: <StatusBadge status={instructor.status} /> },
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