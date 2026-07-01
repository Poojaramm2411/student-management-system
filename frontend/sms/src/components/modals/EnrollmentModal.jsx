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
  cardNumber: "", upiId: "", accountNumber: "", chequeNumber: "",
};

export default function EnrollmentModal({ isOpen, onClose, onSave, editData }) {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEnrollmentDropdowns());
  }, [dispatch]);

  // ✅ Bulletproof guard: force students/courses/batches to always be arrays,
  // no matter what shape the slice actually returns. This alone prevents
  // any "X.map is not a function" crash inside this component.
  const enrollmentState = useSelector((s) => s.enrollments) || {};
  console.log("enrollment redux state:", enrollmentState);
  const students = Array.isArray(enrollmentState.students) ? enrollmentState.students : [];
  const courses  = Array.isArray(enrollmentState.courses)  ? enrollmentState.courses  : [];
  const batches  = Array.isArray(enrollmentState.batches)  ? enrollmentState.batches  : [];

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
        <div className="modal-header" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #E5E7EB",
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {editData ? "Edit Enrollment" : "New Enrollment"}
          </h2>
          <button className="modal-close" onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: "#6B7280", padding: 4,
          }}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: 20,
              rowGap: 16,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Select Student
              </label>
              <select
                value={form.studentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                required
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                  background: "#fff", boxSizing: "border-box",
                }}
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Select Course
              </label>
              <select
                value={form.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                required
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                  background: "#fff", boxSizing: "border-box",
                }}
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseName}{c.fee ? ` — ₹${Number(c.fee).toLocaleString("en-IN")}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Select Batch
              </label>
              <select
                value={form.batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                required
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                  background: "#fff", boxSizing: "border-box",
                }}
              >
                <option value="">-- Select Batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batchName}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Fee Status
              </label>
              <select
                value={form.feeStatus}
                onChange={(e) => setForm(f => ({ ...f, feeStatus: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                  background: "#fff", boxSizing: "border-box",
                }}
              >
                {FEE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Amount Paid (₹)
              </label>
              <input
                type="number"
                value={form.paidAmount}
                onChange={(e) => setForm(f => ({ ...f, paidAmount: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Payment Mode
              </label>
              <select
                value={form.paymentMode}
                onChange={(e) => setForm(f => ({ ...f, paymentMode: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                  background: "#fff", boxSizing: "border-box",
                }}
              >
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* ── Conditional payment detail fields ── */}
            {form.paymentMode === "Card" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                  Card Number
                </label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={(e) => setForm(f => ({ ...f, cardNumber: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8,
                    border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            {form.paymentMode === "Bank Transfer" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8,
                    border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            {form.paymentMode === "Cheque" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                  Cheque Number
                </label>
                <input
                  type="text"
                  placeholder="Enter cheque number"
                  value={form.chequeNumber}
                  onChange={(e) => setForm(f => ({ ...f, chequeNumber: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8,
                    border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            {form.paymentMode === "UPI" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                  Scan to Pay
                </label>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: 16, border: "1px solid #E5E7EB", borderRadius: 10,
                  background: "#F9FAFB",
                }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=${encodeURIComponent(form.upiId || "yourinstitute@upi")}%26am=${gst.total || form.baseFee || 0}%26cu=INR`}
                    alt="UPI QR Code"
                    width={110}
                    height={110}
                    style={{ borderRadius: 6, border: "1px solid #E5E7EB", background: "#fff" }}
                  />
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                      UPI ID (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="student@upi"
                      value={form.upiId}
                      onChange={(e) => setForm(f => ({ ...f, upiId: e.target.value }))}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        border: "1px solid #D1D5DB", fontSize: 14, color: "#111827",
                        boxSizing: "border-box", background: "#fff",
                      }}
                    />
                    <p style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                      Scan the QR with any UPI app to pay ₹{(gst.total || form.baseFee || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            )}
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

          <div className="modal-footer" style={{
            display: "flex", justifyContent: "flex-end", gap: 12,
            marginTop: 24, paddingTop: 16, borderTop: "1px solid #E5E7EB",
          }}>
            <button type="button" className="btn" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 8, border: "1px solid #D1D5DB",
              background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: "#6366F1", color: "#fff", fontWeight: 600,
              fontSize: 14, cursor: "pointer",
            }}>
              {editData ? "Update" : "Enroll & Apply Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}