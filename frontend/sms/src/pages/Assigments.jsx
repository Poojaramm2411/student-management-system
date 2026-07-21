import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, MenuItem, Stack
} from "@mui/material";
import { Add, Visibility, Edit, Delete, Search, Assignment } from "@mui/icons-material";
import {
  fetchAssignments, addAssignment, editAssignment, removeAssignment, changeAssignmentStatus,
} from "../store/Slices/assignmentSlice";
import { fetchBatches } from "../store/Slices/batchSlice";
import { fetchInstructors } from "../store/Slices/instructorSlice";
import AssignmentModal from "../components/modals/AssignmentModal";
import Pagination from "../components/ui/Pagination";
import { usePagination } from "../hooks/usePagination";
import "../styles/MasterPages.css";

export default function Assignments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.assignments);
  const { items: batches } = useSelector((s) => s.batches);
  const { items: instructors } = useSelector((s) => s.instructors);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchAssignments({ page, size, search, status: statusFilter }));
  }, [dispatch, page, size, search, statusFilter]);

  useEffect(() => {
    dispatch(fetchBatches({ page: 0, size: 100 }));
    dispatch(fetchInstructors({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editAssignment({ id: editData.id, data }));
      if (editAssignment.fulfilled.match(result)) toast.success("Assignment updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addAssignment(data));
      if (addAssignment.fulfilled.match(result)) toast.success("Assignment created!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchAssignments({ page, size, search, status: statusFilter }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment? All student submissions for it will be affected.")) return;
    const result = await dispatch(removeAssignment(id));
    if (removeAssignment.fulfilled.match(result)) toast.success("Assignment deleted");
    else toast.error(result.payload);
    dispatch(fetchAssignments({ page, size, search, status: statusFilter }));
  };

  const handleStatusChange = async (id, status) => {
    await dispatch(changeAssignmentStatus({ id, status }));
    dispatch(fetchAssignments({ page, size, search, status: statusFilter }));
  };

  return (
    <Box className="master-page-container">
      {/* PAGE HEADER */}
      <Box className="page-header-row">
        <Box className="page-header-left">
          <Box className="page-icon-badge violet">
            <Assignment fontSize="inherit" />
          </Box>
          <Box>
            <Typography className="page-title">Assignments & Tests</Typography>
            <Typography className="page-subtitle">
              Create, publish, and evaluate coursework ({totalElements} total assignments)
            </Typography>
          </Box>
        </Box>

        <Button className="btn-add-primary" startIcon={<Add />} onClick={() => { setEditData(null); setModalOpen(true); }}>
          Add Assignment
        </Button>
      </Box>

      {/* FILTERS */}
      <Paper elevation={0} className="filter-search-paper">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            size="small" placeholder="Search by assignment title..." value={search} onChange={handleSearch}
            sx={{ width: { xs: "100%", sm: 320 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment> }}
          />
          <TextField select size="small" label="Filter Status" value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); reset(); }} sx={{ width: 180 }}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="PUBLISHED">Published</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={0} className="master-table-container">
        <Table sx={{ minWidth: 1100 }}>
          <TableHead className="master-table-head">
            <TableRow>
              <TableCell width={70} sx={{ whiteSpace: "nowrap" }}>S.No</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Batch Details</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Due Date</TableCell>
              <TableCell>Max Marks</TableCell>
              <TableCell>Submissions</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>Loading assignments...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>No assignments found.</TableCell></TableRow>
            ) : items.map((a, i) => (
              <TableRow key={a.id} className="master-table-row">
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{page * size + i + 1}</TableCell>
                <TableCell className="cell-bold-title">{a.title}</TableCell>
                <TableCell>
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="body2" fontWeight={600} color="#0F172A">
                      {a.batchName || "—"}
                    </Typography>
                    {a.batchCode && (
                      <Box component="span" className="cell-code">
                        {a.batchCode}
                      </Box>
                    )}
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: "#475569" }}>{a.instructorName || "—"}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: 13 }}>{a.dueDate || "—"}</TableCell>
                <TableCell className="cell-amount-total">{a.maxMarks}</TableCell>
                <TableCell>
                  <Chip
                    label={`${a.gradedSubmissions ?? 0} / ${a.totalSubmissions ?? 0} Graded`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: "#EEF2FF",
                      color: "#4F46E5",
                      border: "1px solid #C7D2FE",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField select size="small" value={a.status} variant="outlined"
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    sx={{ minWidth: 120, "& .MuiOutlinedInput-input": { py: 0.5, fontSize: 12, fontWeight: 700 } }}>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="PUBLISHED">Published</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Submissions & Evaluate">
                      <IconButton size="small" className="btn-action-icon btn-action-view" onClick={() => navigate(`/assignments/${a.id}/submissions`, { state: { assignment: a } })}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Assignment">
                      <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(a); setModalOpen(true); }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(a.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </TableContainer>

      <AssignmentModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} batches={batches} instructors={instructors} />
    </Box>
  );
}