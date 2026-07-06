import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Card, Tabs, Tab, Chip,
} from "@mui/material";
import { Add, Edit, Delete, Search, Download } from "@mui/icons-material";
import {
  fetchEnrollments, fetchEnrollmentSummary, addEnrollment, editEnrollment,
  removeEnrollment, fetchEnrollmentDropdowns,
} from "../../store/Slices/enrollmentSlice";
import EnrollmentModal from "../../components/modals/EnrollmentModal";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_COLOR = {
  Paid:    "success",
  Pending: "error",
  Partial: "warning",
};

const SUMMARY_CARDS = [
  { key: "All",     label: "Total",   color: "#6366F1" },
  { key: "Paid",    label: "Paid",    color: "#10B981" },
  { key: "Pending", label: "Pending", color: "#EF4444" },
  { key: "Partial", label: "Partial", color: "#F59E0B" },
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

    doc.setFillColor(21, 101, 192);
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
      headStyles:         { fillColor: [21, 101, 192], fontSize: 11 },
      styles:             { fontSize: 11 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    const fy = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9); doc.setTextColor(130, 130, 130);
    doc.text("This is a system generated receipt. No signature required.", 105, fy, { align: "center" });
    doc.save(`receipt_${rno}.pdf`);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Enrollment</Typography>
          <Typography variant="body2" color="text.secondary">{totalElements} total enrollments</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setEditData(null); setModalOpen(true); }}>
          New Enrollment
        </Button>
      </Box>

      {/* Summary cards — always reflect the full table, not just the current page/filter */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        {SUMMARY_CARDS.map((s) => (
          <Card key={s.key} variant="outlined" sx={{ p: "14px 18px", borderLeft: `4px solid ${s.color}` }}>
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: s.color }}>{summary[s.key]}</Typography>
            <Typography variant="body2" color="text.secondary">{s.label} Enrollments</Typography>
          </Card>
        ))}
      </Box>

      {/* Filter tabs */}
      <Tabs
        value={tab}
        onChange={handleTab}
        sx={{ mb: 2, minHeight: 36, "& .MuiTabs-indicator": { display: "none" } }}
      >
        {["All", "Paid", "Pending", "Partial"].map((t) => (
          <Tab
            key={t}
            value={t}
            label={`${t} (${summary[t]})`}
            sx={{
              minHeight: 36, borderRadius: 5, mr: 1, fontWeight: 600, fontSize: 13,
              border: "1px solid #E5E7EB", textTransform: "none",
              color: tab === t ? "#fff" : "#374151",
              background: tab === t ? "#1565C0" : "#fff",
              "&.Mui-selected": { color: "#fff" },
            }}
          />
        ))}
      </Tabs>

      <TextField
        size="small"
        placeholder="Search by student, course or batch..."
        value={search}
        onChange={handleSearch}
        sx={{ mb: 2, width: 320 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
        }}
      />

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 1150 }}>
          <TableHead sx={{ "& th": { fontWeight: 700, color: "#1565C0", backgroundColor: "#F1F5F9" } }}>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Base Fee</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>GST</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Total Fee</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Paid</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Fee Status</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Date</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} align="center" sx={{ py: 5, color: "text.secondary" }}>Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={11} align="center" sx={{ py: 5, color: "text.secondary" }}>No enrollments found</TableCell></TableRow>
            ) : items.map((row, i) => (
              <TableRow key={row.id} hover>
                <TableCell>{page * size + i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.studentName}</TableCell>
                <TableCell>{row.courseName}</TableCell>
                <TableCell>{row.batchName}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>₹ {Number(row.baseFee || 0).toLocaleString("en-IN")}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>₹ {Number(row.gstAmount || 0).toLocaleString("en-IN")}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}><strong>₹ {Number(row.totalFee || 0).toLocaleString("en-IN")}</strong></TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>₹ {Number(row.paidAmount || 0).toLocaleString("en-IN")}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {/* Fee status is derived server-side from paid vs total —
                      it is not user-editable here, only a display badge.
                      To change it, edit the enrollment's paid amount instead. */}
                  <Chip
                    label={row.feeStatus}
                    size="small"
                    color={STATUS_COLOR[row.feeStatus] || "default"}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.enrolledDate || "—"}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Download Receipt">
                    <IconButton size="small" onClick={() => downloadReceipt(row)}>
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditData(row); setModalOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
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

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />
    </Box>
  );
}