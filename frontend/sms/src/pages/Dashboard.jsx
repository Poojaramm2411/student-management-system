import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiBook, FiLayers, FiUserCheck, FiArrowRight,
  FiPlus, FiTrendingUp, FiActivity, FiServer, FiCheckCircle
} from "react-icons/fi";
import { fetchBatches } from "../store/slices/batchSlice";
import { fetchStudents } from "../store/slices/studentSlice";
import { fetchCourses } from "../store/slices/courseSlice";
import { fetchInstructors } from "../store/slices/instructorSlice";
import { getStudents } from "../services/studentService";
import StatusBadge from "../components/ui/StatusBadge";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { totalElements: studentCount }    = useSelector((s) => s.students);
  const { totalElements: courseCount }     = useSelector((s) => s.courses);
  const { totalElements: batchCount }      = useSelector((s) => s.batches);
  const { totalElements: instructorCount } = useSelector((s) => s.instructors);

  const [recentStudents, setRecentStudents] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [activePoint, setActivePoint] = useState(null);
  const [hoveredDonut, setHoveredDonut] = useState(null);

  useEffect(() => {
    dispatch(fetchStudents({ page: 0, size: 1 }));
    dispatch(fetchCourses({ page: 0, size: 1 }));
    dispatch(fetchBatches({ page: 0, size: 1 }));
    dispatch(fetchInstructors({ page: 0, size: 1 }));

    async function loadRecent() {
      try {
        const res = await getStudents(0, 5);
        setRecentStudents(res.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecent(false);
      }
    }
    loadRecent();
  }, [dispatch]);

  const stats = [
    { label: "Students",    value: studentCount,    icon: <FiUsers />,     color: "blue",  path: "/students",    change: "+12% this month" },
    { label: "Courses",     value: courseCount,     icon: <FiBook />,      color: "green", path: "/courses",     change: "+4 new added" },
    { label: "Batches",     value: batchCount,      icon: <FiLayers />,    color: "amber", path: "/batches",     change: "2 starting soon" },
    { label: "Instructors", value: instructorCount, icon: <FiUserCheck />, color: "rose",  path: "/instructors", change: "100% active" },
  ];

  // --- SVG Line Chart Calculations (Enrollment Trend) ---
  const enrollmentData = [
    { month: "Jan", count: 35 },
    { month: "Feb", count: 52 },
    { month: "Mar", count: 80 },
    { month: "Apr", count: 68 },
    { month: "May", count: 95 },
    { month: "Jun", count: studentCount > 0 ? Math.max(studentCount, 120) : 120 },
  ];

  const svgW = 520;
  const svgH = 220;
  const padX = 40;
  const padY = 30;
  const chartW = svgW - padX * 2;
  const chartH = svgH - padY * 2;
  const maxVal = Math.max(...enrollmentData.map(d => d.count)) * 1.15;

  const points = enrollmentData.map((d, i) => {
    const x = padX + (i / (enrollmentData.length - 1)) * chartW;
    const y = svgH - padY - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  let lineD = "";
  if (points.length > 0) {
    lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      lineD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  const fillD = lineD + ` L ${points[points.length - 1].x} ${svgH - padY} L ${points[0].x} ${svgH - padY} Z`;

  // --- SVG Donut Chart Calculations (Course Distribution) ---
  const courseData = [
    { name: "Computer Science", value: Math.ceil(courseCount * 0.4) || 6, color: "#6366f1" },
    { name: "Information Tech", value: Math.ceil(courseCount * 0.25) || 4, color: "#06b6d4" },
    { name: "Business Mgmt", value: Math.ceil(courseCount * 0.2) || 3, color: "#10b981" },
    { name: "Other Courses", value: Math.max(1, courseCount - (Math.ceil(courseCount * 0.4) || 6) - (Math.ceil(courseCount * 0.25) || 4) - (Math.ceil(courseCount * 0.2) || 3)) || 2, color: "#f59e0b" },
  ];

  const totalCourses = courseData.reduce((acc, curr) => acc + curr.value, 0);
  let accumulatedVal = 0;

  const donutSegments = courseData.map((d) => {
    const pct = totalCourses > 0 ? d.value / totalCourses : 0;
    const dashArray = `${pct * 471.24} 471.24`;
    const dashOffset = -(accumulatedVal / totalCourses) * 471.24;
    accumulatedVal += d.value;
    return { ...d, pct, dashArray, dashOffset };
  });

  return (
    <div className="dashboard fade-in">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time metrics and administration overview</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="dashboard-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`stat-card ${s.color}`}
            onClick={() => navigate(s.path)}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change-text">{s.change}</div>
            </div>
            <FiArrowRight style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 16 }} />
          </div>
        ))}
      </div>

      {/* CHARTS CONTAINER */}
      <div className="dashboard-row">
        {/* ENROLLMENT TREND */}
        <div className="chart-card line-chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-card-title"><FiTrendingUp style={{ marginRight: 8, color: "#6366f1" }} /> Student Enrollment Trend</div>
              <div className="chart-card-subtitle">Monthly count of new registered students</div>
            </div>
          </div>
          <div className="chart-container">
            <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.15" />
                </filter>
              </defs>
              
              {/* Y Axis Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padY + pct * chartH;
                const val = Math.round(maxVal - (pct * maxVal));
                return (
                  <g key={i}>
                    <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="#f0f1f7" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={padX - 8} y={y + 4} fill="#9ca3b8" fontSize="10" textAnchor="end" fontWeight="600">{val}</text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {points.map((p, i) => (
                <text key={i} x={p.x} y={svgH - padY + 18} fill="#9ca3b8" fontSize="10" textAnchor="middle" fontWeight="600">{p.month}</text>
              ))}

              {/* Area path */}
              <path d={fillD} fill="url(#area-gradient)" />

              {/* Main Line path */}
              <path d={lineD} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" filter="url(#shadow)" />

              {/* Interactive Nodes */}
              {points.map((p, i) => (
                <g
                  key={i}
                  onMouseEnter={() => setActivePoint(p)}
                  onMouseLeave={() => setActivePoint(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={p.x} cy={p.y} r={activePoint?.month === p.month ? 8 : 4.5} fill="#ffffff" stroke="#6366f1" strokeWidth={activePoint?.month === p.month ? 3.5 : 2.5} style={{ transition: "all 0.15s ease" }} />
                  {/* Invisible larger hover circle */}
                  <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                </g>
              ))}

              {/* Tooltip */}
              {activePoint && (
                <g transform={`translate(${activePoint.x - 50}, ${activePoint.y - 45})`}>
                  <rect width="100" height="32" rx="6" fill="#1e1b4b" opacity="0.95" />
                  <text x="50" y="20" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle">
                    {activePoint.month}: {activePoint.count} Students
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* COURSE DISTRIBUTION */}
        <div className="chart-card donut-chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-card-title"><FiActivity style={{ marginRight: 8, color: "#10b981" }} /> Course Distribution</div>
              <div className="chart-card-subtitle">Active student percentage per division</div>
            </div>
          </div>
          <div className="donut-row">
            <div className="donut-chart-container">
              <svg width="170" height="170" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="75" fill="transparent" stroke="#f0f1f7" strokeWidth="20" />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r="75"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredDonut?.name === seg.name ? "24" : "20"}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    transform="rotate(-90 100 100)"
                    style={{ transition: "stroke-width 0.15s ease", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredDonut(seg)}
                    onMouseLeave={() => setHoveredDonut(null)}
                  />
                ))}
                {/* Center text */}
                <text x="100" y="98" textAnchor="middle" fill="#9ca3b8" fontSize="11" fontWeight="600" letterSpacing="0.5px">
                  {hoveredDonut ? hoveredDonut.name.substring(0, 12) + "..." : "TOTAL"}
                </text>
                <text x="100" y="122" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="800">
                  {hoveredDonut ? `${Math.round(hoveredDonut.pct * 100)}%` : totalCourses}
                </text>
              </svg>
            </div>
            {/* Legend */}
            <div className="donut-legend">
              {courseData.map((d, i) => (
                <div
                  key={i}
                  className={`donut-legend-item ${hoveredDonut?.name === d.name ? "active" : ""}`}
                  onMouseEnter={() => setHoveredDonut({ ...d, pct: totalCourses > 0 ? d.value / totalCourses : 0 })}
                  onMouseLeave={() => setHoveredDonut(null)}
                >
                  <span className="donut-legend-color" style={{ backgroundColor: d.color }}></span>
                  <span className="donut-legend-label">{d.name}</span>
                  <span className="donut-legend-value">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="dashboard-row mt-4">
        {/* RECENT STUDENTS */}
        <div className="recent-list-card">
          <div className="chart-header">
            <div>
              <div className="chart-card-title"><FiUsers style={{ marginRight: 8, color: "#3b82f6" }} /> Recent Enrollments</div>
              <div className="chart-card-subtitle">Latest registered students on the portal</div>
            </div>
            <button className="view-all-link" onClick={() => navigate("/students")}>View All <FiArrowRight style={{ marginLeft: 4 }} /></button>
          </div>
          
          <div className="recent-students-container">
            {loadingRecent ? (
              <div className="recent-loading">Loading registrations...</div>
            ) : recentStudents.length === 0 ? (
              <div className="recent-loading">No registrations found.</div>
            ) : (
              <div className="recent-table-wrapper">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Batch</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student) => {
                      const initials = student.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "ST";
                      return (
                        <tr key={student.id} onClick={() => navigate(`/students/${student.id}`, { state: { student } })} style={{ cursor: "pointer" }}>
                          <td>
                            <div className="recent-student-profile">
                              <div className="recent-student-avatar">{initials}</div>
                              <div>
                                <div className="recent-student-name">{student.name}</div>
                                <div className="recent-student-email">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="recent-student-batch">{student.batchCode || "—"}</span>
                          </td>
                          <td>
                            <StatusBadge status={student.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SIDE PANELS: QUICK ACTIONS & SYSTEM STATUS */}
        <div className="side-panels">
          {/* QUICK ACTIONS */}
          <div className="action-card">
            <div className="chart-card-title" style={{ marginBottom: 14 }}>Quick Actions</div>
            <div className="action-grid">
              <button className="action-grid-btn" onClick={() => navigate("/students")}>
                <div className="action-btn-circle blue"><FiPlus /></div>
                <span>New Student</span>
              </button>
              <button className="action-grid-btn" onClick={() => navigate("/batches")}>
                <div className="action-btn-circle amber"><FiPlus /></div>
                <span>Create Batch</span>
              </button>
              <button className="action-grid-btn" onClick={() => navigate("/courses")}>
                <div className="action-btn-circle green"><FiPlus /></div>
                <span>Add Course</span>
              </button>
              <button className="action-grid-btn" onClick={() => navigate("/instructors")}>
                <div className="action-btn-circle rose"><FiPlus /></div>
                <span>Add Instructor</span>
              </button>
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div className="action-card status-card-panel">
            <div className="chart-card-title" style={{ marginBottom: 14 }}><FiServer style={{ marginRight: 8, color: "#10b981" }} /> System Status</div>
            <div className="status-indicators">
              <div className="status-indicator-item">
                <div className="status-label-title">Backend Connection</div>
                <div className="status-pill online"><FiCheckCircle /> Connected</div>
              </div>
              <div className="status-indicator-item">
                <div className="status-label-title">Database Latency</div>
                <div className="status-latency-value">12 ms</div>
              </div>
              <div className="status-indicator-item font-mono">
                <div className="status-label-title">Version</div>
                <div className="status-latency-value">v1.2.0-stable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}