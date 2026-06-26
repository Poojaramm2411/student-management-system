import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser } from "react-icons/fi";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/Detailpage.css";

export default function StudentDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const student = state?.student;

  if (!student) return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
      <p style={{ color: "var(--text-muted)" }}>No student data found.</p>
    </div>
  );

  const initials = student.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "ST";

  return (
    <div className="detail-page fade-in">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Students</button>
      <div className="detail-card">
        <div className="detail-card-header">
          <div className="detail-avatar">{initials}</div>
          <div>
            <div className="detail-main-name">{student.name}</div>
            <div className="detail-main-sub">{student.email}</div>
          </div>
          <div style={{ marginLeft: "auto" }}><StatusBadge status={student.status} /></div>
        </div>
        <div className="detail-body">
          <div className="detail-grid">
            {[
              { label: "Student ID", value: student.id },
              { label: "Student Code", value: student.studentCode },
              { label: "Email", value: student.email },
              { label: "Age", value: student.age || "—" },
              { label: "City", value: student.city || "—" },
              { label: "Batch", value: student.batchName || "—" },
              { label: "Batch ID", value: student.batchId || "—" },
              { label: "Status", value: <StatusBadge status={student.status} /> },
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