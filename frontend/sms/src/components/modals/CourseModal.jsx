import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";

const COURSE_NAMES = [
  "Java Full Stack Development",
  "Python Full Stack Development",
  "React & Node.js Developer",
  "Data Science & Machine Learning",
  "Cyber Security",
  "AWS Cloud Solutions Architect",
  "UI/UX Design",
  "Software Testing & QA"
];

export default function CourseModal({ isOpen, onClose, onSave, editData, batches = [] }) {
  const [form, setForm] = useState({
    courseName: "", courseCode: "", department: "", duration: "", fee: "", status: "ACTIVE", batchId: "",
  });

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        courseName: editData.courseName || "", courseCode: editData.courseCode || "",
        department: editData.department || "",
        duration: editData.duration || "", fee: editData.fee || "", status: editData.status || "ACTIVE", batchId: editData.batchId || "",
      } : { courseName: "", courseCode: "", department: "", duration: "", fee: "", status: "ACTIVE", batchId: "" });
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, duration: Number(form.duration), fee: Number(form.fee), batchId: Number(form.batchId) });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editData ? "Edit Course" : "Add Course"}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Course Name" value={form.courseName} onChange={set("courseName")} required>
                <MenuItem value="">-- Select Course --</MenuItem>
                {COURSE_NAMES.map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
                {editData && editData.courseName && !COURSE_NAMES.includes(editData.courseName) && (
                  <MenuItem value={editData.courseName}>{editData.courseName}</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Course Code" value={form.courseCode} onChange={set("courseCode")} required InputProps={{ readOnly: !!editData }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" value={form.department} onChange={set("department")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Duration (months)" type="number" value={form.duration} onChange={set("duration")} inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fees (₹)" type="number" value={form.fee} onChange={set("fee")} required inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Batch" value={form.batchId} onChange={set("batchId")} required>
                <MenuItem value="">-- Select Batch --</MenuItem>
                {batches.filter(b => {
                  const name = b.batchName?.toLowerCase() || "";
                  const isThree = name.includes("morning") || name.includes("evening") || name.includes("afternoon");
                  const isCurrent = editData && String(b.id) === String(editData.batchId);
                  return isThree || isCurrent;
                }).map(b => <MenuItem key={b.id} value={b.id}>{b.batchName}</MenuItem>)}
              </TextField>
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
          <Button type="submit" variant="contained">Save Course</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}