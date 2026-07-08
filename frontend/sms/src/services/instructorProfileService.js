import api from "../api/axiosInstance";

export const getMyInstructorProfile = async () => {
  const res = await api.get("/api/instructor/me");
  return res.data;
};
