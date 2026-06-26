import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";

export default function StudentModal({ isOpen, onClose, onSave, editData, batches = [] }) {
  const [form, setForm] = useState({ name: "", email: "", age: "", studentCode: "", city: "", status: "ACTIVE", batchId: "" });

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        name: editData.name || "", email: editData.email || "",
        age: editData.age || "", studentCode: editData.studentCode || "",
        city: editData.city || "", status: editData.status || "ACTIVE", batchId: editData.batchId || "",
      } : { name: "", email: "", age: "", studentCode: "", city: "", status: "ACTIVE", batchId: "" });
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, age: Number(form.age), batchId: Number(form.batchId) });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
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
              <TextField fullWidth label="Student Code" value={form.studentCode} onChange={set("studentCode")} required InputProps={{ readOnly: !!editData }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" value={form.city} onChange={set("city")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Batch" value={form.batchId} onChange={set("batchId")} required>
                <MenuItem value="">-- Select Batch --</MenuItem>
                {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.batchName}</MenuItem>)}
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
          <Button type="submit" variant="contained">Save Student</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}