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
import { fetchInstructors, addInstructor, editInstructor, removeInstructor, toggleInstructor } from "../../store/Slices/instructorSlice";
import InstructorModal from "../../components/modals/InstructorModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { exportData, importData } from "../../services/importExportService";

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
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Instructors</Typography>
          <Typography variant="body2" color="text.secondary">{totalElements} total instructors</Typography>
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
            Add Instructor
          </Button>
        </Box>
      </Box>

      <TextField
        size="small"
        placeholder="Search instructors..."
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Phone</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Batch Code(s)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>No instructors found</TableCell></TableRow>
            ) : items.map((ins, i) => (
              <TableRow key={ins.id} hover>
                <TableCell>{currentPage * size + i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{ins.name}</TableCell>
                <TableCell>{ins.email}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{ins.phone || "—"}</TableCell>
                <TableCell>{ins.specialization || "—"}</TableCell>
                <TableCell>
                  {ins.batchCodes && ins.batchCodes.length > 0
                    ? ins.batchCodes.map((code, idx) => (
                        <Typography key={idx} component="span"
                          sx={{ fontFamily: "monospace", fontSize: 13, mr: 0.75 }}>
                          {code}{idx < ins.batchCodes.length - 1 ? "," : ""}
                        </Typography>
                      ))
                    : "—"}
                </TableCell>
                <TableCell><StatusBadge status={ins.status} onClick={() => handleToggle(ins.id)} /></TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => navigate("/instructors/" + ins.id, { state: { instructor: ins } })}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditData(ins); setModalOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(ins.id)}>
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

      <InstructorModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} />
    </Box>
  );
}