import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, IconButton, Tooltip, Chip, Breadcrumbs, Link,
  TextField, InputAdornment, Popper, Paper, ClickAwayListener, Badge, CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Logout, Person, School, AdminPanelSettings, ChevronRight, Home, LightMode, DarkMode,
  Search, NotificationsNone, People, Layers, MenuBook, Refresh, PaidOutlined, AssignmentLateOutlined, LoginOutlined
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useColorMode } from "../context/ColorModeContext";
import { fetchStudents } from "../store/Slices/studentSlice";
import { fetchCourses } from "../store/Slices/courseSlice";
import { fetchBatches } from "../store/Slices/batchSlice";
import { fetchInstructors } from "../store/Slices/instructorSlice";
import { fetchAssignments } from "../store/Slices/assignmentSlice";
import { fetchEnrollments } from "../store/Slices/enrollmentSlice";
import { getRecentLogins } from "../services/activityService";

// static route segment -> readable label
const ROUTE_LABELS = {
  dashboard: "Dashboard",
  batches: "Batches",
  students: "Students",
  courses: "Courses",
  instructors: "Instructors",
  assignments: "Assignments",
  enrollment: "Enrollment",
  submissions: "Submissions",
};

// pulls a friendly name for dynamic segments (ids) from the state your
// pages already pass via navigate(path, { state: { batch/student/... } })
function resolveDynamicLabel(segment, state) {
  if (!state) return segment;
  const candidates = [
    state.batch, state.student, state.course, state.instructor, state.assignment,
  ];
  for (const item of candidates) {
    if (item && String(item.id) === segment) {
      return item.batchName || item.name || item.courseName || item.title || segment;
    }
  }
  return segment;
}

function useBreadcrumbs() {
  const location = useLocation();
  return useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", path: "/dashboard", isHome: true }];
    let path = "";
    segments.forEach((seg) => {
      path += "/" + seg;
      const label = ROUTE_LABELS[seg] || resolveDynamicLabel(seg, location.state);
      crumbs.push({ label, path });
    });
    // de-dupe consecutive "Home"/"Dashboard" crumb when already on /dashboard
    if (crumbs.length > 1 && crumbs[1].path === "/dashboard") crumbs.splice(1, 1);
    return crumbs;
  }, [location.pathname, location.state]);
}

export default function Navbar() {
  const [anchor, setAnchor] = useState(null);
  const { handleLogout, admin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const breadcrumbs = useBreadcrumbs();
  const { mode, toggleColorMode } = useColorMode();

  const initials = admin?.name
    ? admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  // ---------------- GLOBAL SEARCH ----------------
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState({ students: [], batches: [], courses: [], instructors: [] });
  const searchAnchorRef = useRef(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults({ students: [], batches: [], courses: [], instructors: [] });
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [studentsRes, batchesRes, coursesRes, instructorsRes] = await Promise.all([
          dispatch(fetchStudents({ page: 0, size: 5, search: term })),
          dispatch(fetchBatches({ page: 0, size: 5, search: term })),
          dispatch(fetchCourses({ page: 0, size: 5, search: term })),
          dispatch(fetchInstructors({ page: 0, size: 5, search: term })),
        ]);
        setResults({
          students: fetchStudents.fulfilled.match(studentsRes) ? studentsRes.payload.content || [] : [],
          batches: fetchBatches.fulfilled.match(batchesRes) ? batchesRes.payload.content || [] : [],
          courses: fetchCourses.fulfilled.match(coursesRes) ? coursesRes.payload.content || [] : [],
          instructors: fetchInstructors.fulfilled.match(instructorsRes) ? instructorsRes.payload.content || [] : [],
        });
      } catch {
        setResults({ students: [], batches: [], courses: [], instructors: [] });
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const totalResults =
    results.students.length + results.batches.length + results.courses.length + results.instructors.length;

  const goToResult = (path, stateKey, item) => {
    navigate(path, { state: { [stateKey]: item } });
    setQuery("");
    setSearchOpen(false);
  };

  // ---------------- NOTIFICATIONS ----------------
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const [pendingFees, setPendingFees] = useState([]);
  const [ungradedAssignments, setUngradedAssignments] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const [assignmentsRes, enrollmentsRes, logins] = await Promise.all([
        dispatch(fetchAssignments({ page: 0, size: 100 })),
        dispatch(fetchEnrollments({ page: 0, size: 100, feeStatus: "All" })),
        getRecentLogins(5).catch(() => []), // isolated try/catch: a failure here shouldn't break the other two
      ]);

      const assignments = fetchAssignments.fulfilled.match(assignmentsRes) ? assignmentsRes.payload.content || [] : [];
      const enrollments = fetchEnrollments.fulfilled.match(enrollmentsRes) ? enrollmentsRes.payload.content || [] : [];

      setUngradedAssignments(
        assignments.filter((a) => (a.totalSubmissions ?? 0) - (a.gradedSubmissions ?? 0) > 0)
      );
      setPendingFees(
        enrollments.filter((e) => e.feeStatus === "Pending" || e.feeStatus === "Partial")
      );
      setLoginActivity(Array.isArray(logins) ? logins : []);
    } catch {
      setUngradedAssignments([]);
      setPendingFees([]);
      setLoginActivity([]);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(); // one-time fetch on load; use the refresh button for updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notifCount = ungradedAssignments.length + pendingFees.length + loginActivity.length;

  // relative time helper for login entries, e.g. "5 min ago", "2 hr ago"
  const timeAgo = (isoString) => {
    if (!isoString) return "";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.85),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            onClick={() => navigate("/dashboard")}
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
              cursor: "pointer",
            }}
          >
            <School sx={{ fontSize: 22, color: "#FFFFFF" }} />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "#E2E8F0", my: 1 }} />

          <Breadcrumbs
            separator={<ChevronRight sx={{ fontSize: 16, color: "#CBD5E1" }} />}
            maxItems={4}
            sx={{ minWidth: 0, "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
          >
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return isLast ? (
                <Typography
                  key={crumb.path + i}
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#0F172A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.path + i}
                  component="button"
                  underline="hover"
                  onClick={() => navigate(crumb.path)}
                  sx={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    "&:hover": { color: "#4F46E5" },
                  }}
                >
                  {crumb.isHome && <Home sx={{ fontSize: 15 }} />}
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* GLOBAL SEARCH */}
        <Box sx={{ flex: "0 1 320px", mx: 2, display: { xs: "none", md: "block" } }} ref={searchAnchorRef}>
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: "relative" }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search students, batches, courses..."
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searching ? (
                    <InputAdornment position="end"><CircularProgress size={14} /></InputAdornment>
                  ) : null,
                  sx: { borderRadius: 2.5, backgroundColor: (theme) => theme.palette.action.hover },
                }}
              />
              <Popper
                open={searchOpen && query.trim().length >= 2}
                anchorEl={searchAnchorRef.current}
                placement="bottom-start"
                style={{ width: searchAnchorRef.current?.offsetWidth, zIndex: 1400 }}
              >
                <Paper elevation={6} sx={{ mt: 1, borderRadius: 2.5, maxHeight: 400, overflowY: "auto", border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  {searching ? (
                    <Box sx={{ p: 2, textAlign: "center", color: "text.secondary", fontSize: 13 }}>Searching...</Box>
                  ) : totalResults === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center", color: "text.secondary", fontSize: 13 }}>No results found.</Box>
                  ) : (
                    <Box sx={{ py: 0.5 }}>
                      {results.students.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ px: 2, pt: 1, display: "block", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", fontSize: 10 }}>Students</Typography>
                          {results.students.map((s) => (
                            <MenuItem key={"st-" + s.id} onClick={() => goToResult("/students/" + s.id, "student", s)} sx={{ py: 1 }}>
                              <ListItemIcon><People fontSize="small" sx={{ color: "#06B6D4" }} /></ListItemIcon>
                              <ListItemText primary={s.name} secondary={s.email} />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                      {results.batches.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ px: 2, pt: 1, display: "block", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", fontSize: 10 }}>Batches</Typography>
                          {results.batches.map((b) => (
                            <MenuItem key={"ba-" + b.id} onClick={() => goToResult("/batches/" + b.id, "batch", b)} sx={{ py: 1 }}>
                              <ListItemIcon><Layers fontSize="small" sx={{ color: "#F59E0B" }} /></ListItemIcon>
                              <ListItemText primary={b.batchName} secondary={b.batchCode} />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                      {results.courses.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ px: 2, pt: 1, display: "block", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", fontSize: 10 }}>Courses</Typography>
                          {results.courses.map((c) => (
                            <MenuItem key={"co-" + c.id} onClick={() => goToResult("/courses/" + c.id, "course", c)} sx={{ py: 1 }}>
                              <ListItemIcon><MenuBook fontSize="small" sx={{ color: "#10B981" }} /></ListItemIcon>
                              <ListItemText primary={c.courseName} secondary={c.courseCode} />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                      {results.instructors.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ px: 2, pt: 1, display: "block", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", fontSize: 10 }}>Instructors</Typography>
                          {results.instructors.map((ins) => (
                            <MenuItem key={"in-" + ins.id} onClick={() => goToResult("/instructors/" + ins.id, "instructor", ins)} sx={{ py: 1 }}>
                              <ListItemIcon><Person fontSize="small" sx={{ color: "#EF4444" }} /></ListItemIcon>
                              <ListItemText primary={ins.name} secondary={ins.email} />
                            </MenuItem>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              </Popper>
            </Box>
          </ClickAwayListener>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: "text.secondary",
                backgroundColor: (theme) => theme.palette.action.hover,
              }}
            >
              <Badge badgeContent={notifCount} color="error" max={9}>
                <NotificationsNone fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, width: 340, maxHeight: 420, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, p: 0.5 },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadNotifications} disabled={notifLoading}>
                  <Refresh fontSize="small" sx={{ animation: notifLoading ? "spin 1s linear infinite" : "none", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ my: 0.5 }} />

            {notifLoading ? (
              <Box sx={{ py: 3, textAlign: "center" }}><CircularProgress size={20} /></Box>
            ) : notifCount === 0 ? (
              <Box sx={{ py: 3, textAlign: "center", color: "text.secondary", fontSize: 13 }}>You're all caught up 🎉</Box>
            ) : (
              <>
                {pendingFees.slice(0, 5).map((e) => (
                  <MenuItem key={"fee-" + e.id} onClick={() => { navigate("/enrollment"); setNotifAnchor(null); }} sx={{ borderRadius: 1.5, py: 1, alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ mt: 0.3 }}><PaidOutlined fontSize="small" sx={{ color: "#F59E0B" }} /></ListItemIcon>
                    <ListItemText
                      primary={`${e.studentName} — ${e.feeStatus} fee`}
                      secondary={`Balance due: ₹ ${Number((e.totalFee || 0) - (e.paidAmount || 0)).toLocaleString("en-IN")}`}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </MenuItem>
                ))}
                {ungradedAssignments.slice(0, 5).map((a) => (
                  <MenuItem key={"asg-" + a.id} onClick={() => { navigate("/assignments"); setNotifAnchor(null); }} sx={{ borderRadius: 1.5, py: 1, alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ mt: 0.3 }}><AssignmentLateOutlined fontSize="small" sx={{ color: "#4F46E5" }} /></ListItemIcon>
                    <ListItemText
                      primary={a.title}
                      secondary={`${(a.totalSubmissions ?? 0) - (a.gradedSubmissions ?? 0)} submission(s) awaiting grading`}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </MenuItem>
                ))}
                {loginActivity.slice(0, 5).map((l, idx) => (
                  <MenuItem key={"login-" + l.email + idx} onClick={() => { navigate(l.role === "STUDENT" ? "/students" : "/instructors"); setNotifAnchor(null); }} sx={{ borderRadius: 1.5, py: 1, alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ mt: 0.3 }}><LoginOutlined fontSize="small" sx={{ color: "#10B981" }} /></ListItemIcon>
                    <ListItemText
                      primary={`${l.name} (${l.role === "STUDENT" ? "Student" : "Instructor"}) logged in`}
                      secondary={timeAgo(l.lastLoginAt)}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>

          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              onClick={toggleColorMode}
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: mode === "dark" ? "#FBBF24" : "#64748B",
                backgroundColor: (theme) => theme.palette.action.hover,
                "&:hover": { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12) },
              }}
            >
              {mode === "dark" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Chip
            label="ADMIN"
            size="small"
            sx={{
              height: 22,
              fontSize: 10,
              fontWeight: 800,
              background: "rgba(79, 70, 229, 0.1)",
              color: "#4F46E5",
              borderRadius: 1,
              px: 0.5,
              display: { xs: "none", sm: "flex" },
            }}
          />

          <Tooltip title="Account menu">
            <IconButton
              onClick={(e) => setAnchor(e.currentTarget)}
              size="small"
              sx={{
                p: 0.5,
                border: "2px solid",
                borderColor: anchor ? "#4F46E5" : "transparent",
                transition: "all 0.2s ease",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                p: 0.5,
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                {admin?.name || "System Admin"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {admin?.email || "admin@citpl.com"}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => setAnchor(null)} sx={{ borderRadius: 1.5, py: 1 }}>
              <ListItemIcon><AdminPanelSettings fontSize="small" sx={{ color: "#4F46E5" }} /></ListItemIcon>
              Admin Controls
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, py: 1, color: "error.main" }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: "error.main" }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}