import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Button, AppBar, Toolbar,
  Chip, CircularProgress, Grid, Divider, TextField, Link, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from "@mui/material";
import { Logout, AttachFile, CheckCircle, Close, HelpOutline } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  getMyStudentProfile, getMyStudentFees,
  getMyStudentAssignments, submitMyAssignment,
  takeMyAssignment, saveMyAssignmentDraft,
  submitMyAssignmentTest, requestNewQuestionSet
} from "../../services/studentProfileService";
import { uploadFile } from "../../services/fileUploadService";

const STATUS_COLOR = {
  Paid: "success",
  Pending: "error",
  Partial: "warning",
};

const ASSIGNMENT_STATUS_COLOR = {
  PENDING: "default",
  IN_PROGRESS: "warning",
  SUBMITTED: "primary",
  LATE: "warning",
  GRADED: "success",
};

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value ?? "—"}</Typography>
    </Grid>
  );
}

// Format currency
function money(n) {
  return n == null ? "—" : `₹ ${Number(n).toLocaleString("en-IN")}`;
}

// Full interactive test taking and review overlay
function TestDialog({ isOpen, onClose, assignment, onCompleted, readOnly = false }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignedSet, setAssignedSet] = useState(assignment.assignedSet);

  useEffect(() => {
    if (isOpen) {
      if (readOnly) {
        setQuestions(assignment.questions || []);
        setAssignedSet(assignment.assignedSet);
        if (assignment.content) {
          try {
            setAnswers(JSON.parse(assignment.content));
          } catch (e) {
            console.error("Failed to parse answers review", e);
          }
        } else {
          setAnswers({});
        }
      } else {
        // GET /student-assignment/start — fetches active set questions from backend dynamically
        setLoading(true);
        takeMyAssignment(assignment.assignmentId)
          .then((data) => {
            setQuestions(data.questions || []);
            setAssignedSet(data.assignedSet);
            if (assignment.content) {
              try {
                setAnswers(JSON.parse(assignment.content));
              } catch (e) {
                console.error("Failed to parse draft content", e);
              }
            } else {
              setAnswers({});
            }
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message || "Failed to load test questions");
            onClose();
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [isOpen, assignment, readOnly, onClose]);

  const handleOptionSelect = async (qId, val) => {
    if (readOnly) return;
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);
    try {
      await saveMyAssignmentDraft(assignment.assignmentId, JSON.stringify(updated));
    } catch (err) {
      console.error("Draft save failed", err);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitMyAssignmentTest(assignment.assignmentId, JSON.stringify(answers));
      toast.success("Assignment test submitted successfully!");
      onCompleted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#1E293B", color: "white" }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {assignment.title} {readOnly ? "— Review Answers" : "— Test Session"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94A3B8" }}>
            Set {assignedSet} · Max Marks: {assignment.maxMarks}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#F8FAFC", p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {questions.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No questions found in the Question Bank for Set {assignedSet}.
              </Typography>
            ) : (
              questions.map((q, idx) => {
                const selectedOpt = answers[q.id];
                
                return (
                  <Paper key={q.id || idx} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Typography fontWeight={700} variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Box component="span" sx={{ color: "#1565C0" }}>Q{idx + 1}.</Box>
                      <Box component="span">{q.questionText}</Box>
                    </Typography>

                    <Box sx={{ mt: 1.5 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label={readOnly ? "Submitted Answer" : "Type your answer here..."}
                        value={selectedOpt || ""}
                        onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                        disabled={readOnly}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F1F5F9" }}>
        {readOnly ? (
          <Button onClick={onClose} variant="contained" color="primary">Close Review</Button>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
              Note: Answers are auto-saved on typing.
            </Typography>
            <Button onClick={onClose} color="inherit">Save & Exit</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting || loading}>
              Submit Test
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// One assignment card: handles both standard uploads and subjective test workflow
function AssignmentCard({ assignment, onSubmitted }) {
  const [content, setContent] = useState(assignment.content || "");
  const [linkUrl, setLinkUrl] = useState(assignment.linkUrl || "");
  const [fileUrl, setFileUrl] = useState(assignment.fileUrl || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const isGraded = assignment.status === "GRADED";
  const alreadySubmitted = assignment.submissionId != null;

  // MCQ assignment identifier
  const isMcqTest = assignment.isMcqTest === true;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      setFileUrl(res.fileUrl);
    } catch (err) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitMyAssignment(assignment.assignmentId, { content, linkUrl, fileUrl });
      toast.success("Assignment submitted!");
      onSubmitted();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTest = async () => {
    setTestOpen(true);
  };

  const handleNewSet = async () => {
    if (!window.confirm("Warning: Requesting a new set will discard your current progress draft and assign an unused set. The questions won't repeat. Proceed?")) return;
    try {
      await requestNewQuestionSet(assignment.assignmentId);
      toast.success("New question set assigned!");
      onSubmitted();
      setTestOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign new set");
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {assignment.title} {isMcqTest && " (Test)"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Due: {assignment.dueDate || "—"} · Max Marks: {assignment.maxMarks}
          </Typography>
        </Box>
        <Chip
          label={assignment.status}
          size="small"
          color={ASSIGNMENT_STATUS_COLOR[assignment.status] || "default"}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
        {assignment.description}
      </Typography>

      {assignment.attachmentUrl && (
        <Box sx={{ mb: 2 }}>
          <Link href={assignment.attachmentUrl} target="_blank" rel="noopener">
            📎 Reference material
          </Link>
        </Box>
      )}

      {isMcqTest ? (
        /* MCQ Test workflow UI */
        <Box>
          {assignment.status === "PENDING" && (
            <Button variant="contained" size="small" onClick={handleStartTest}>
              Start Test
            </Button>
          )}

          {assignment.status === "IN_PROGRESS" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HelpOutline fontSize="inherit" />
                Active Set: {assignment.assignedSet} (Draft saved)
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button variant="contained" size="small" onClick={() => setTestOpen(true)}>
                  Resume Test
                </Button>
                <Button variant="outlined" size="small" color="secondary" onClick={handleNewSet}>
                  Restart with New Set
                </Button>
              </Box>
            </Box>
          )}

          {(assignment.status === "SUBMITTED" || assignment.status === "LATE") && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
                Submitted. Awaiting grading from instructor.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => setReviewOpen(true)}>
                Review Test Answers
              </Button>
            </Box>
          )}

          {isGraded && (
            <Box>
              <Box sx={{ bgcolor: "#F0FDF4", p: 2, borderRadius: 2, mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Grade: {assignment.marksObtained} / {assignment.maxMarks}
                  </Typography>
                </Box>
                {assignment.feedback && (
                  <Typography variant="body2" color="text.secondary">
                    Feedback: {assignment.feedback}
                  </Typography>
                )}
              </Box>
              <Button variant="outlined" size="small" onClick={() => setReviewOpen(true)}>
                Review Test Answers
              </Button>
            </Box>
          )}

          {/* Test and Review Modals */}
          <TestDialog
            isOpen={testOpen}
            onClose={() => { setTestOpen(false); onSubmitted(); }}
            assignment={assignment}
            onCompleted={onSubmitted}
          />
          <TestDialog
            isOpen={reviewOpen}
            onClose={() => setReviewOpen(false)}
            assignment={assignment}
            onCompleted={onSubmitted}
            readOnly={true}
          />
        </Box>
      ) : (
        /* Standard upload workflow UI */
        isGraded ? (
          <Box sx={{ bgcolor: "#F0FDF4", p: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                Grade: {assignment.marksObtained} / {assignment.maxMarks}
              </Typography>
            </Box>
            {assignment.feedback && (
              <Typography variant="body2" color="text.secondary">
                Feedback: {assignment.feedback}
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            {assignment.submissionType === "TEXT" && (
              <TextField fullWidth multiline minRows={3} label="Your Answer"
                value={content} onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 2 }} />
            )}
            {assignment.submissionType === "LINK" && (
              <TextField fullWidth label="Submission Link"
                value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                sx={{ mb: 2 }} />
            )}
            {assignment.submissionType === "FILE" && (
              <Box sx={{ mb: 2 }}>
                <Button component="label" variant="outlined" size="small"
                  startIcon={uploading ? <CircularProgress size={14} /> : <AttachFile />}
                  disabled={uploading}>
                  {uploading ? "Uploading..." : fileUrl ? "Replace File" : "Choose File"}
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {fileUrl && (
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5 }} color="text.secondary">
                    Attached: {fileUrl.split("/").pop()}
                  </Typography>
                )}
              </Box>
            )}

            <Button variant="contained" size="small" onClick={handleSubmit} disabled={submitting || uploading}>
              {submitting ? "Submitting..." : alreadySubmitted ? "Resubmit" : "Submit"}
            </Button>
            {alreadySubmitted && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
                Submitted {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleString() : ""}
              </Typography>
            )}
          </Box>
        )
      )}
    </Paper>
  );
}

export default function StudentDashboard() {
  const { handleLogout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    try {
      const data = await getMyStudentAssignments();
      setAssignments(data);
    } catch {
      toast.error("Failed to load assignments");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [profileData, feeData, assignmentData] = await Promise.all([
          getMyStudentProfile(),
          getMyStudentFees(),
          getMyStudentAssignments(),
        ]);
        setProfile(profileData);
        setFees(feeData);
        setAssignments(assignmentData);
      } catch (err) {
        toast.error("Failed to load your details");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F1F5F9" }}>
      <AppBar position="static" sx={{ bgcolor: "#1565C0" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Student Portal</Typography>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 700 }}>

            {/* Profile card */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", mb: 3,
              }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{profile.name}</Typography>
                  <Typography
                    variant="body2" color="text.secondary"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {profile.studentCode}
                  </Typography>
                </Box>
                <Chip
                  label={profile.status}
                  color={profile.status === "ACTIVE" ? "success" : "default"}
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Grid container spacing={3}>
                <Field label="Email" value={profile.email} />
                <Field label="Age" value={profile.age} />
                <Field label="City" value={profile.city} />
                <Field label="Course" value={profile.courseName} />
                <Field label="Batch" value={profile.batchName} />
                <Field label="Batch Code" value={profile.batchCode} />
              </Grid>
            </Paper>

            {/* Fee cards */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Fee Details
              </Typography>

              {fees.length === 0 ? (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography color="text.secondary">
                    No enrollment/fee record found yet.
                  </Typography>
                </Paper>
              ) : (
                fees.map((fee) => (
                  <Paper key={fee.id} elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                    <Box sx={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", mb: 2,
                    }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {fee.courseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fee.batchName}
                        </Typography>
                      </Box>
                      <Chip
                        label={fee.feeStatus}
                        size="small"
                        color={STATUS_COLOR[fee.feeStatus] || "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Field label="Base Fee" value={money(fee.baseFee)} />
                      <Field label="GST" value={money(fee.gstAmount)} />
                      <Field label="Total Fee" value={money(fee.totalFee)} />
                      <Field label="Paid" value={money(fee.paidAmount)} />
                      <Field label="Balance Due" value={money(fee.balanceDue)} />
                      <Field label="Payment Mode" value={fee.paymentMode} />
                      <Field label="Enrolled Date" value={fee.enrolledDate} />
                    </Grid>
                  </Paper>
                ))
              )}
            </Box>

            {/* Assignments */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Assignments
              </Typography>

              {assignments.length === 0 ? (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography color="text.secondary">
                    No assignments published for your batch yet.
                  </Typography>
                </Paper>
              ) : (
                assignments.map((a) => (
                  <AssignmentCard key={a.assignmentId} assignment={a} onSubmitted={loadAssignments} />
                ))
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
