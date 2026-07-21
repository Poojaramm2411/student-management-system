import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Menu, MenuItem, Divider, Stack, Avatar
} from "@mui/material";
import {
  Add, Visibility, Edit, Delete, Search, Download, Upload, People
} from "@mui/icons-material";
import { fetchStudents, addStudent, editStudent, removeStudent, toggleStudent } from "../../store/Slices/studentSlice";
import { fetchBatches } from "../../store/Slices/batchSlice";
import StudentModal from "../../components/modals/StudentModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { exportData, importData } from "../../services/importExportService";
import { getAllStudents } from "../../services/studentService";
import "../../styles/MasterPages.css";

const previewNextStudentCode = (students = []) => {
  const nums = students
    .map((s) => (s.studentCode || "").match(/^STD(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const width = Math.max(3, String(next).length);
  return `STD${String(next).padStart(width, "0")}`;
};

export default function Students() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.students);
  const { items: batches } = useSelector((s) => s.batches);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [nextCode, setNextCode] = useState("");

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importAnchor, setImportAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const excelRef = useRef();

  useEffect(() => {
    dispatch(fetchStudents({ page, size, search }));
  }, [dispatch, page, size, search]);

  useEffect(() => {
    dispatch(fetchBatches({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editStudent({ id: editData.id, data }));
      if (editStudent.fulfilled.match(result)) toast.success("Student updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addStudent(data));
      if (addStudent.fulfilled.match(result)) toast.success("Student added!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchStudents({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    const result = await dispatch(removeStudent(id));
    if (removeStudent.fulfilled.match(result)) toast.success("Student deleted");
    else toast.error(result.payload);
    dispatch(fetchStudents({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleStudent(id));
    dispatch(fetchStudents({ page, size, search }));
  };

  const handleOpenAdd = async () => {
    setEditData(null);
    setModalOpen(true);
    try {
      const all = await getAllStudents();
      setNextCode(previewNextStudentCode(Array.isArray(all) ? all : []));
    } catch {
      setNextCode("");
    }
  };

  const handleExportPdf = async () => {
    setExportAnchor(null);
    setExporting(true);
    try {
      await exportData("students", "pdf");
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("PDF export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportAnchor(null);
    setExporting(true);
    try {
      await exportData("students", "excel");
      toast.success("Excel exported successfully!");
    } catch {
      toast.error("Excel export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await importData("students", file);
      toast.success(res?.message || "Imported successfully!");
      dispatch(fetchStudents({ page, size, search }));
    } catch (err) {
      toast.error(err.message || "Import failed. Check file format.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <Box className="master-page-container">
      {/* PAGE HEADER */}
      <Box className="page-header-row">
        <Box className="page-header-left">
          <Box className="page-icon-badge cyan">
            <People fontSize="inherit" />
          </Box>
          <Box>
            <Typography className="page-title">Student Records</Typography>
            <Typography className="page-subtitle">
              Manage student profiles, enrollments, and status tracking ({totalElements} registered)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} style={{ display: "none" }} />

          <Button variant="outlined" color="secondary" startIcon={<Upload />} disabled={importing}
            onClick={(e) => setImportAnchor(e.currentTarget)} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
            {importing ? "Importing..." : "Import"}
          </Button>
          <Menu anchorEl={importAnchor} open={Boolean(importAnchor)} onClose={() => setImportAnchor(null)}
            PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
            <MenuItem disabled sx={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
              Choose format
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setImportAnchor(null); excelRef.current.click(); }}>
              📊 Import from Excel (.xlsx)
            </MenuItem>
          </Menu>

          <Button variant="outlined" startIcon={<Download />} disabled={exporting}
            onClick={(e) => setExportAnchor(e.currentTarget)} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}
            PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
            <MenuItem disabled sx={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
              Choose format
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleExportPdf}>📄 Export as PDF</MenuItem>
            <MenuItem onClick={handleExportExcel}>📊 Export as Excel</MenuItem>
          </Menu>

          <Button className="btn-add-primary" startIcon={<Add />} onClick={handleOpenAdd}>
            Add Student
          </Button>
        </Box>
      </Box>

      {/* SEARCH BAR */}
      <Paper elevation={0} className="filter-search-paper">
        <TextField
          size="small"
          placeholder="Search students by name, email, code or city..."
          value={search}
          onChange={handleSearch}
          sx={{ width: { xs: "100%", sm: 340 } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>,
          }}
        />
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={0} className="master-table-container">
        <Table sx={{ minWidth: 1050 }}>
          <TableHead className="master-table-head">
            <TableRow>
              <TableCell width={70} sx={{ whiteSpace: "nowrap" }}>S.No</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Student Code</TableCell>
              <TableCell>Batch Code</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6, color: "text.secondary" }}>Loading student records...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6, color: "text.secondary" }}>No students found.</TableCell></TableRow>
            ) : items.map((s, i) => {
              const initials = s.name ? s.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST";

              return (
                <TableRow key={s.id} className="master-table-row">
                  <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{page * size + i + 1}</TableCell>
                  <TableCell className="cell-bold-title">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{
                        width: 34, height: 34, fontSize: 12, fontWeight: 700,
                        background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
                        boxShadow: "0 2px 6px rgba(79, 70, 229, 0.2)"
                      }}>
                        {initials}
                      </Avatar>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">{s.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "#475569" }}>{s.email}</TableCell>
                  <TableCell>{s.age || "—"}</TableCell>
                  <TableCell>
                    <Box component="span" className="cell-code">{s.studentCode}</Box>
                  </TableCell>
                  <TableCell>
                    {s.batchCode ? <Box component="span" className="cell-code">{s.batchCode}</Box> : "—"}
                  </TableCell>
                  <TableCell sx={{ color: "#334155" }}>{s.courseName || "—"}</TableCell>
                  <TableCell>{s.city || "—"}</TableCell>
                  <TableCell><StatusBadge status={s.status} onClick={() => handleToggle(s.id)} /></TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Profile Details">
                        <IconButton size="small" className="btn-action-icon btn-action-view" onClick={() => navigate("/students/" + s.id, { state: { student: s } })}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Student">
                        <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(s); setModalOpen(true); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(s.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </TableContainer>

      <StudentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
        batches={batches}
        nextStudentCode={nextCode}
      />
    </Box>
  );
}