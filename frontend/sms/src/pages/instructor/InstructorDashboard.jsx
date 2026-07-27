import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Button, AppBar, Toolbar,
  Chip, CircularProgress, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Stack, Divider, IconButton,
} from "@mui/material";
import { Logout, Add, Quiz, Grading, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { getMyInstructorProfile } from "../../services/instructorProfileService";
import QuestionSetBuilder from "../../components/QuestionSetBuilder";
import {
  getMyInstructorAssignments,
  getMyInstructorBatches,
  createInstructorAssignment,
  getInstructorAssignmentById,
  getSubmissionsForMyAssignment,
  gradeSubmission,
} from "../../services/instructorAssignmentService";

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value ?? "—"}</Typography>
    </Grid>
  );
}

const EMPTY_FORM = {
  title: "",
  description: "",
  batchId: "",
  assignedDate: "",
  dueDate: "",
  maxMarks: "",
  submissionType: "TEXT",
};

function AddAssignmentDialog({ open, onClose, batches, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setQuestions([]); // reset each time it opens
    }
  }, [open]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.batchId || !form.dueDate || !form.maxMarks) {
      toast.error("Title, batch, due date, and max marks are required");
      return;
    }
    setSaving(true);
    try {
      await createInstructorAssignment({
        ...form,
        batchId: Number(form.batchId),
        maxMarks: Number(form.maxMarks),
        status: "PUBLISHED",
        questionsJson: JSON.stringify(questions),
      });
      toast.success("Assignment created");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>Add Assignment</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Title" value={form.title} onChange={handleChange("title")} fullWidth required />
          <TextField
            label="Description" value={form.description} onChange={handleChange("description")}
            fullWidth multiline minRows={2}
          />
          <TextField
            select label="Batch" value={form.batchId} onChange={handleChange("batchId")}
            fullWidth required helperText={batches.length === 0 ? "You have no batches assigned yet" : ""}
          >
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.batchName} ({b.batchCode})</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Assigned Date" type="date" value={form.assignedDate}
              onChange={handleChange("assignedDate")} fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Due Date" type="date" value={form.dueDate}
              onChange={handleChange("dueDate")} fullWidth required
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Max Marks" type="number" value={form.maxMarks}
              onChange={handleChange("maxMarks")} fullWidth required
            />
            <TextField
              select label="Submission Type" value={form.submissionType}
              onChange={handleChange("submissionType")} fullWidth
            >
              <MenuItem value="TEXT">Text</MenuItem>
              <MenuItem value="FILE">File</MenuItem>
              <MenuItem value="LINK">Link</MenuItem>
            </TextField>
          </Stack>

          <Divider />
          <QuestionSetBuilder questions={questions} setQuestions={setQuestions} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Assignment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// -------- View Questions dialog --------
function ViewQuestionsDialog({ open, onClose, assignmentId }) {
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    if (!open || !assignmentId) return;
    setLoading(true);
    getInstructorAssignmentById(assignmentId)
      .then(setAssignment)
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));
  }, [open, assignmentId]);

  const questionsBySet = (assignment?.questions ?? []).reduce((acc, q) => {
    const setNum = q.questionSet ?? 1;
    (acc[setNum] ??= []).push(q);
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography fontWeight={700}>MCQ Question Bank {assignment ? `— ${assignment.title}` : ""}</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : Object.keys(questionsBySet).length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No questions added to this assignment yet.
          </Typography>
        ) : (
          Object.entries(questionsBySet)
            .sort(([a], [b]) => a - b)
            .map(([setNum, questions]) => (
              <Box key={setNum} sx={{ mb: 3 }}>
                <Typography fontWeight={700} color="primary" sx={{ mb: 1 }}>
                  Set {setNum} ({questions.length} Questions)
                </Typography>
                <Stack spacing={1.5}>
                  {questions
                    .sort((a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0))
                    .map((q) => (
                      <Paper key={q.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography fontWeight={600}>{q.questionText}</Typography>
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          {(q.options ?? []).map((opt, i) => (
                            <Typography
                              key={i} variant="body2"
                              sx={{ color: opt === q.correctOption ? "success.main" : "text.secondary", fontWeight: opt === q.correctOption ? 700 : 400 }}
                            >
                              {opt === q.correctOption ? "✓ " : "• "}{opt}
                            </Typography>
                          ))}
                        </Stack>
                      </Paper>
                    ))}
                </Stack>
              </Box>
            ))
        )}
      </DialogContent>
    </Dialog>
  );
}

// -------- Grade Submissions dialog --------
function GradeSubmissionsDialog({ open, onClose, assignmentId }) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [drafts, setDrafts] = useState({}); // submissionId -> { marksObtained, feedback }
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    if (!assignmentId) return;
    setLoading(true);
    getSubmissionsForMyAssignment(assignmentId)
      .then((page) => {
        const content = page?.content ?? [];
        setSubmissions(content);
        setDrafts(Object.fromEntries(content.map((s) => [
          s.id,
          { marksObtained: s.marksObtained ?? "", feedback: s.feedback ?? "" },
        ])));
      })
      .catch(() => toast.error("Failed to load submissions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assignmentId]);

  const updateDraft = (id, field, value) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));

  const handleSaveGrade = async (submission) => {
    const draft = drafts[submission.id];
    if (draft.marksObtained === "" || draft.marksObtained === null) {
      toast.error("Enter marks before saving");
      return;
    }
    setSavingId(submission.id);
    try {
      await gradeSubmission(submission.id, {
        marksObtained: Number(draft.marksObtained),
        feedback: draft.feedback,
      });
      toast.success(`Graded ${submission.studentName}`);
      load(); // refresh to show status change (e.g. -> GRADED)
    } catch (err) {
      toast.error(err?.response?.data || "Failed to save grade");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography fontWeight={700}>Grade Submissions</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : submissions.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No student submissions yet.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {submissions.map((s) => (
              <Paper key={s.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography fontWeight={700}>{s.studentName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted: {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                    </Typography>
                  </Box>
                  <Chip
                    label={s.status} size="small"
                    color={s.status === "GRADED" ? "success" : s.status === "LATE" ? "warning" : "primary"}
                  />
                </Box>

                {s.content && (() => {
                  let parsedAnswers = null;
                  try {
                    if (s.content.trim().startsWith("{") || s.content.trim().startsWith("[")) {
                      parsedAnswers = JSON.parse(s.content);
                    }
                  } catch (e) {}

                  if (parsedAnswers && typeof parsedAnswers === "object") {
                    return (
                      <Box sx={{ mb: 2, p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                        <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
                          Test Submission Answers (Set {s.assignedSet || "—"})
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
                    <Typography variant="body2" sx={{ mb: 1, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 1 }}>
                      {s.content}
                    </Typography>
                  );
                })()}
                {s.fileUrl && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <a href={s.fileUrl} target="_blank" rel="noreferrer">View submitted file</a>
                  </Typography>
                )}
                {s.linkUrl && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <a href={s.linkUrl} target="_blank" rel="noreferrer">{s.linkUrl}</a>
                  </Typography>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    label={`Marks (out of ${s.maxMarks})`} type="number"
                    value={drafts[s.id]?.marksObtained ?? ""}
                    onChange={(e) => updateDraft(s.id, "marksObtained", e.target.value)}
                    sx={{ width: 180 }}
                  />
                  <TextField
                    label="Feedback" value={drafts[s.id]?.feedback ?? ""}
                    onChange={(e) => updateDraft(s.id, "feedback", e.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained" onClick={() => handleSaveGrade(s)}
                    disabled={savingId === s.id}
                    sx={{ minWidth: 120 }}
                  >
                    {savingId === s.id ? "Saving..." : "Save Grade"}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function InstructorDashboard() {
  const { handleLogout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [questionsFor, setQuestionsFor] = useState(null); // assignmentId or null
  const [gradingFor, setGradingFor] = useState(null); // assignmentId or null

  const loadAssignments = async () => {
    try {
      const page = await getMyInstructorAssignments();
      setAssignments(page?.content ?? []);
    } catch (err) {
      toast.error("Failed to load your assignments");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [profileData, batchData] = await Promise.all([
          getMyInstructorProfile(),
          getMyInstructorBatches(),
        ]);
        setProfile(profileData);
        setBatches(batchData ?? []);
        await loadAssignments();
      } catch (err) {
        toast.error("Failed to load your profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F1F5F9" }}>
      <AppBar position="static" sx={{ bgcolor: "#1565C0" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Instructor Portal</Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button> 
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : !profile ? (
          <Typography color="text.secondary">Couldn't load your profile.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 3, alignItems: "stretch" }}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, flex: "1 1 340px", minWidth: 320 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>{profile.name}</Typography>
                <Chip
                  label={profile.status}
                  color={profile.status === "ACTIVE" ? "success" : "default"}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Grid container spacing={3}>
                <Field label="Email" value={profile.email} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Specialization" value={profile.specialization} />
              </Grid>
            </Paper>

            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, flex: "2 1 500px", minWidth: 320 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Assignments</Typography>
                <Button
                  variant="contained" startIcon={<Add />}
                  onClick={() => setDialogOpen(true)}
                  sx={{ bgcolor: "#1565C0" }}
                >
                  Add Assignment
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {assignments.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No assignments created yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {assignments.map((a) => (
                    <Box
                      key={a.id}
                      sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        p: 2, borderRadius: 2, border: "1px solid #E2E8F0", flexWrap: "wrap", gap: 1,
                      }}
                    >
                      <Box>
                        <Typography fontWeight={600}>{a.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Due: {a.dueDate} · Max Marks: {a.maxMarks}
                          {a.totalSubmissions != null && ` · Submissions: ${a.gradedSubmissions ?? 0}/${a.totalSubmissions}`}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={a.status}
                          color={a.status === "PUBLISHED" ? "primary" : "default"}
                          size="small"
                        />
                        <Button size="small" startIcon={<Quiz />} onClick={() => setQuestionsFor(a.id)}>
                          Questions
                        </Button>
                        <Button size="small" startIcon={<Grading />} onClick={() => setGradingFor(a.id)}>
                          Grade
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      <AddAssignmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        batches={batches}
        onCreated={loadAssignments}
      />

      <ViewQuestionsDialog
        open={questionsFor !== null}
        onClose={() => setQuestionsFor(null)}
        assignmentId={questionsFor}
      />

      <GradeSubmissionsDialog
        open={gradingFor !== null}
        onClose={() => setGradingFor(null)}
        assignmentId={gradingFor}
      />
    </Box>
  );
}