import api from "../api/axiosInstance";

export const getMyStudentProfile = async () => {
  const res = await api.get("/api/student/me");
  return res.data;
};

export const getMyStudentFees = async () => {
  const res = await api.get("/api/student/me/fees");
  return res.data;
};

export const getMyStudentAssignments = async () => {
  const res = await api.get("/api/student/me/assignments");
  return res.data;
};

export const submitMyAssignment = async (assignmentId, data) => {
  const res = await api.post(`/api/student/me/assignments/${assignmentId}/submit`, data);
  return res.data;
};

export const takeMyAssignment = async (assignmentId) => {
  const res = await api.get(`/api/student-assignment/start?assignmentId=${assignmentId}`);
  return res.data;
};

export const saveMyAssignmentDraft = async (assignmentId, content) => {
  const res = await api.post("/api/student-assignment/save-draft", { assignmentId, content });
  return res.data;
};

export const submitMyAssignmentTest = async (assignmentId, content) => {
  const res = await api.post("/api/student-assignment/submit", { assignmentId, content });
  return res.data;
};

export const requestNewQuestionSet = async (assignmentId) => {
  const res = await api.post("/api/student-assignment/new-set", { assignmentId });
  return res.data;
};