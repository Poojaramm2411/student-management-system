import api from "../api/axiosInstance";

export const getMyStudentProfile = async () => {
  const res = await api.get("/api/student/me");
  return res.data;
};

export const getMyStudentFees = async () => {
  const res = await api.get("/api/student/me/fees");
  return res.data;
};
