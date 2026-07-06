import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";

export default function BatchModal({ isOpen, onClose, onSave, editData, courses = [] }) {
  const [form, setForm] = useState({
    batchName: "", batchCode: "", startDate: "", endDate: "", status: "ACTIVE", courseId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        batchName: editData.batchName || "", batchCode: editData.batchCode || "",
        startDate: editData.startDate || "", endDate: editData.endDate || "",
        status: editData.status || "ACTIVE", courseId: editData.courseId || "",
      } : { batchName: "", batchCode: "", startDate: "", endDate: "", status: "ACTIVE", courseId: "" });
      setSubmitting(false);
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({ ...form, courseId: Number(form.courseId) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editData ? "Edit Batch" : "Add Batch"}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Batch Name" value={form.batchName} onChange={set("batchName")} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Batch Code" value={form.batchCode} onChange={set("batchCode")}
                required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Course" value={form.courseId} onChange={set("courseId")} required>
                <MenuItem value="">-- Select Course --</MenuItem>
                {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.courseName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Start Date" type="date" value={form.startDate}
                onChange={set("startDate")} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="End Date" type="date" value={form.endDate}
                onChange={set("endDate")} required InputLabelProps={{ shrink: true }} />
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
            {submitting ? "Saving..." : "Save Batch"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}