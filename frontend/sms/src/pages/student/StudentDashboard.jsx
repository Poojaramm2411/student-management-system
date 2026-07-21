import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Button, AppBar, Toolbar, Avatar,
  Chip, CircularProgress, Grid, Divider, TextField, Link, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack
} from "@mui/material";
import { Logout, AttachFile, CheckCircle, Close, HelpOutline, School, AccountCircle, ReceiptLong, AssignmentTurnedIn } from "@mui/icons-material";
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
  Paid:    { bg: "#0F766E", color: "#FFFFFF", border: "#0D9488" },
  Pending: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  Partial: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
};

const ASSIGNMENT_STATUS_COLOR = {
  PENDING:     { bg: "#F1F5F9", color: "#475569" },
  IN_PROGRESS: { bg: "#FFFBEB", color: "#B45309" },
  SUBMITTED:   { bg: "#EEF2FF", color: "#4F46E5" },
  LATE:        { bg: "#FEF2F2", color: "#B91C1C" },
  GRADED:      { bg: "#ECFDF5", color: "#047857" },
};

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
      <Typography variant="body1" fontWeight={700} color="#0F172A">{value ?? "—"}</Typography>
    </Grid>
  );
}

function money(n) {
  return n == null ? "—" : `₹ ${Number(n).toLocaleString("en-IN")}`;
}

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
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "white", p: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            {assignment.title} {readOnly ? "— Review Answers" : "— Test Session"}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Set {assignedSet} · Max Marks: {assignment.maxMarks}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#F8FAFC", p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
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
                  <Paper key={q.id || idx} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#FFFFFF" }}>
                    <Typography fontWeight={700} variant="subtitle1" sx={{ mb: 2, display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Box component="span" sx={{ color: "#4F46E5", fontWeight: 800 }}>Q{idx + 1}.</Box>
                      <Box component="span" sx={{ color: "#0F172A" }}>{q.questionText}</Box>
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
          <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2.5 }}>Close Review</Button>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
              Note: Answers are auto-saved on typing.
            </Typography>
            <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2.5 }}>Save & Exit</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting || loading} sx={{ borderRadius: 2.5 }}>
              Submit Test
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

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
  const isMcqTest = assignment.isMcqTest === true;

  const stStyle = ASSIGNMENT_STATUS_COLOR[assignment.status] || ASSIGNMENT_STATUS_COLOR.PENDING;

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
    if (!window.confirm("Warning: Requesting a new set will discard your current progress draft and assign an unused set. Proceed?")) return;
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
    <Paper elevation={1} sx={{ p: 3, borderRadius: 3.5, flexGrow: 1, height: "100%", bgcolor: "#FFFFFF" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
            {assignment.title} {isMcqTest && " (Test)"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Due: {assignment.dueDate || "—"} · Max Marks: {assignment.maxMarks}
          </Typography>
        </Box>
        <Chip
          label={assignment.status}
          size="small"
          sx={{
            fontWeight: 800,
            backgroundColor: stStyle.bg,
            color: stStyle.color,
            borderRadius: 2,
          }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2, color: "#334155" }}>
        {assignment.description}
      </Typography>

      {assignment.attachmentUrl && (
        <Box sx={{ mb: 2 }}>
          <Link href={assignment.attachmentUrl} target="_blank" rel="noopener" sx={{ color: "#4F46E5", fontWeight: 600 }}>
            📎 Reference Material
          </Link>
        </Box>
      )}

      {isMcqTest ? (
        <Box>
          {assignment.status === "PENDING" && (
            <Button variant="contained" size="small" onClick={handleStartTest} sx={{ borderRadius: 2 }}>
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
                <Button variant="contained" size="small" onClick={() => setTestOpen(true)} sx={{ borderRadius: 2 }}>
                  Resume Test
                </Button>
                <Button variant="outlined" size="small" color="secondary" onClick={handleNewSet} sx={{ borderRadius: 2 }}>
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
              <Button variant="outlined" size="small" onClick={() => setReviewOpen(true)} sx={{ borderRadius: 2 }}>
                Review Test Answers
              </Button>
            </Box>
          )}

          {isGraded && (
            <Box>
              <Box sx={{ bgcolor: "#ECFDF5", border: "1px solid #A7F3D0", p: 2, borderRadius: 2.5, mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700} color="#047857">
                    Grade: {assignment.marksObtained} / {assignment.maxMarks}
                  </Typography>
                </Box>
                {assignment.feedback && (
                  <Typography variant="body2" color="#065F46">
                    Feedback: {assignment.feedback}
                  </Typography>
                )}
              </Box>
              <Button variant="outlined" size="small" onClick={() => setReviewOpen(true)} sx={{ borderRadius: 2 }}>
                Review Test Answers
              </Button>
            </Box>
          )}

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
        isGraded ? (
          <Box sx={{ bgcolor: "#ECFDF5", border: "1px solid #A7F3D0", p: 2, borderRadius: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="#047857">
                Grade: {assignment.marksObtained} / {assignment.maxMarks}
              </Typography>
            </Box>
            {assignment.feedback && (
              <Typography variant="body2" color="#065F46">
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
                  disabled={uploading} sx={{ borderRadius: 2 }}>
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

            <Button variant="contained" size="small" onClick={handleSubmit} disabled={submitting || uploading} sx={{ borderRadius: 2 }}>
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

  const initials = profile?.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }} className="fade-in">
      <AppBar position="static" elevation={0} sx={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E2E8F0",
        color: "#0F172A"
      }}>
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
            }}>
              <School sx={{ fontSize: 22, color: "#fff" }} />
            </Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.4}>
              Student<Box component="span" sx={{ color: "#4F46E5" }}>Portal</Box>
            </Typography>
          </Box>
          <Button variant="outlined" color="primary" startIcon={<Logout />} onClick={handleLogout} sx={{ borderRadius: 2.5 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : !profile ? (
          <Typography color="text.secondary">Couldn't load your profile.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 3, alignItems: "stretch" }}>

            {/* Profile card */}
            <Box sx={{ flex: "1 1 360px", minWidth: 320, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <AccountCircle sx={{ color: "#4F46E5" }} /> My Student Profile
              </Typography>

              <Paper elevation={1} sx={{ p: 3.5, borderRadius: 3.5, flexGrow: 1, bgcolor: "#FFFFFF" }}>
                <Box sx={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", mb: 3,
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{
                      width: 52, height: 52, fontSize: 18, fontWeight: 800,
                      background: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
                      boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)"
                    }}>
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{profile.name}</Typography>
                      <Box component="span" className="cell-code">
                        {profile.studentCode}
                      </Box>
                    </Box>
                  </Stack>
                  <Chip
                    label={profile.status}
                    sx={{
                      fontWeight: 800,
                      backgroundColor: profile.status === "ACTIVE" ? "#ECFDF5" : "#F1F5F9",
                      color: profile.status === "ACTIVE" ? "#047857" : "#475569",
                      border: profile.status === "ACTIVE" ? "1px solid #A7F3D0" : "1px solid #CBD5E1"
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  <Field label="Email Address" value={profile.email} />
                  <Field label="Age" value={profile.age} />
                  <Field label="City" value={profile.city} />
                  <Field label="Enrolled Course" value={profile.courseName} />
                  <Field label="Batch Name" value={profile.batchName} />
                  <Field label="Batch Code" value={profile.batchCode} />
                </Grid>
              </Paper>
            </Box>

            {/* Fee cards */}
            <Box sx={{ flex: "1 1 360px", minWidth: 320, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <ReceiptLong sx={{ color: "#10B981" }} /> Fee Summary
              </Typography>

              {fees.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3, borderRadius: 3.5, flexGrow: 1, bgcolor: "#FFFFFF" }}>
                  <Typography color="text.secondary">
                    No enrollment or fee record found yet.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                  {fees.map((fee) => {
                    const feeSt = STATUS_COLOR[fee.feeStatus] || STATUS_COLOR.Paid;

                    return (
                      <Paper key={fee.id} elevation={1} sx={{ p: 3, borderRadius: 3.5, flexGrow: 1, bgcolor: "#FFFFFF" }}>
                        <Box sx={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", mb: 2,
                        }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                              {fee.courseName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {fee.batchName}
                            </Typography>
                          </Box>
                          <Chip
                            label={fee.feeStatus}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              backgroundColor: feeSt.bg,
                              color: feeSt.color,
                              border: `1px solid ${feeSt.border}`,
                            }}
                          />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                          <Field label="Base Fee" value={money(fee.baseFee)} />
                          <Field label="GST Amount" value={money(fee.gstAmount)} />
                          <Field label="Total Fee" value={money(fee.totalFee)} />
                          <Field label="Paid Amount" value={money(fee.paidAmount)} />
                          <Field label="Balance Due" value={money(fee.balanceDue)} />
                          <Field label="Payment Mode" value={fee.paymentMode} />
                          <Field label="Enrolled Date" value={fee.enrolledDate} />
                        </Grid>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Assignments */}
            <Box sx={{ flex: "1 1 360px", minWidth: 320, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentTurnedIn sx={{ color: "#8B5CF6" }} /> Course Assignments
              </Typography>

              {assignments.length === 0 ? (
                <Paper elevation={1} sx={{ p: 3, borderRadius: 3.5, flexGrow: 1, bgcolor: "#FFFFFF" }}>
                  <Typography color="text.secondary">
                    No assignments published for your batch yet.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                  {assignments.map((a) => (
                    <AssignmentCard key={a.assignmentId} assignment={a} onSubmitted={loadAssignments} />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}