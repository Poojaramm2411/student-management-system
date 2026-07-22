import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  Paper, IconButton, Tooltip, MenuItem, Stack
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
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

  // ---- DataGrid columns ----
  const columns = [
    {
      field: "sno",
      headerName: "S.No",
      width: 70,
      sortable: false,
      renderCell: (params) => {
        const index = items.findIndex((row) => row.id === params.row.id);
        return <span style={{ color: "#64748B", fontWeight: 600 }}>{page * size + index + 1}</span>;
      },
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 160,
      cellClassName: "cell-bold-title",
    },
    {
      field: "batchDetails",
      headerName: "Batch Details",
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack spacing={0.5} alignItems="flex-start" justifyContent="center" sx={{ height: "100%" }}>
          <Typography variant="body2" fontWeight={600} color="#0F172A">
            {params.row.batchName || "—"}
          </Typography>
          {params.row.batchCode && (
            <Box component="span" className="cell-code">
              {params.row.batchCode}
            </Box>
          )}
        </Stack>
      ),
    },
    {
      field: "instructorName",
      headerName: "Instructor",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <span style={{ color: "#475569" }}>{params.row.instructorName || "—"}</span>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
      renderCell: (params) => (
        <span style={{ color: "#64748B", fontSize: 13, whiteSpace: "nowrap" }}>
          {params.row.dueDate || "—"}
        </span>
      ),
    },
    {
      field: "maxMarks",
      headerName: "Max Marks",
      width: 110,
      cellClassName: "cell-amount-total",
    },
    {
      field: "submissions",
      headerName: "Submissions",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={`${params.row.gradedSubmissions ?? 0} / ${params.row.totalSubmissions ?? 0} Graded`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: "#EEF2FF",
            color: "#4F46E5",
            border: "1px solid #C7D2FE",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          value={params.row.status}
          variant="outlined"
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          sx={{ minWidth: 120, "& .MuiOutlinedInput-input": { py: 0.5, fontSize: 12, fontWeight: 700 } }}
        >
          <MenuItem value="DRAFT">Draft</MenuItem>
          <MenuItem value="PUBLISHED">Published</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="View Submissions & Evaluate">
            <IconButton
              size="small"
              className="btn-action-icon btn-action-view"
              onClick={() =>
                navigate(`/assignments/${params.row.id}/submissions`, { state: { assignment: params.row } })
              }
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Assignment">
            <IconButton
              size="small"
              className="btn-action-icon btn-action-edit"
              onClick={() => { setEditData(params.row); setModalOpen(true); }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              className="btn-action-icon btn-action-delete"
              onClick={() => handleDelete(params.row.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

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

      {/* TABLE (DataGrid) */}
      <Paper elevation={0} className="master-table-container" sx={{ width: "100%" }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          getRowHeight={() => "auto"}
          hideFooter
          disableColumnMenu
          disableRowSelectionOnClick
          autoHeight
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                No assignments found.
              </Box>
            ),
          }}
          sx={{
            minWidth: 1100,
            border: "none",
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc" },
            "& .MuiDataGrid-cell": { py: 1.2, display: "flex", alignItems: "center" },
          }}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </Paper>

      <AssignmentModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} batches={batches} instructors={instructors} />
    </Box>
  );
}