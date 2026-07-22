import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/apiconfig";

export async function getRecentLogins(limit = 10) {
  const res = await api.get(API_ENDPOINTS.GET_RECENT_LOGINS, {
    params: { limit },
  });
  return res.data; // array of { name, email, role, lastLoginAt }
}