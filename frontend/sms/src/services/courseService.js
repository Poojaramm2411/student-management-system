import { API_ENDPOINTS } from "../api/apiconfig";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getCourses = async (page = 0, size = 10, search = "", status = "", batchId = "") => {
  let url = `${API_ENDPOINTS.GET_COURSE}?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (batchId) url += `&batchId=${batchId}`;
  const res = await fetch(url, { method: "GET", headers: getHeaders() });
  if (!res.ok) throw new Error("Fetch courses failed");
  const json = await res.json();
  return {
    content: Array.isArray(json.content) ? json.content : [],
    totalPages: json.totalPages || 0,
    totalElements: json.totalElements || 0,
    currentPage: json.number || 0,
  };
};

export const getCourseById = async (id) => {
  const res = await fetch(API_ENDPOINTS.GET_COURSE_BY_ID(id), { method: "GET", headers: getHeaders() });
  if (!res.ok) throw new Error("Fetch course failed");
  return await res.json();
};

export const createCourse = async (data) => {
  const res = await fetch(API_ENDPOINTS.POST_COURSE, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create course failed");
  return await res.json();
};

export const updateCourse = async (id, data) => {
  const res = await fetch(API_ENDPOINTS.UPDATE_COURSE(id), {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update course failed");
  return await res.json();
};

export const deleteCourse = async (id) => {
  const res = await fetch(API_ENDPOINTS.DELETE_COURSE(id), { method: "DELETE", headers: getHeaders() });
  if (!res.ok) throw new Error("Delete course failed");
};

export const toggleCourseStatus = async (id) => {
  const res = await fetch(API_ENDPOINTS.TOGGLE_COURSE(id), { method: "PATCH", headers: getHeaders() });
  if (!res.ok) throw new Error("Status toggle failed");
  return await res.json();
};