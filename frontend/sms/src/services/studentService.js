import { API_ENDPOINTS } from "../api/apiconfig";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getStudents = async (page = 0, size = 10, search = "", status = "", batchId = "") => {
  let url = `${API_ENDPOINTS.GET_STUDENT}?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  if (batchId) url += `&batchId=${batchId}`;
  const res = await fetch(url, { method: "GET", headers: getHeaders() });
  if (!res.ok) throw new Error("Fetch students failed");
  const json = await res.json();
  return {
    content: Array.isArray(json.content) ? json.content : [],
    totalPages: json.totalPages || 0,
    totalElements: json.totalElements || 0,
    currentPage: json.number || 0,
  };
};

export const getStudentById = async (id) => {
  const res = await fetch(API_ENDPOINTS.GET_STUDENT_BY_ID(id), { method: "GET", headers: getHeaders() });
  if (!res.ok) throw new Error("Fetch student failed");
  return await res.json();
};

export const createStudent = async (data) => {
  const res = await fetch(API_ENDPOINTS.POST_STUDENT, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create student failed");
  return await res.json();
};

export const updateStudent = async (id, data) => {
  const res = await fetch(API_ENDPOINTS.UPDATE_STUDENT(id), {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update student failed");
  return await res.json();
};

export const deleteStudent = async (id) => {
  const res = await fetch(API_ENDPOINTS.DELETE_STUDENT(id), { method: "DELETE", headers: getHeaders() });
  if (!res.ok) throw new Error("Delete student failed");
};

export const toggleStudentStatus = async (id) => {
  const res = await fetch(API_ENDPOINTS.TOGGLE_STUDENT(id), { method: "PATCH", headers: getHeaders() });
  if (!res.ok) throw new Error("Toggle status failed");
  return await res.json();
};