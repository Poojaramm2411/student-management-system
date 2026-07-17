import api from "../api/axiosInstance";

export const getInstructors = async (page = 0, size = 10, search = "", status = "") => {
  let url = `/api/instructors?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  const res = await api.get(url);
  return {
    content: Array.isArray(res.data.content) ? res.data.content : [],
    totalPages: res.data.totalPages || 0,
    totalElements: res.data.totalElements || 0,
    currentPage: res.data.number || 0,
  };
};

export const getInstructorById = async (id) => {
  const res = await api.get(`/api/instructors/${id}`);
  return res.data;
};

export const createInstructor = async (data) => {
  const res = await api.post(`/api/instructors`, data);
  return res.data;
};

export const updateInstructor = async (id, data) => {
  const res = await api.put(`/api/instructors/${id}`, data);
  return res.data;
};

export const deleteInstructor = async (id) => {
  await api.delete(`/api/instructors/${id}`);
};

export const toggleInstructorStatus = async (id) => {
  const res = await api.patch(`/api/instructors/${id}/status`);
  return res.data;
};
