import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/apiconfig";


export const getAssignments = async (page = 0, size = 10, search = "", status = "", batchId = "", instructorId = "") => {
  const res = await api.get(API_ENDPOINTS.GET_ASSIGNMENTS, {
    params: { page, size, search, status, batchId, instructorId },
  });
  return {
    content: res.data.content,
    totalPages: res.data.totalPages,
    totalElements: res.data.totalElements,
    currentPage: res.data.number,
  };
};

export const getAssignmentById = async (id) => {
  const res = await api.get(API_ENDPOINTS.GET_ASSIGNMENT_BY_ID(id));
  return res.data;
};

export const createAssignment = async (data) => {
  const res = await api.post(API_ENDPOINTS.POST_ASSIGNMENT, data);
  return res.data;
};

export const updateAssignment = async (id, data) => {
  const res = await api.put(API_ENDPOINTS.UPDATE_ASSIGNMENT(id), data);
  return res.data;
};

export const deleteAssignment = async (id) => {
  await api.delete(API_ENDPOINTS.DELETE_ASSIGNMENT(id));
};

export const changeAssignmentStatus = async (id, status) => {
  const res = await api.patch(API_ENDPOINTS.CHANGE_ASSIGNMENT_STATUS(id), null, {
    params: { status },
  });
  return res.data;
};