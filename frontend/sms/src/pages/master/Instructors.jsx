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
  Add, Visibility, Edit, Delete, Search, Download, Upload, Person
} from "@mui/icons-material";
import { fetchInstructors, addInstructor, editInstructor, removeInstructor, toggleInstructor } from "../../store/Slices/instructorSlice";
import InstructorModal from "../../components/modals/InstructorModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { exportData, importData } from "../../services/importExportService";
import "../../styles/MasterPages.css";

export default function Instructors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.instructors);

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
    dispatch(fetchInstructors({ page, size, search }));
  }, [dispatch, page, size, search]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editInstructor({ id: editData.id, data }));
      if (editInstructor.fulfilled.match(result)) toast.success("Instructor updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addInstructor(data));
      if (addInstructor.fulfilled.match(result)) toast.success("Instructor added!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchInstructors({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this instructor?")) return;
    const result = await dispatch(removeInstructor(id));
    if (removeInstructor.fulfilled.match(result)) toast.success("Instructor deleted");
    else toast.error(result.payload);
    dispatch(fetchInstructors({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleInstructor(id));
    dispatch(fetchInstructors({ page, size, search }));
  };

  const handleExportPdf = async () => {
    setExportAnchor(null);
    setExporting(true);
    try {
      await exportData("instructors", "pdf");
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
      await exportData("instructors", "excel");
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
      const res = await importData("instructors", file);
      toast.success(res?.message || "Imported successfully!");
      dispatch(fetchInstructors({ page, size, search }));
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
          <Box className="page-icon-badge rose">
            <Person fontSize="inherit" />
          </Box>
          <Box>
            <Typography className="page-title">Instructor Faculty</Typography>
            <Typography className="page-subtitle">
              Manage teaching staff, specializations, and batch assignments ({totalElements} faculty members)
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
            Add Instructor
          </Button>
        </Box>
      </Box>

      {/* SEARCH BAR */}
      <Paper elevation={0} className="filter-search-paper">
        <TextField
          size="small"
          placeholder="Search instructors by name, email, specialization..."
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
        <Table sx={{ minWidth: 950 }}>
          <TableHead className="master-table-head">
            <TableRow>
              <TableCell width={70} sx={{ whiteSpace: "nowrap" }}>S.No</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Email</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Phone</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Assigned Batches</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>Loading instructors...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>No instructors found.</TableCell></TableRow>
            ) : items.map((ins, i) => {
              const initials = ins.name ? ins.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "IN";

              return (
                <TableRow key={ins.id} className="master-table-row">
                  <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{currentPage * size + i + 1}</TableCell>
                  <TableCell className="cell-bold-title">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{
                        width: 34, height: 34, fontSize: 12, fontWeight: 700,
                        background: "linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)",
                        boxShadow: "0 2px 6px rgba(239, 68, 68, 0.2)"
                      }}>
                        {initials}
                      </Avatar>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">{ins.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "#475569" }}>{ins.email}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", color: "#475569" }}>{ins.phone || "—"}</TableCell>
                  <TableCell>
                    {ins.specialization ? <Box component="span" sx={{
                      bgcolor: "#EEF2FF", color: "#4F46E5", px: 1, py: 0.3, borderRadius: 1.5,
                      fontSize: 12, fontWeight: 700, border: "1px solid #C7D2FE"
                    }}>{ins.specialization}</Box> : "—"}
                  </TableCell>
                  <TableCell>
                    {ins.batchCodes && ins.batchCodes.length > 0
                      ? ins.batchCodes.map((code, idx) => (
                          <Box key={idx} component="span" className="cell-code" sx={{ mr: 0.5, mb: 0.5 }}>
                            {code}
                          </Box>
                        ))
                      : "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={ins.status} onClick={() => handleToggle(ins.id)} /></TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Faculty Profile">
                        <IconButton size="small" className="btn-action-icon btn-action-view" onClick={() => navigate("/instructors/" + ins.id, { state: { instructor: ins } })}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Instructor">
                        <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(ins); setModalOpen(true); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(ins.id)}>
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

      <InstructorModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} />
    </Box>
  );
}