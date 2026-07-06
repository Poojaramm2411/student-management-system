import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography,
  Autocomplete, Box, Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import enrollmentService from "../../services/enrollmentService";
import { fetchEnrollmentDropdowns } from "../../store/Slices/enrollmentSlice";

const PAYMENT_MODES = ["Cash", "Card", "UPI", "Bank Transfer", "Cheque"];

// Mirrors the backend's EnrollmentService.deriveFeeStatus() exactly —
// this is DISPLAY ONLY. The server always recomputes and is the source
// of truth; this just gives the user live feedback while typing.
const deriveFeeStatus = (paidAmount, totalFee) => {
  const paid = Number(paidAmount) || 0;
  const total = Number(totalFee) || 0;
  if (paid <= 0) return "Pending";
  if (paid >= total) return "Paid";
  return "Partial";
};

const EMPTY = {
  studentId: "", studentName: "",
  studentEmail: "", studentAge: "", studentCity: "",
  courseId:  "", courseName:  "",
  batchId:   "", batchName:   "",
  baseFee: 0, gstAmount: 0, totalFee: 0,
  paidAmount: 0,
  paymentMode: "Cash", status: "Active",
  cardNumber: "", upiId: "", accountNumber: "", chequeNumber: "",
};

export default function EnrollmentModal({ isOpen, onClose, onSave, editData }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEnrollmentDropdowns());
  }, [dispatch]);

  const enrollmentState = useSelector((s) => s.enrollments) || {};
  const students = Array.isArray(enrollmentState.students) ? enrollmentState.students : [];
  const courses  = Array.isArray(enrollmentState.courses)  ? enrollmentState.courses  : [];
  const batches  = Array.isArray(enrollmentState.batches)  ? enrollmentState.batches  : [];

  const [form, setForm] = useState(EMPTY);
  const [gst, setGst]   = useState({ base: 0, gst: 0, sgst: 0, cgst: 0, total: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({ ...EMPTY, ...editData });
        if (editData.baseFee) setGst(enrollmentService.calculateGST(editData.baseFee));
      } else {
        setForm(EMPTY);
        setGst({ base: 0, gst: 0, sgst: 0, cgst: 0, total: 0 });
      }
      setSubmitting(false);
    }
  }, [editData, isOpen]);

  const handleCourseChange = (courseId) => {
    const c = courses.find(x => String(x.id) === String(courseId));
    const calc = enrollmentService.calculateGST(c?.fee || 0);
    setGst(calc);
    setForm(f => ({
      ...f, courseId, courseName: c?.courseName || "",
      baseFee: calc.base, gstAmount: calc.gst, totalFee: calc.total,
    }));
  };

  // Student is a free-text field instead of a dropdown. As the person types,
  // we check for an exact (case-insensitive) match against existing
  // students. If found, we link to that student and auto-fill their
  // email/age/city (read-only — no need to re-enter them). If no match is
  // found, studentId is cleared and the Email/Age/City fields appear so a
  // brand-new student record can be created with real data instead of
  // auto-generated placeholders.
  const handleStudentNameChange = (name) => {
    const match = students.find(
      (s) => s.name?.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (match) {
      setForm(f => ({
        ...f,
        studentName: name,
        studentId: match.id,
        studentEmail: match.email || "",
        studentAge: match.age || "",
        studentCity: match.city || "",
      }));
    } else {
      setForm(f => ({ ...f, studentName: name, studentId: "" }));
    }
  };

  const handleBatchChange = (batchId) => {
    const b = batches.find(x => String(x.id) === String(batchId));
    setForm(f => ({ ...f, batchId, batchName: b?.batchName || "" }));
  };

  const isNewStudent = !form.studentId;
  const totalPayable = gst.total || form.totalFee || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.studentName?.trim() || !form.courseId || !form.batchId) {
      alert("Please enter Student Name and select Course and Batch.");
      return;
    }
    if (isNewStudent && !form.studentEmail?.trim()) {
      alert("Please enter an email for the new student — it's needed for their Students page record.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...form,
        studentName: form.studentName.trim(),
        // studentId is only present when editing an existing enrollment whose
        // student wasn't changed. For a new enrollment it's null, and the
        // backend finds-or-creates a student from studentName instead.
        studentId:    form.studentId ? Number(form.studentId) : null,
        studentEmail: form.studentEmail?.trim() || null,
        studentAge:   form.studentAge ? Number(form.studentAge) : null,
        studentCity:  form.studentCity?.trim() || null,
        courseId:   Number(form.courseId),
        batchId:    Number(form.batchId),
        paidAmount: Number(form.paidAmount),
        // feeStatus is intentionally NOT sent here as a user choice — the
        // backend always derives it from paidAmount vs totalFee. Sending the
        // live-computed value anyway is harmless since the server ignores it,
        // but we don't rely on it client-side beyond this display.
        feeStatus: deriveFeeStatus(form.paidAmount, totalPayable),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editData ? "Edit Enrollment" : "New Enrollment"}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              {/* Suggests existing students as you type, but any name can be
                  typed — if it doesn't match an existing student, a new one
                  is created automatically and will appear on the Students page. */}
              <Autocomplete
                freeSolo
                options={students.map(s => s.name)}
                inputValue={form.studentName}
                onInputChange={(e, value) => handleStudentNameChange(value || "")}
                renderInput={(params) => (
                  <TextField {...params} label="Student Name" placeholder="Type student name" required
                    helperText={!isNewStudent && form.studentName ? "Existing student — details loaded automatically." : " "}
                  />
                )}
              />
            </Grid>

            {/* Only shown for a name that doesn't match an existing student —
                this is what fills in the Students page record instead of
                auto-generated placeholder email/code. */}
            {isNewStudent && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth type="email" label="Student Email *"
                    placeholder="student@email.com"
                    value={form.studentEmail}
                    onChange={(e) => setForm(f => ({ ...f, studentEmail: e.target.value }))}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth type="number" label="Age" placeholder="Age"
                    inputProps={{ min: 10, max: 60 }}
                    value={form.studentAge}
                    onChange={(e) => setForm(f => ({ ...f, studentAge: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="City" placeholder="City"
                    value={form.studentCity}
                    onChange={(e) => setForm(f => ({ ...f, studentCity: e.target.value }))}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Select Course"
                value={form.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                required
              >
                <MenuItem value="">-- Select Course --</MenuItem>
                {courses.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.courseName}{c.fee ? ` — ₹${Number(c.fee).toLocaleString("en-IN")}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Select Batch"
                value={form.batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                required
              >
                <MenuItem value="">-- Select Batch --</MenuItem>
                {/* Batch code shown alongside the name since batch names
                    (e.g. "Morning batch") repeat across different batches. */}
                {batches.map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.batchName}{b.batchCode ? ` (${b.batchCode})` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="number" label="Amount Paid (₹)"
                value={form.paidAmount}
                onChange={(e) => setForm(f => ({ ...f, paidAmount: e.target.value }))}
                inputProps={{ min: 0, max: totalPayable || undefined }}
                helperText={totalPayable > 0 ? `Total payable: ₹${totalPayable.toLocaleString("en-IN")}` : " "}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Payment Mode"
                value={form.paymentMode}
                onChange={(e) => setForm(f => ({ ...f, paymentMode: e.target.value }))}
              >
                {PAYMENT_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>

            {/* ── Conditional payment detail fields ── */}
            {form.paymentMode === "Card" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Card Number" placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                  value={form.cardNumber}
                  onChange={(e) => setForm(f => ({ ...f, cardNumber: e.target.value }))}
                />
              </Grid>
            )}

            {form.paymentMode === "Bank Transfer" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Account Number" placeholder="Enter account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                />
              </Grid>
            )}

            {form.paymentMode === "Cheque" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Cheque Number" placeholder="Enter cheque number"
                  value={form.chequeNumber}
                  onChange={(e) => setForm(f => ({ ...f, chequeNumber: e.target.value }))}
                />
              </Grid>
            )}

            {form.paymentMode === "UPI" && (
              <Grid item xs={12}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Scan to Pay</Typography>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 2, p: 2,
                  border: "1px solid #E5E7EB", borderRadius: 2, background: "#F9FAFB",
                }}>
                  <Box
                    component="img"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=${encodeURIComponent(form.upiId || "yourinstitute@upi")}%26am=${gst.total || form.baseFee || 0}%26cu=INR`}
                    alt="UPI QR Code"
                    width={110}
                    height={110}
                    sx={{ borderRadius: 1, border: "1px solid #E5E7EB", background: "#fff" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth size="small" label="UPI ID (optional)" placeholder="student@upi"
                      value={form.upiId}
                      onChange={(e) => setForm(f => ({ ...f, upiId: e.target.value }))}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Scan the QR with any UPI app to pay ₹{(gst.total || form.baseFee || 0).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            {gst.base > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, background: "#F9FAFB", borderRadius: 2, border: "1px solid #E5E7EB" }}>
                  <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                    Fee Summary (GST Breakdown)
                  </Typography>
                  {[
                    ["Base Fee",        `₹ ${gst.base.toLocaleString("en-IN")}`],
                    ["SGST (9%)",       `₹ ${gst.sgst.toLocaleString("en-IN")}`],
                    ["CGST (9%)",       `₹ ${gst.cgst.toLocaleString("en-IN")}`],
                    ["Total GST (18%)", `₹ ${gst.gst.toLocaleString("en-IN")}`],
                  ].map(([k, v]) => (
                    <Box key={k} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" color="text.secondary">{v}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight={700}>Total Payable</Typography>
                    <Typography fontWeight={800} color="primary">
                      ₹ {gst.total.toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : editData ? "Update" : "Enroll & Apply Fee"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}