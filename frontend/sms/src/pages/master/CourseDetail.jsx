import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBack, MenuBook } from "@mui/icons-material";
import { Box, Button, Card, Avatar, Grid, Typography } from "@mui/material";
import StatusBadge from "../../components/ui/StatusBadge";

const formatDuration = (dur) => {
  if (!dur) return "—";
  let str = String(dur).trim();
  if (str.toLowerCase().endsWith("months")) {
    return str;
  }
  if (str.toLowerCase().endsWith("month")) {
    return str + "s";
  }
  if (str.toLowerCase().endsWith("mo")) {
    return str.substring(0, str.length - 2).trim() + " months";
  }
  if (/^\d+$/.test(str)) {
    return `${str} months`;
  }
  return str;
};

export default function CourseDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  if (!course) return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
      <Typography color="text.secondary" sx={{ mt: 2 }}>No course data found.</Typography>
    </Box>
  );

  const fields = [
    { label: "Course ID", value: course.id },
    { label: "Course Code", value: course.courseCode },
    { label: "Duration", value: formatDuration(course.duration) },
    { label: "Fees", value: course.fee ? `₹${Number(course.fee).toLocaleString("en-IN")}` : "—" },
    { label: "Status", value: <StatusBadge status={course.status} /> },
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Courses
      </Button>

      <Card variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
            <MenuBook />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{course.courseName}</Typography>
            <Typography variant="body2" color="text.secondary">{course.courseCode}</Typography>
          </Box>
          <Box sx={{ ml: "auto" }}><StatusBadge status={course.status} /></Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {fields.map(({ label, value }) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 500 }}>{value}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>
    </Box>
  );
}