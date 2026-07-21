import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Tabs, Tab, Chip, Stack
} from "@mui/material";
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

      {/* ENROLLMENT TABLE */}
      <TableContainer component={Paper} elevation={0} className="master-table-container">
        <Table sx={{ minWidth: 1150 }}>
          <TableHead className="master-table-head">
            <TableRow>
              <TableCell width={70} sx={{ whiteSpace: "nowrap" }}>S.No</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Base Fee</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>GST</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Total Fee</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Paid Amount</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Fee Status</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Date</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} align="center" sx={{ py: 6, color: "text.secondary" }}>Loading enrollments...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={11} align="center" sx={{ py: 6, color: "text.secondary" }}>No enrollment records found.</TableCell></TableRow>
            ) : items.map((row, i) => {
              const st = STATUS_CONFIG[row.feeStatus] || STATUS_CONFIG.Paid;

              return (
                <TableRow key={row.id} className="master-table-row">
                  <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{page * size + i + 1}</TableCell>
                  <TableCell className="cell-bold-title">{row.studentName}</TableCell>
                  <TableCell sx={{ color: "#334155" }}>{row.courseName}</TableCell>
                  <TableCell>
                    <Box component="span" className="cell-code">{row.batchName}</Box>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>₹ {Number(row.baseFee || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", color: "#64748B" }}>₹ {Number(row.gstAmount || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="cell-amount-total">
                    ₹ {Number(row.totalFee || 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="cell-amount-plain">
                    ₹ {Number(row.paidAmount || 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Chip
                      icon={st.icon}
                      label={row.feeStatus}
                      size="small"
                      className={`chip-status ${st.className}`}
                    />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: 13 }}>
                    {row.enrolledDate || "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Download PDF Receipt">
                        <IconButton size="small" className="btn-action-icon btn-action-download" onClick={() => downloadReceipt(row)}>
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Enrollment">
                        <IconButton size="small" className="btn-action-icon btn-action-edit" onClick={() => { setEditData(row); setModalOpen(true); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" className="btn-action-icon btn-action-delete" onClick={() => handleDelete(row.id)}>
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

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />
    </Box>
  );
}