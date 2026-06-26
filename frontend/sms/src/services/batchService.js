import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/apiconfig";

export async function getBatches(page = 0, size = 10, search = "", status = "") {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  const res = await api.get(`${API_ENDPOINTS.GET_BATCH}?${params}`);
  return res.data;
}

export async function createBatch(data) {
  const res = await api.post(API_ENDPOINTS.POST_BATCH, data);
  return res.data;
}

export async function updateBatch(id, data) {
  const res = await api.put(API_ENDPOINTS.UPDATE_BATCH(id), data);
  return res.data;
}

export async function deleteBatch(id) {
  await api.delete(API_ENDPOINTS.DELETE_BATCH(id));
}

export async function toggleBatchStatus(id) {
  const res = await api.patch(API_ENDPOINTS.TOGGLE_BATCH(id));
  return res.data;
}