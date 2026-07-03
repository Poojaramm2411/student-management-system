import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";

const COURSE_NAMES = [
  "react development",
  "Java",
  "Mern Fullstack",
  "Mean Fullstack",
  "Python",
  "Mevn Fullstack",
  "C++",
  "Manual Testing",
  "Devops",
];

// Matches exactly the codes currently in your course table
const COURSE_CODES = [
  "CRS001",
  "CRS003",
  "CRS005",
  "CRS007",
  "CRS010",
  "CRS013",
  "CRS018",
  "CRS019",
  "CRS020",
];

const DURATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function CourseModal({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState({
    courseName: "", courseCode: "", duration: "", fee: "", status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        courseName: editData.courseName || "", courseCode: editData.courseCode || "",
        duration: editData.duration || "", fee: editData.fee || "", status: editData.status || "ACTIVE",
      } : { courseName: "", courseCode: "", duration: "", fee: "", status: "ACTIVE" });
      setSubmitting(false);
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({ ...form, duration: Number(form.duration), fee: Number(form.fee) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editData ? "Edit Course" : "Add Course"}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Course Name" value={form.courseName} onChange={set("courseName")} required>
                <MenuItem value="">-- Select Course --</MenuItem>
                {COURSE_NAMES.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
                {editData && editData.courseName && !COURSE_NAMES.includes(editData.courseName) && (
                  <MenuItem value={editData.courseName}>{editData.courseName}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Course Code" value={form.courseCode}
                onChange={set("courseCode")} required
                disabled={!!editData}
              >
                <MenuItem value="">-- Select Code --</MenuItem>
                {COURSE_CODES.map((code) => (
                  <MenuItem key={code} value={code}>{code}</MenuItem>
                ))}
                {editData && editData.courseCode && !COURSE_CODES.includes(editData.courseCode) && (
                  <MenuItem value={editData.courseCode}>{editData.courseCode}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Duration (months)" value={form.duration} onChange={set("duration")} required>
                <MenuItem value="">-- Select Duration --</MenuItem>
                {DURATIONS.map((m) => (
                  <MenuItem key={m} value={m}>{m} {m === 1 ? "month" : "months"}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fees (₹)"
                type="number"
                value={form.fee}
                onChange={set("fee")}
                required
                inputProps={{ min: 1 }}
                autoComplete="off"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={set("status")}>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save Course"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}