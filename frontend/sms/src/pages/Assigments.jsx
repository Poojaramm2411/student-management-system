import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, MenuItem,
} from "@mui/material";
import { Add, Visibility, Edit, Delete, Search } from "@mui/icons-material";
import {
  fetchAssignments, addAssignment, editAssignment, removeAssignment, changeAssignmentStatus,
} from "../store/slices/AssigmentSlice";
import { fetchBatches } from "../store/slices/batchSlice";
import { fetchInstructors } from "../store/slices/instructorSlice";
import AssignmentModal from "../components/modals/AssigmentModal";
import Pagination from "../components/ui/Pagination";
import { usePagination } from "../hooks/usePagination";

const STATUS_COLORS = { DRAFT: "default", PUBLISHED: "success", CLOSED: "error" };

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
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Assignments</Typography>
          <Typography variant="body2" color="text.secondary">{totalElements} total assignments</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditData(null); setModalOpen(true); }}>
          Add Assignment
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Search assignments..." value={search} onChange={handleSearch}
          sx={{ width: 320 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="Status" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); reset(); }} sx={{ width: 180 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
          <MenuItem value="PUBLISHED">Published</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 1100 }}>
          <TableHead sx={{ "& th": { fontWeight: 700, color: "#1565C0", backgroundColor: "#F1F5F9" } }}>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Batch</TableCell>
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
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: "text.secondary" }}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: "text.secondary" }}>No assignments found</TableCell></TableRow>
            ) : items.map((a, i) => (
              <TableRow key={a.id} hover>
                <TableCell>{page * size + i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{a.title}</TableCell>
                <TableCell>{a.batchName || "—"}</TableCell>
                <TableCell>{a.instructorName || "—"}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{a.dueDate || "—"}</TableCell>
                <TableCell>{a.maxMarks}</TableCell>
                <TableCell>{a.gradedSubmissions ?? 0} / {a.totalSubmissions ?? 0} graded</TableCell>
                <TableCell>
                  <TextField select size="small" value={a.status} variant="standard"
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    sx={{ minWidth: 110 }}>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="PUBLISHED">Published</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="View Submissions">
                    <IconButton size="small" onClick={() => navigate(`/assignments/${a.id}/submissions`, { state: { assignment: a } })}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditData(a); setModalOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
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