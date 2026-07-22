import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Paper, IconButton, Tooltip, Tabs, Tab, Chip, Stack
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, Search, Download, HowToReg, CheckCircle, HourglassEmpty, ErrorOutline } from "@mui/icons-material";
import {
  fetchEnrollments, fetchEnrollmentSummary, addEnrollment, editEnrollment,
  removeEnrollment, fetchEnrollmentDropdowns,
} from "../../store/Slices/enrollmentSlice";
import EnrollmentModal from "../../components/modals/EnrollmentModal";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/MasterPages.css";

const STATUS_CONFIG = {
  Paid:    { className: "chip-status-paid", icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  Pending: { className: "chip-status-pending", icon: <ErrorOutline sx={{ fontSize: 14 }} /> },
  Partial: { className: "chip-status-partial", icon: <HourglassEmpty sx={{ fontSize: 14 }} /> },
};

const SUMMARY_CARDS = [
  { key: "All",     label: "Total Registrations", cls: "all" },
  { key: "Paid",    label: "Paid In Full",       cls: "paid" },
  { key: "Pending", label: "Pending Fees",       cls: "pending" },
  { key: "Partial", label: "Partial Payments",   cls: "partial" },
];

export default function Enrollment() {
  const dispatch = useDispatch();
  const { items, totalPages, totalElements, currentPage, summary, loading } = useSelector((s) => s.enrollments);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null);

  useEffect(() => {
    dispatch(fetchEnrollments({ page, size, search, feeStatus: tab }));
  }, [dispatch, page, size, search, tab]);

  useEffect(() => {
    dispatch(fetchEnrollmentSummary());
    dispatch(fetchEnrollmentDropdowns());
  }, [dispatch]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };
  const handleTab = (e, t) => { setTab(t); reset(); };

  const refresh = () => {
    dispatch(fetchEnrollments({ page, size, search, feeStatus: tab }));
    dispatch(fetchEnrollmentSummary());
  };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editEnrollment({ id: editData.id, data }));
      if (editEnrollment.fulfilled.match(result)) toast.success("Enrollment updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addEnrollment(data));
      if (addEnrollment.fulfilled.match(result)) toast.success("Enrollment created!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this enrollment?")) return;
    const result = await dispatch(removeEnrollment(id));
    if (removeEnrollment.fulfilled.match(result)) { toast.success("Deleted"); refresh(); }
    else toast.error(result.payload);
  };

  const downloadReceipt = (row) => {
    const doc  = new jsPDF();
    const rno  = `ENR-${String(row.id).padStart(6, "0")}`;
    const base = Number(row.baseFee || 0);
    const gst  = Number(row.gstAmount || 0);
    const sgst = parseFloat((gst / 2).toFixed(2));
    const cgst = parseFloat((gst / 2).toFixed(2));
    const total= Number(row.totalFee || 0);
    const paid = Number(row.paidAmount || 0);
    const due  = parseFloat((total - paid).toFixed(2));

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("Student Management System", 105, 13, { align: "center" });
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Enrollment Fee Receipt", 105, 23, { align: "center" });

    doc.setTextColor(0, 0, 0); doc.setFontSize(10);
    [
      ["Receipt No",   rno],
      ["Date",         row.enrolledDate || new Date().toLocaleDateString("en-IN")],
      ["Student Name", row.studentName],
      ["Course",       row.courseName],
      ["Batch",        row.batchName],
      ["Payment Mode", row.paymentMode || "Cash"],
      ["Fee Status",   row.feeStatus],
    ].forEach(([k, v], i) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${k}`, 14, 42 + i * 8);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${v || "—"}`, 60, 42 + i * 8);
    });

    autoTable(doc, {
      startY: 106,
      head:  [["Description", "Amount (Rs.)"]],
      body:  [
        ["Base Course Fee",      `Rs. ${base.toLocaleString("en-IN")}`],
        ["SGST",                 `Rs. ${sgst.toLocaleString("en-IN")}`],
        ["CGST",                 `Rs. ${cgst.toLocaleString("en-IN")}`],
        ["Total GST",            `Rs. ${gst.toLocaleString("en-IN")}`],
        ["Total Payable Amount", `Rs. ${total.toLocaleString("en-IN")}`],
        ["Amount Paid",          `Rs. ${paid.toLocaleString("en-IN")}`],
        ["Balance Due",          `Rs. ${due.toLocaleString("en-IN")}`],
      ],
      headStyles:         { fillColor: [79, 70, 229], fontSize: 11 },
      styles:             { fontSize: 11 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    const fy = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9); doc.setTextColor(130, 130, 130);
    doc.text("This is a system generated receipt. No signature required.", 105, fy, { align: "center" });
    doc.save(`receipt_${rno}.pdf`);
  };

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
      field: "studentName",
      headerName: "Student Name",
      flex: 1,
      minWidth: 160,
      cellClassName: "cell-bold-title",
    },
    {
      field: "courseName",
      headerName: "Course",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => <span style={{ color: "#334155" }}>{params.row.courseName}</span>,
    },
    {
      field: "batchName",
      headerName: "Batch",
      width: 140,
      renderCell: (params) => (
        <Box component="span" className="cell-code">{params.row.batchName}</Box>
      ),
    },
    {
      field: "baseFee",
      headerName: "Base Fee",
      width: 120,
      renderCell: (params) => (
        <span style={{ whiteSpace: "nowrap" }}>₹ {Number(params.row.baseFee || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      field: "gstAmount",
      headerName: "GST",
      width: 110,
      renderCell: (params) => (
        <span style={{ whiteSpace: "nowrap", color: "#64748B" }}>₹ {Number(params.row.gstAmount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      field: "totalFee",
      headerName: "Total Fee",
      width: 130,
      cellClassName: "cell-amount-total",
      renderCell: (params) => (
        <span>₹ {Number(params.row.totalFee || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      field: "paidAmount",
      headerName: "Paid Amount",
      width: 140,
      cellClassName: "cell-amount-plain",
      renderCell: (params) => (
        <span>₹ {Number(params.row.paidAmount || 0).toLocaleString("en-IN")}</span>
      ),
    },
    {
      field: "feeStatus",
      headerName: "Fee Status",
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const st = STATUS_CONFIG[params.row.feeStatus] || STATUS_CONFIG.Paid;
        return (
          <Chip
            icon={st.icon}
            label={params.row.feeStatus}
            size="small"
            className={`chip-status ${st.className}`}
          />
        );
      },
    },
    {
      field: "enrolledDate",
      headerName: "Date",
      width: 120,
      renderCell: (params) => (
        <span style={{ whiteSpace: "nowrap", color: "#64748B", fontSize: 13 }}>{params.row.enrolledDate || "—"}</span>
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
          <Tooltip title="Download PDF Receipt">
            <IconButton size="small" className="btn-action-icon btn-action-download" onClick={() => downloadReceipt(params.row)}>
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Enrollment">
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
          <Box className="page-icon-badge indigo">
            <HowToReg fontSize="inherit" />
          </Box>
          <Box>
            <Typography className="page-title">Enrollment Management</Typography>
            <Typography className="page-subtitle">
              Track student admissions, fee statuses, and payment receipts ({totalElements} total)
            </Typography>
          </Box>
        </Box>

        <Button className="btn-add-primary" startIcon={<Add />} onClick={() => { setEditData(null); setModalOpen(true); }}>
          New Enrollment
        </Button>
      </Box>

      {/* SUMMARY CARDS */}
      <Box className="summary-cards-grid">
        {SUMMARY_CARDS.map((s) => (
          <Box key={s.key} className={`summary-card ${s.cls}`}>
            <Typography className="summary-card-num">{summary[s.key] ?? 0}</Typography>
            <Typography className="summary-card-label">{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* FILTER & SEARCH BAR */}
      <Paper elevation={0} className="filter-search-paper">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
          <Tabs
            value={tab}
            onChange={handleTab}
            sx={{ minHeight: 38, "& .MuiTabs-indicator": { display: "none" } }}
          >
            {["All", "Paid", "Pending", "Partial"].map((t) => (
              <Tab
                key={t}
                value={t}
                label={`${t} (${summary[t] ?? 0})`}
                sx={{
                  minHeight: 38,
                  borderRadius: 2.5,
                  mr: 1,
                  fontWeight: 700,
                  fontSize: 13,
                  px: 2,
                  textTransform: "none",
                  color: tab === t ? "#FFFFFF" : "#475569",
                  background: tab === t ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)" : "#F1F5F9",
                  boxShadow: tab === t ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none",
                  "&.Mui-selected": { color: "#FFFFFF" },
                }}
              />
            ))}
          </Tabs>

          <TextField
            size="small"
            placeholder="Search by student, course, batch..."
            value={search}
            onChange={handleSearch}
            sx={{ width: { xs: "100%", sm: 300 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "#94A3B8" }} /></InputAdornment>,
            }}
          />
        </Stack>
      </Paper>

      {/* ENROLLMENT TABLE (DataGrid) */}
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
                No enrollment records found.
              </Box>
            ),
          }}
          sx={{
            minWidth: 1150,
            border: "none",
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc" },
            "& .MuiDataGrid-cell": { py: 1.2, display: "flex", alignItems: "center" },
          }}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </Paper>

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />
    </Box>
  );
}