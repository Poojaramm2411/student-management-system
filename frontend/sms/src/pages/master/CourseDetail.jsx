import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBook } from "react-icons/fi";
import StatusBadge from "../../components/ui/StatusBadge";
import "../../styles/Detailpage.css";

const formatDuration = (dur) => {
  if (!dur) return "—";
  let str = String(dur).trim();
  if (str.toLowerCase().endsWith("months")) {
    return str;
  }
  if (str.toLowerCase().endsWith("month")) {
    return str + "s";
  }
  if (str.toLowerCase().endsWith("mo")) {
    return str.substring(0, str.length - 2).trim() + " months";
  }
  if (/^\d+$/.test(str)) {
    return `${str} months`;
  }
  return str;
};

export default function CourseDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  if (!course) return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
      <p style={{ color: "var(--text-muted)" }}>No course data found.</p>
    </div>
  );

  return (
    <div className="detail-page fade-in">
      <button className="detail-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Courses</button>
      <div className="detail-card">
        <div className="detail-card-header">
          <div className="detail-avatar"><FiBook /></div>
          <div>
            <div className="detail-main-name">{course.courseName}</div>
            <div className="detail-main-sub">{course.courseCode}</div>
          </div>
          <div style={{ marginLeft: "auto" }}><StatusBadge status={course.status} /></div>
        </div>
        <div className="detail-body">
          <div className="detail-grid">
            {[
              { label: "Course ID", value: course.id },
              { label: "Course Code", value: course.courseCode },
              { label: "Department", value: course.department || "—" },
              { label: "Duration", value: formatDuration(course.duration) },
              { label: "Fees", value: course.fee ? `₹${Number(course.fee).toLocaleString("en-IN")}` : "—" },
              { label: "Batch", value: course.batchName || "—" },
              { label: "Batch ID", value: course.batchId || "—" },
              { label: "Description", value: course.description || "—" },
              { label: "Status", value: <StatusBadge status={course.status} /> },
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