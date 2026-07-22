import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Paper, IconButton, Tooltip, Menu, MenuItem, Divider, Stack, Avatar
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
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

  const columns = [
    {
      field: "sno",
      headerName: "S.No",
      width: 70,
      sortable: false,
      renderCell: (params) => {
        const index = items.findIndex((row) => row.id === params.row.id);
        return <span style={{ color: "#64748B", fontWeight: 600 }}>{currentPage * size + index + 1}</span>;
      },
    },
    {
      field: "name",
      headerName: "Instructor",
      flex: 1,
      minWidth: 200,
      cellClassName: "cell-bold-title",
      renderCell: (params) => {
        const ins = params.row;
        const initials = ins.name ? ins.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "IN";
        return (
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
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => <span style={{ color: "#475569" }}>{params.row.email}</span>,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 140,
      renderCell: (params) => (
        <span style={{ whiteSpace: "nowrap", color: "#475569" }}>{params.row.phone || "—"}</span>
      ),
    },
    {
      field: "specialization",
      headerName: "Specialization",
      width: 170,
      sortable: false,
      renderCell: (params) =>
        params.row.specialization ? (
          <Box component="span" sx={{
            bgcolor: "#EEF2FF", color: "#4F46E5", px: 1, py: 0.3, borderRadius: 1.5,
            fontSize: 12, fontWeight: 700, border: "1px solid #C7D2FE"
          }}>{params.row.specialization}</Box>
        ) : "—",
    },
    {
      field: "batchCodes",
      headerName: "Assigned Batches",
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) =>
        params.row.batchCodes && params.row.batchCodes.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" spacing={0.5}>
            {params.row.batchCodes.map((code, idx) => (
              <Box key={idx} component="span" className="cell-code" sx={{ mr: 0.5, mb: 0.5 }}>
                {code}
              </Box>
            ))}
          </Stack>
        ) : "—",
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <StatusBadge status={params.row.status} onClick={() => handleToggle(params.row.id)} />
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
          <Tooltip title="View Faculty Profile">
            <IconButton size="small" className="btn-action-icon btn-action-view" onClick={() => navigate("/instructors/" + params.row.id, { state: { instructor: params.row } })}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Instructor">
            <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(params.row); setModalOpen(true); }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(params.row.id)}>
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
                No instructors found.
              </Box>
            ),
          }}
          sx={{
            minWidth: 950,
            border: "none",
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc" },
            "& .MuiDataGrid-cell": { py: 1.2, display: "flex", alignItems: "center" },
          }}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </Paper>

      <InstructorModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} />
    </Box>
  );
}