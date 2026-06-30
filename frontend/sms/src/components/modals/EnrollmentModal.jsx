import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX } from "react-icons/fi";
import enrollmentService from "../../services/enrollmentService";
import { fetchEnrollmentDropdowns } from "../../store/slices/enrollmentSlice";

const FEE_STATUSES  = ["Paid", "Pending", "Partial"];
const PAYMENT_MODES = ["Cash", "Card", "UPI", "Bank Transfer", "Cheque"];

const EMPTY = {
  studentId: "", studentName: "",
  courseId:  "", courseName:  "",
  batchId:   "", batchName:   "",
  baseFee: 0, gstAmount: 0, totalFee: 0,
  paidAmount: 0, feeStatus: "Pending",
  paymentMode: "Cash", status: "Active",
};

export default function EnrollmentModal({ isOpen, onClose, onSave, editData }) {

  const dispatch = useDispatch();

    useEffect(() => {
      dispatch(fetchEnrollmentDropdowns());
    }, [dispatch]);
  const { students, courses, batches } = useSelector((s) => s.enrollments);
  const [form, setForm] = useState(EMPTY);
  const [gst, setGst]   = useState({ base:0, gst:0, sgst:0, cgst:0, total:0 });

  useEffect(() => {
    if (editData) {
      setForm({ ...EMPTY, ...editData });
      if (editData.baseFee) setGst(enrollmentService.calculateGST(editData.baseFee));
    } else {
      setForm(EMPTY);
      setGst({ base:0, gst:0, sgst:0, cgst:0, total:0 });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (courseId) => {
    const c = courses.find(x => String(x.id) === String(courseId));
    const calc = enrollmentService.calculateGST(c?.fee || 0);
    setGst(calc);
    setForm(f => ({
      ...f, courseId, courseName: c?.courseName || "",
      baseFee: calc.base, gstAmount: calc.gst, totalFee: calc.total,
    }));
  };

  const handleStudentChange = (studentId) => {
    const s = students.find(x => String(x.id) === String(studentId));
    setForm(f => ({ ...f, studentId, studentName: s?.name || "" }));
  };

  const handleBatchChange = (batchId) => {
    const b = batches.find(x => String(x.id) === String(batchId));
    setForm(f => ({ ...f, batchId, batchName: b?.batchName || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.courseId || !form.batchId) {
      alert("Please select Student, Course and Batch.");
      return;
    }
    onSave({
      ...form,
      studentId:  Number(form.studentId),
      courseId:   Number(form.courseId),
      batchId:    Number(form.batchId),
      paidAmount: Number(form.paidAmount),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2>{editData ? "Edit Enrollment" : "New Enrollment"}</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Select Student</label>
              <select value={form.studentId}
                onChange={(e) => handleStudentChange(e.target.value)} required>
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Course</label>
              <select value={form.courseId}
                onChange={(e) => handleCourseChange(e.target.value)} required>
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseName}{c.fee ? ` — ₹${Number(c.fee).toLocaleString("en-IN")}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Batch</label>
              <select value={form.batchId}
                onChange={(e) => handleBatchChange(e.target.value)} required>
                <option value="">-- Select Batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batchName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fee Status</label>
              <select value={form.feeStatus}
                onChange={(e) => setForm(f => ({ ...f, feeStatus: e.target.value }))}>
                {FEE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Amount Paid (₹)</label>
              <input type="number" value={form.paidAmount}
                onChange={(e) => setForm(f => ({ ...f, paidAmount: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <select value={form.paymentMode}
                onChange={(e) => setForm(f => ({ ...f, paymentMode: e.target.value }))}>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {gst.base > 0 && (
            <div style={{
              marginTop: 16, padding: 16, background: "#F9FAFB",
              borderRadius: 10, border: "1px solid #E5E7EB",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                Fee Summary (GST Breakdown)
              </div>
              {[
                ["Base Fee",        `₹ ${gst.base.toLocaleString("en-IN")}`],
                ["SGST (9%)",       `₹ ${gst.sgst.toLocaleString("en-IN")}`],
                ["CGST (9%)",       `₹ ${gst.cgst.toLocaleString("en-IN")}`],
                ["Total GST (18%)", `₹ ${gst.gst.toLocaleString("en-IN")}`],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "4px 0", fontSize: 13, color: "#6B7280",
                }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginTop: 8, paddingTop: 8, borderTop: "1px solid #E5E7EB",
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total Payable</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#6366F1" }}>
                  ₹ {gst.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editData ? "Update" : "Enroll & Apply Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}