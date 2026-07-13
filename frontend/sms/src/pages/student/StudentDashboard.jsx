import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Button, AppBar, Toolbar,
  Chip, CircularProgress, Grid, Divider, TextField, Link,
} from "@mui/material";
import { Logout, AttachFile, CheckCircle } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  getMyStudentProfile, getMyStudentFees,
  getMyStudentAssignments, submitMyAssignment,
} from "../../services/studentProfileService";
import { uploadFile } from "../../services/fileUploadService";

const STATUS_COLOR = {
  Paid: "success",
  Pending: "error",
  Partial: "warning",
};

const ASSIGNMENT_STATUS_COLOR = {
  PENDING: "default",
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

function money(n) {
  return n == null ? "—" : `₹ ${Number(n).toLocaleString("en-IN")}`;
}

// One assignment card: shows the task, and either a submission form
// (if not yet submitted / re-submittable) or the submitted work + grade.
function AssignmentCard({ assignment, onSubmitted }) {
  const [content, setContent] = useState(assignment.content || "");
  const [linkUrl, setLinkUrl] = useState(assignment.linkUrl || "");
  const [fileUrl, setFileUrl] = useState(assignment.fileUrl || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isGraded = assignment.status === "GRADED";
  const alreadySubmitted = assignment.submissionId != null;

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

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>{assignment.title}</Typography>
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

      {isGraded ? (
        // Graded — show what was submitted + the grade, read-only
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
        // Not graded yet — allow submit / resubmit based on submissionType
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
