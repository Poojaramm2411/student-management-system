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