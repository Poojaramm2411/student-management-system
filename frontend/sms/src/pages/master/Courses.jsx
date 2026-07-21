import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Menu, MenuItem, Divider, Stack
} from "@mui/material";
import {
  Add, Visibility, Edit, Delete, Search, Download, Upload, MenuBook
} from "@mui/icons-material";
import { fetchCourses, addCourse, editCourse, removeCourse, toggleCourse } from "../../store/slices/courseSlice";
import CourseModal from "../../components/modals/CourseModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { exportData, importData } from "../../services/importExportService";
import "../../styles/MasterPages.css";

const formatDuration = (dur) => {
  if (!dur) return "—";
  let str = String(dur).trim();
  if (str.toLowerCase().endsWith("months")) return str;
  if (str.toLowerCase().endsWith("month")) return str + "s";
  if (str.toLowerCase().endsWith("mo")) return str.substring(0, str.length - 2).trim() + " months";
  if (/^\d+$/.test(str)) return `${str} months`;
  return str;
};

export default function Courses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.courses);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importAnchor, setImportAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const excelRef = useRef();

  useEffect(() => {
    dispatch(fetchCourses({ page, size, search }));
  }, [dispatch, page, size, search]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editCourse({ id: editData.id, data }));
      if (editCourse.fulfilled.match(result)) toast.success("Course updated!");
      else { toast.error(result.payload); return; }
    } else {
      result = await dispatch(addCourse(data));
      if (addCourse.fulfilled.match(result)) toast.success("Course created!");
      else { toast.error(result.payload); return; }
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchCourses({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    const result = await dispatch(removeCourse(id));
    if (removeCourse.fulfilled.match(result)) toast.success("Course deleted");
    else toast.error(result.payload);
    dispatch(fetchCourses({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleCourse(id));
    dispatch(fetchCourses({ page, size, search }));
  };

  const handleExportPdf = async () => {
    setExportAnchor(null);
    setExporting(true);
    try {
      await exportData("courses", "pdf");
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
      await exportData("courses", "excel");
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
      const res = await importData("courses", file);
      toast.success(res?.message || "Imported successfully!");
      dispatch(fetchCourses({ page, size, search }));
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
          <Box className="page-icon-badge emerald">
            <MenuBook fontSize="inherit" />
          </Box>
          <Box>
            <Typography className="page-title">Course Catalog</Typography>
            <Typography className="page-subtitle">
              Manage curriculum programs, course fees, and durations ({totalElements} programs)
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

          <Button className="btn-add-primary" startIcon={<Add />} onClick={() => { setEditData(null); setModalOpen(true); }}>
            Add Course
          </Button>
        </Box>
      </Box>

      {/* SEARCH BAR */}
      <Paper elevation={0} className="filter-search-paper">
        <TextField
          size="small"
          placeholder="Search by course name or code..."
          value={search}
          onChange={handleSearch}
          sx={{ width: { xs: "100%", sm: 320 } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>,
          }}
        />
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={0} className="master-table-container">
        <Table sx={{ minWidth: 900 }}>
          <TableHead className="master-table-head">
            <TableRow>
              <TableCell width={70} sx={{ whiteSpace: "nowrap" }}>S.No</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Course Fee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>Loading courses...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>No courses found.</TableCell></TableRow>
            ) : items.map((c, i) => (
              <TableRow key={c.id} className="master-table-row">
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{currentPage * size + i + 1}</TableCell>
                <TableCell className="cell-bold-title">{c.courseName}</TableCell>
                <TableCell>
                  <Box component="span" className="cell-code">{c.courseCode}</Box>
                </TableCell>
                <TableCell sx={{ color: "#475569" }}>{formatDuration(c.duration)}</TableCell>
                <TableCell className="cell-amount-plain">
                  {c.fee ? `₹ ${Number(c.fee).toLocaleString("en-IN")}` : "—"}
                </TableCell>
                <TableCell><StatusBadge status={c.status} onClick={() => handleToggle(c.id)} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Course Details">
                      <IconButton size="small" className="btn-action-icon btn-action-view" onClick={() => navigate("/courses/" + c.id, { state: { course: c } })}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Course">
                      <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(c); setModalOpen(true); }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(c.id)}>
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

      <CourseModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} />
    </Box>
  );
}