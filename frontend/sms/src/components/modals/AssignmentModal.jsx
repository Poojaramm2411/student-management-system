import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography, Box, CircularProgress
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";
import { uploadFile } from "../../services/fileUploadService";

export default function AssignmentModal({ isOpen, onClose, onSave, editData, batches = [], instructors = [] }) {
  const [form, setForm] = useState({
    title: "", description: "", batchId: "", instructorId: "",
    assignedDate: "", dueDate: "", maxMarks: "", attachmentUrl: "",
    submissionType: "TEXT", status: "DRAFT",
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editData ? {
        title: editData.title || "", description: editData.description || "",
        batchId: editData.batchId || "", instructorId: editData.instructorId || "",
        assignedDate: editData.assignedDate || "", dueDate: editData.dueDate || "",
        maxMarks: editData.maxMarks ?? "", attachmentUrl: editData.attachmentUrl || "",
        submissionType: editData.submissionType || "TEXT", status: editData.status || "DRAFT",
      } : {
        title: "", description: "", batchId: "", instructorId: "",
        assignedDate: "", dueDate: "", maxMarks: "", attachmentUrl: "",
        submissionType: "TEXT", status: "DRAFT",
      });
      setSubmitting(false);
    }
  }, [editData, isOpen]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      setForm(f => ({ ...f, attachmentUrl: res.fileUrl }));
    } catch (err) {
      alert("File upload failed: " + (err.message || "unknown error"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({
        ...form,
        batchId: Number(form.batchId),
        instructorId: Number(form.instructorId),
        maxMarks: Number(form.maxMarks),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editData ? "Edit Assignment" : "Add Assignment"}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" value={form.title} onChange={set("title")} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={3} label="Description / Instructions"
                value={form.description} onChange={set("description")} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Batch" value={form.batchId} onChange={set("batchId")} required>
                <MenuItem value="">-- Select Batch --</MenuItem>
                {batches.map(b => <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.courseName})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Instructor" value={form.instructorId} onChange={set("instructorId")} required>
                <MenuItem value="">-- Select Instructor --</MenuItem>
                {instructors.map(i => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Assigned Date" type="date" value={form.assignedDate}
                onChange={set("assignedDate")} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Due Date" type="date" value={form.dueDate}
                onChange={set("dueDate")} required InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Max Marks" type="number" value={form.maxMarks}
                onChange={set("maxMarks")} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Submission Type" value={form.submissionType}
                onChange={set("submissionType")}>
                <MenuItem value="TEXT">Text</MenuItem>
                <MenuItem value="FILE">File Upload</MenuItem>
                <MenuItem value="LINK">Link</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={set("status")}>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="PUBLISHED">Published</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
                <Button component="label" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <AttachFile />}
                  disabled={uploading} size="small">
                  {uploading ? "Uploading..." : "Attach Reference File"}
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
              </Box>
              {form.attachmentUrl && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Attached: {form.attachmentUrl.split("/").pop()}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting || uploading}>
            {submitting ? "Saving..." : "Save Assignment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}