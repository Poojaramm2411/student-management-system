import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, IconButton, Typography, Box, CircularProgress, Divider, Paper
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";
import CryptoJS from "crypto-js";
import { uploadFile } from "../../services/fileUploadService";

const decryptQuestions = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse("StudentMgmtKey12");
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Decryption failed", err);
    return null;
  }
};

export default function AssignmentModal({ isOpen, onClose, onSave, editData, batches = [], instructors = [] }) {
  const [form, setForm] = useState({
    title: "", description: "", batchId: "", instructorId: "",
    assignedDate: "", dueDate: "", maxMarks: "", attachmentUrl: "",
    submissionType: "TEXT", status: "DRAFT",
  });
  const [questions, setQuestions] = useState([]);
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

      let loadedQuestions = [];
      if (editData && editData.encryptedQuestions) {
        const decryptedStr = decryptQuestions(editData.encryptedQuestions);
        if (decryptedStr) {
          try {
            const parsed = JSON.parse(decryptedStr);
            if (Array.isArray(parsed)) {
              loadedQuestions = parsed;
            } else if (parsed && typeof parsed === "object") {
              // Migrate nested structure { set1: [...], set2: [...] } to a flat list
              const flat = [];
              for (let sKey of ["set1", "set2", "set3", "set4"]) {
                const setNum = Number(sKey.replace("set", ""));
                if (Array.isArray(parsed[sKey])) {
                  for (let q of parsed[sKey]) {
                    flat.push({ ...q, set: setNum });
                  }
                }
              }
              loadedQuestions = flat;
            }
          } catch (e) {
            console.error("Failed to parse decrypted questions", e);
          }
        }
      }
      setQuestions(loadedQuestions);
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

  const handleAddQuestionToSet = (setIndex) => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), questionText: "", set: setIndex }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const updatedList = [...prev];
      updatedList[index] = { ...updatedList[index], [field]: value };
      return updatedList;
    });
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
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
        questionsJson: JSON.stringify(questions),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700} variant="h6">{editData ? "Edit Assignment" : "Add Assignment"}</Typography>
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

            {/* Question Bank Editor Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#1565C0" }}>
                MCQ Question Bank
              </Typography>

              {/* Loop through sets 1, 2, 3, 4 */}
              {[1, 2, 3, 4].map((setNum) => {
                const setQuestions = questions.filter(q => Number(q.set) === setNum);
                
                return (
                  <Box key={setNum} sx={{ mb: 4 }}>
                    <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      bgcolor: "#EFF6FF",
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: "4px solid #1D4ED8"
                    }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1E3A8A" }}>
                        📂 Set {setNum} ({setQuestions.length} Questions)
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddQuestionToSet(setNum)}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                      >
                        + Add Question
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 1 }}>
                      {setQuestions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", pl: 1, my: 1 }}>
                          No questions added to Set {setNum} yet.
                        </Typography>
                      ) : (
                        setQuestions.map((q, localIdx) => {
                          const absIdx = questions.findIndex(item => item.id === q.id);
                          if (absIdx === -1) return null;

                          return (
                            <Paper key={q.id || localIdx} variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#F8FAFC" }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography fontWeight={700} color="text.secondary">
                                  Question {localIdx + 1}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(absIdx)}>
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Question Text"
                                    value={q.questionText}
                                    onChange={(e) => handleQuestionChange(absIdx, "questionText", e.target.value)}
                                    required
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                );
              })}
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