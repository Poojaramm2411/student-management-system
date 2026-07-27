import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton, Typography, Box, Link
} from "@mui/material";
import { Close } from "@mui/icons-material";

export default function GradeSubmissionModal({ isOpen, onClose, onSave, submission }) {
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && submission) {
      setMarks(submission.marksObtained ?? "");
      setFeedback(submission.feedback || "");
      setSubmitting(false);
    }
  }, [isOpen, submission]);

  if (!submission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({ marksObtained: Number(marks), feedback });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>Grade Submission — {submission.studentName}</Typography>
          <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Assignment: {submission.assignmentTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "—"}
            </Typography>
          </Box>

          {submission.content && (() => {
            let parsedAnswers = null;
            try {
              if (submission.content.trim().startsWith("{") || submission.content.trim().startsWith("[")) {
                parsedAnswers = JSON.parse(submission.content);
              }
            } catch (e) {}

            if (parsedAnswers && typeof parsedAnswers === "object") {
              return (
                <Box sx={{ mb: 2, p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
                    Test Submission Answers (Set {submission.assignedSet || "—"})
                  </Typography>
                  {Object.entries(parsedAnswers).map(([qId, ans], idx) => (
                    <Box key={qId} sx={{ mb: 1.5, "&:last-child": { mb: 0 } }}>
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Question #{idx + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 1, mt: 0.5, color: "text.primary", whiteSpace: "pre-wrap" }}>
                        {ans || "—"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            }

            return (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 1 }}>
                <Typography variant="caption" fontWeight={700}>Text Submission</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{submission.content}</Typography>
              </Box>
            );
          })()}
          {submission.fileUrl && (
            <Box sx={{ mb: 2 }}>
              <Link href={submission.fileUrl} target="_blank" rel="noopener">📎 View submitted file</Link>
            </Box>
          )}
          {submission.linkUrl && (
            <Box sx={{ mb: 2 }}>
              <Link href={submission.linkUrl} target="_blank" rel="noopener">🔗 {submission.linkUrl}</Link>
            </Box>
          )}

          <TextField
            fullWidth type="number" label={`Marks (out of ${submission.maxMarks})`}
            value={marks} onChange={(e) => setMarks(e.target.value)}
            required sx={{ mb: 2 }}
            inputProps={{ min: 0, max: submission.maxMarks }}
          />
          <TextField
            fullWidth multiline minRows={3} label="Feedback"
            value={feedback} onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save Grade"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}