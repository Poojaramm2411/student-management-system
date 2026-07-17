import api from "../api/axiosInstance";

export const getCourses = async (page = 0, size = 10, search = "", status = "") => {
  let url = `/api/courses?page=${page}&size=${size}`;
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

export const getCourseById = async (id) => {
  const res = await api.get(`/api/courses/${id}`);
  return res.data;
};

export const createCourse = async (data) => {
  const res = await api.post(`/api/courses`, data);
  return res.data;
};

export const updateCourse = async (id, data) => {
  const res = await api.put(`/api/courses/${id}`, data);
  return res.data;
};

export const deleteCourse = async (id) => {
  await api.delete(`/api/courses/${id}`);
};

export const toggleCourseStatus = async (id) => {
  const res = await api.patch(`/api/courses/${id}/status`);
  return res.data;
};
