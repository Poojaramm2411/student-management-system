import api from "../api/axiosInstance";

export const getStudents = async (page = 0, size = 10, search = "", status = "", batchId = "") => {
  let url = `/api/students?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (batchId) url += `&batchId=${batchId}`;
  const res = await api.get(url);
  return {
    content: Array.isArray(res.data.content) ? res.data.content : [],
    totalPages: res.data.totalPages || 0,
    totalElements: res.data.totalElements || 0,
    currentPage: res.data.number || 0,
  };
};

export const getAllStudents = async (search = "", status = "", batchId = "") => {
  let url = `/api/students/all?`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (batchId) url += `&batchId=${batchId}`;
  const res = await api.get(url);
  return res.data;
};

export const getStudentById = async (id) => {
  const res = await api.get(`/api/students/${id}`);
  return res.data;
};

export const createStudent = async (data) => {
  const res = await api.post(`/api/students`, data);
  return res.data;
};

export const updateStudent = async (id, data) => {
  const res = await api.put(`/api/students/${id}`, data);
  return res.data;
};

export const deleteStudent = async (id) => {
  await api.delete(`/api/students/${id}`);
};

export const toggleStudentStatus = async (id) => {
  const res = await api.patch(`/api/students/${id}/status`);
  return res.data;
};
