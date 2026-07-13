import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/apiconfig";

// Returns { fileUrl, originalName }
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(API_ENDPOINTS.UPLOAD_FILE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};