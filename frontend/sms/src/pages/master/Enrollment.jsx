import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from "react-icons/fi";
import {
  fetchEnrollments, addEnrollment, editEnrollment,
  removeEnrollment, fetchEnrollmentDropdowns,
} from "../../store/Slices/enrollmentSlice";
import EnrollmentModal from "../../components/modals/EnrollmentModal";
import "../../styles/Table.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_STYLE = {
  Paid:    { bg:"#DCFCE7", color:"#166534" },
  Pending: { bg:"#FEE2E2", color:"#991B1B" },
  Partial: { bg:"#FEF3C7", color:"#92400E" },
};

export default function Enrollment() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.enrollments);

  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null);

  
  useEffect(() => {
    dispatch(fetchEnrollments());
    dispatch(fetchEnrollmentDropdowns());
  }, [dispatch]);

  const filtered = items.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = [e.studentName, e.courseName, e.batchName]
      .some(v => String(v || "").toLowerCase().includes(q));
    const matchTab = tab === "All" ? true : e.feeStatus === tab;
    return matchSearch && matchTab;
  });

  const counts = {
    All:     items.length,
    Paid:    items.filter(e => e.feeStatus === "Paid").length,
    Pending: items.filter(e => e.feeStatus === "Pending").length,
    Partial: items.filter(e => e.feeStatus === "Partial").length,
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
    dispatch(fetchEnrollments());
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this enrollment?")) return;
    const result = await dispatch(removeEnrollment(id));
    if (removeEnrollment.fulfilled.match(result)) toast.success("Deleted");
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
    doc.text("Student Management System", 105, 13, { align:"center" });
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Enrollment Fee Receipt", 105, 23, { align:"center" });

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
      head:  [["Description", "Rate", "Amount (₹)"]],
      body:  [
        ["Base Course Fee",      "—",   `₹ ${base.toLocaleString("en-IN")}`],
        ["SGST",                 "9%",  `₹ ${sgst.toLocaleString("en-IN")}`],
        ["CGST",                 "9%",  `₹ ${cgst.toLocaleString("en-IN")}`],
        ["Total GST",            "18%", `₹ ${gst.toLocaleString("en-IN")}`],
        ["Total Payable Amount", "",    `₹ ${total.toLocaleString("en-IN")}`],
        ["Amount Paid",          "",    `₹ ${paid.toLocaleString("en-IN")}`],
        ["Balance Due",          "",    `₹ ${due.toLocaleString("en-IN")}`],
      ],
      headStyles:         { fillColor:[21,101,192], fontSize:11 },
      styles:             { fontSize:11 },
      alternateRowStyles: { fillColor:[249,250,251] },
    });

    const fy = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9); doc.setTextColor(130, 130, 130);
    doc.text("This is a system generated receipt. No signature required.", 105, fy, { align:"center" });
    doc.save(`receipt_${rno}.pdf`);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enrollment</h1>
          <p className="page-subtitle">{items.length} total enrollments</p>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setEditData(null); setModalOpen(true); }}>
          <FiPlus /> New Enrollment
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total",   value:counts.All,     color:"#6366F1" },
          { label:"Paid",    value:counts.Paid,    color:"#10B981" },
          { label:"Pending", value:counts.Pending, color:"#EF4444" },
          { label:"Partial", value:counts.Partial, color:"#F59E0B" },
        ].map(s => (
          <div key={s.label} style={{
            background:"#fff", borderRadius:10, padding:"14px 18px",
            borderLeft:`4px solid ${s.color}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:13, color:"#6B7280" }}>{s.label} Enrollments</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["All","Paid","Pending","Partial"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding:"6px 16px", borderRadius:20, border:"1px solid #E5E7EB",
              background: tab === t ? "#1565C0" : "#fff",
              color: tab === t ? "#fff" : "#374151",
              fontWeight:600, fontSize:13, cursor:"pointer",
            }}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <FiSearch />
          <input className="search-input"
            placeholder="Search by student, course or batch..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Course Name</th>
              <th>Batch</th>
              <th>Base Fee</th>
              <th>GST</th>
              <th>Total Fee</th>
              <th>Paid</th>
              <th>Fee Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="11" style={{ textAlign:"center", padding:40, color:"var(--text-muted)" }}>
                Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="11" style={{ textAlign:"center", padding:40, color:"var(--text-muted)" }}>
                No enrollments found</td></tr>
            ) : filtered.map((row, i) => {
              const sc = STATUS_STYLE[row.feeStatus] || STATUS_STYLE.Pending;
              return (
                <tr key={row.id}>
                  <td className="cell-id">{i + 1}</td>
                  <td className="cell-name">{row.studentName}</td>
                  <td>{row.courseName}</td>
                  <td>{row.batchName}</td>
                  <td>₹ {Number(row.baseFee || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(row.gstAmount || 0).toLocaleString("en-IN")}</td>
                  <td><strong>₹ {Number(row.totalFee || 0).toLocaleString("en-IN")}</strong></td>
                  <td>₹ {Number(row.paidAmount || 0).toLocaleString("en-IN")}</td>
                  <td>
                    <span style={{
                      padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700,
                      background:sc.bg, color:sc.color,
                    }}>{row.feeStatus}</span>
                  </td>
                  <td>{row.enrolledDate || "—"}</td>
                  <td>
                    <div className="action-cell">
                      <button className="action-btn action-btn-view"
                        onClick={() => downloadReceipt(row)} title="Download Receipt">
                        <FiDownload />
                      </button>
                      <button className="action-btn action-btn-edit"
                        onClick={() => { setEditData(row); setModalOpen(true); }} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="action-btn action-btn-delete"
                        onClick={() => handleDelete(row.id)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />
    </div>
  );
}