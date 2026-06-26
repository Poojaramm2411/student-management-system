import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";

export default function BatchModal({ isOpen, onClose, onSave, editData, instructors = [] }) {
  const [form, setForm] = useState({
    batchName: "", batchCode: "", startDate: "", endDate: "", status: "ACTIVE", instructorId: "",
  });

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        batchName: editData.batchName || "", batchCode: editData.batchCode || "",
        startDate: editData.startDate || "", endDate: editData.endDate || "",
        status: editData.status || "ACTIVE", instructorId: editData.instructorId || "",
      } : { batchName: "", batchCode: "", startDate: "", endDate: "", status: "ACTIVE", instructorId: "" });
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, instructorId: Number(form.instructorId) });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
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
                required InputProps={{ readOnly: !!editData }} />
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
              <TextField select fullWidth label="Instructor" value={form.instructorId}
                onChange={set("instructorId")} required>
                <MenuItem value="">-- Select Instructor --</MenuItem>
                {instructors.map(i => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
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
          <Button type="submit" variant="contained">Save Batch</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}