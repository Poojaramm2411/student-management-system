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
  Add, Visibility, Edit, Delete, Search, Download, Upload, Layers
} from "@mui/icons-material";
import { fetchBatches, addBatch, editBatch, removeBatch, toggleBatch } from "../../store/Slices/batchSlice";
import { fetchCourses } from "../../store/Slices/courseSlice";
import { fetchInstructors } from "../../store/Slices/instructorSlice";
import BatchModal from "../../components/modals/BatchModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { exportData, importData } from "../../services/importExportService";
import "../../styles/MasterPages.css";

export default function Batches() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.batches);
  const { items: courses } = useSelector((s) => s.courses);
  const { items: instructors } = useSelector((s) => s.instructors);

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
    dispatch(fetchBatches({ page, size, search }));
  }, [dispatch, page, size, search]);

  useEffect(() => {
    dispatch(fetchCourses({ page: 0, size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchInstructors({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editBatch({ id: editData.id, data }));
      if (editBatch.fulfilled.match(result)) toast.success("Batch updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addBatch(data));
      if (addBatch.fulfilled.match(result)) toast.success("Batch added!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchBatches({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this batch?")) return;
    const result = await dispatch(removeBatch(id));
    if (removeBatch.fulfilled.match(result)) toast.success("Batch deleted");
    else toast.error(result.payload);
    dispatch(fetchBatches({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleBatch(id));
    dispatch(fetchBatches({ page, size, search }));
  };

  const handleExportPdf = async () => {
    setExportAnchor(null);
    setExporting(true);
    try {
      await exportData("batches", "pdf");
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
      await exportData("batches", "excel");
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
      const res = await importData("batches", file);
      toast.success(res?.message || "Imported successfully!");
      dispatch(fetchBatches({ page, size, search }));
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
          <Box className="page-icon-badge amber">
            <Layers fontSize="inherit" />
          </Box>
          <Box>
            <Typography className="page-title">Academic Batches</Typography>
            <Typography className="page-subtitle">
              Manage student cohorts, schedules, and instructor assignments ({totalElements} active batches)
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
            Add Batch
          </Button>
        </Box>
      </Box>

      {/* SEARCH BAR */}
      <Paper elevation={0} className="filter-search-paper">
        <TextField
          size="small"
          placeholder="Search by batch name or code..."
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
        <Table sx={{ minWidth: 1100 }}>
          <TableHead className="master-table-head">
            <TableRow>
              <TableCell width={70} sx={{ whiteSpace: "nowrap" }}>S.No</TableCell>
              <TableCell>Batch Name</TableCell>
              <TableCell>Batch Code</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Start Date</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>Loading batches...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>No batches found.</TableCell></TableRow>
            ) : items.map((b, i) => (
              <TableRow key={b.id} className="master-table-row">
                <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{page * size + i + 1}</TableCell>
                <TableCell className="cell-bold-title">{b.batchName}</TableCell>
                <TableCell>
                  <Box component="span" className="cell-code">{b.batchCode}</Box>
                </TableCell>
                <TableCell sx={{ color: "#334155" }}>{b.courseName || "—"}</TableCell>
                <TableCell sx={{ color: "#334155" }}>{b.instructorName || "—"}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: 13 }}>{b.startDate || "—"}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: 13 }}>{b.endDate || "—"}</TableCell>
                <TableCell><StatusBadge status={b.status} onClick={() => handleToggle(b.id)} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Batch Details">
                      <IconButton size="small" className="btn-action-icon btn-action-view" onClick={() => navigate("/batches/" + b.id, { state: { batch: b } })}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Batch">
                      <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(b); setModalOpen(true); }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(b.id)}>
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

      <BatchModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} courses={courses} instructors={instructors} />
    </Box>
  );
}