import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Menu, MenuItem, Divider,
} from "@mui/material";
import {
  Add, Visibility, Edit, Delete, Search, Download, Upload,
} from "@mui/icons-material";
import { fetchCourses, addCourse, editCourse, removeCourse, toggleCourse } from "../../store/slices/courseSlice";
import CourseModal from "../../components/modals/CourseModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { exportData, importData } from "../../services/importExportService";

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
      else { toast.error(result.payload); return; } // stop here on failure
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
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Courses</Typography>
          <Typography variant="body2" color="text.secondary">{totalElements} total courses</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={handleImportExcel} style={{ display: "none" }} />

          <Button
            variant="outlined" color="success" startIcon={<Upload />}
            disabled={importing}
            onClick={(e) => setImportAnchor(e.currentTarget)}
          >
            {importing ? "Importing..." : "Import"}
          </Button>
          <Menu anchorEl={importAnchor} open={Boolean(importAnchor)} onClose={() => setImportAnchor(null)}>
            <MenuItem disabled sx={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "text.secondary" }}>
              Choose format
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setImportAnchor(null); excelRef.current.click(); }}>
              📊 Import from Excel (.xlsx)
            </MenuItem>
          </Menu>

          <Button
            variant="outlined" startIcon={<Download />}
            disabled={exporting}
            onClick={(e) => setExportAnchor(e.currentTarget)}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem disabled sx={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "text.secondary" }}>
              Choose format
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleExportPdf}>📄 Export as PDF</MenuItem>
            <MenuItem onClick={handleExportExcel}>📊 Export as Excel</MenuItem>
          </Menu>

          <Button variant="contained" startIcon={<Add />}
            onClick={() => { setEditData(null); setModalOpen(true); }}>
            Add Course
          </Button>
        </Box>
      </Box>

      <TextField
        size="small"
        placeholder="Search courses..."
        value={search}
        onChange={handleSearch}
        sx={{ mb: 2, width: 320 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
        }}
      />

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ "& th": { fontWeight: 700, color: "#1565C0", backgroundColor: "#F1F5F9" } }}>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Course Code</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Fees</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>No courses found</TableCell></TableRow>
            ) : items.map((c, i) => (
              <TableRow key={c.id} hover>
                <TableCell>{currentPage * size + i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{c.courseName}</TableCell>
                <TableCell>
                  <Typography component="span" sx={{ fontFamily: "monospace", fontSize: 13 }}>{c.courseCode}</Typography>
                </TableCell>
                <TableCell>{formatDuration(c.duration)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{c.fee ? `₹${Number(c.fee).toLocaleString("en-IN")}` : "—"}</TableCell>
                <TableCell><StatusBadge status={c.status} onClick={() => handleToggle(c.id)} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => navigate("/courses/" + c.id, { state: { course: c } })}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditData(c); setModalOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
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

      <CourseModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} />
    </Box>
  );
}