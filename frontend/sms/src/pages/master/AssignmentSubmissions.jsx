import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Button,
} from "@mui/material";
import { ArrowBack, Grade } from "@mui/icons-material";
import { fetchSubmissionsForAssignment, gradeSubmission } from "../../store/slices/SubmissionSlice";
import GradeSubmissionModal from "../../components/modals/GradeSubmissionModal";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";

const STATUS_COLORS = { PENDING: "default", SUBMITTED: "primary", LATE: "warning", GRADED: "success" };

export default function AssignmentSubmissions() {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const assignment = location.state?.assignment; // passed from Assignments.jsx row click
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.submissions);
  const { page, size, goToPage } = usePagination();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);

  useEffect(() => {
    dispatch(fetchSubmissionsForAssignment({ assignmentId, page, size }));
  }, [dispatch, assignmentId, page, size]);

  const handleGrade = async (data) => {
    // instructorId comes from the assignment's owning instructor.
    // If you have a logged-in instructor session instead, swap this for that instructor's id.
    const payload = { ...data, instructorId: assignment?.instructorId };
    const result = await dispatch(gradeSubmission({ id: activeSubmission.id, data: payload }));
    if (gradeSubmission.fulfilled.match(result)) toast.success("Submission graded!");
    else toast.error(result.payload);
    setModalOpen(false);
    setActiveSubmission(null);
    dispatch(fetchSubmissionsForAssignment({ assignmentId, page, size }));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate("/assignments")}><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {assignment?.title || "Assignment"} — Submissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalElements} student{totalElements === 1 ? "" : "s"} submitted
            {assignment?.maxMarks ? ` · Max Marks: ${assignment.maxMarks}` : ""}
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ "& th": { fontWeight: 700, color: "#1565C0", backgroundColor: "#F1F5F9" } }}>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Submitted At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>No submissions yet</TableCell></TableRow>
            ) : items.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{s.studentName}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={s.status} color={STATUS_COLORS[s.status] || "default"} />
                </TableCell>
                <TableCell>{s.marksObtained != null ? `${s.marksObtained} / ${s.maxMarks}` : "—"}</TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.feedback || "—"}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={s.status === "GRADED" ? "Re-grade" : "Grade"}>
                    <Button size="small" startIcon={<Grade />}
                      onClick={() => { setActiveSubmission(s); setModalOpen(true); }}>
                      {s.status === "GRADED" ? "Re-grade" : "Grade"}
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </TableContainer>

      <GradeSubmissionModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setActiveSubmission(null); }}
        onSave={handleGrade} submission={activeSubmission} />
    </Box>
  );
}