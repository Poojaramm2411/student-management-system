import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";

export default function StudentModal({ isOpen, onClose, onSave, editData, batches = [], nextStudentCode = "" }) {
  const [form, setForm] = useState({ name: "", email: "", age: "", studentCode: "", city: "", status: "ACTIVE", batchId: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        name: editData.name || "", email: editData.email || "",
        age: editData.age || "", studentCode: editData.studentCode || "",
        city: editData.city || "", status: editData.status || "ACTIVE", batchId: editData.batchId || "",
      } : { name: "", email: "", age: "", studentCode: "", city: "", status: "ACTIVE", batchId: "" });
      setSubmitting(false);
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({ ...form, age: Number(form.age), batchId: Number(form.batchId) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editData ? "Edit Student" : "Add Student"}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" value={form.name} onChange={set("name")} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={form.email} onChange={set("email")} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Age" type="number" value={form.age} onChange={set("age")} inputProps={{ min: 10, max: 60 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Student Code"
                value={editData ? form.studentCode : nextStudentCode}
                InputProps={{ readOnly: true }}
                helperText="Auto-generated — can't be edited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" value={form.city} onChange={set("city")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Batch" value={form.batchId} onChange={set("batchId")} required>
                <MenuItem value="">-- Select Batch --</MenuItem>
                {batches.map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.batchName}{b.batchCode ? ` (${b.batchCode})` : ""}
                  </MenuItem>
                ))}
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
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save Student"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}