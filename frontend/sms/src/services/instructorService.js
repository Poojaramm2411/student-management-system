import { API_ENDPOINTS } from "../api/apiconfig";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getInstructors = async (page = 0, size = 10, search = "", status = "") => {
  let url = `${API_ENDPOINTS.GET_INSTRUCTORS}?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url, { method: "GET", headers: getHeaders() });
  if (!res.ok) throw new Error("Fetch instructors failed");
  const json = await res.json();
  return {
    content: Array.isArray(json.content) ? json.content : [],
    totalPages: json.totalPages || 0,
    totalElements: json.totalElements || 0,
    currentPage: json.number || 0,
  };
};

export const getInstructorById = async (id) => {
  const res = await fetch(API_ENDPOINTS.GET_INSTRUCTOR_BY_ID(id), { method: "GET", headers: getHeaders() });
  if (!res.ok) throw new Error("Fetch instructor failed");
  return await res.json();
};

export const createInstructor = async (data) => {
  const res = await fetch(API_ENDPOINTS.POST_INSTRUCTOR, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create instructor failed");
  return await res.json();
};

export const updateInstructor = async (id, data) => {
  const res = await fetch(API_ENDPOINTS.UPDATE_INSTRUCTOR(id), {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update instructor failed");
  return await res.json();
};

export const deleteInstructor = async (id) => {
  const res = await fetch(API_ENDPOINTS.DELETE_INSTRUCTOR(id), { method: "DELETE", headers: getHeaders() });
  if (!res.ok) throw new Error("Delete instructor failed");
};

export const toggleInstructorStatus = async (id) => {
  const res = await fetch(API_ENDPOINTS.TOGGLE_INSTRUCTOR(id), { method: "PATCH", headers: getHeaders() });
  if (!res.ok) throw new Error("Status toggle failed");
  return await res.json();
};