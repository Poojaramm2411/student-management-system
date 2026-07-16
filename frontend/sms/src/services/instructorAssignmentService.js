import api from "../api/axiosInstance";

export const getMyInstructorAssignments = async () => {
  const res = await api.get("/api/instructor/assignments");
  return res.data;
};

export const getMyInstructorBatches = async () => {
  const res = await api.get("/api/instructor/assignments/batches");
  return res.data;
};

export const createInstructorAssignment = async (data) => {
  const res = await api.post("/api/instructor/assignments", data);
  return res.data;
};

export const getInstructorAssignmentById = async (assignmentId) => {
  const res = await api.get(`/api/instructor/assignments/${assignmentId}`);
  return res.data; // includes decrypted question sets
};

export const getSubmissionsForMyAssignment = async (assignmentId, page = 0, size = 20) => {
  const res = await api.get("/api/instructor/submissions", {
    params: { assignmentId, page, size },
  });
  return res.data;
};

export const gradeSubmission = async (submissionId, { marksObtained, feedback }) => {
  const res = await api.put(`/api/instructor/submissions/${submissionId}/grade`, {
    marksObtained,
    feedback,
  });
  return res.data;
};