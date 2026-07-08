import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/apiconfig";

// NOTE: adjust the two import paths above to match your project structure.

export const getSubmissionsForAssignment = async (assignmentId, page = 0, size = 20) => {
  const res = await api.get(API_ENDPOINTS.GET_SUBMISSIONS_FOR_ASSIGNMENT(assignmentId), {
    params: { page, size },
  });
  return {
    content: res.data.content,
    totalPages: res.data.totalPages,
    totalElements: res.data.totalElements,
    currentPage: res.data.number,
  };
};

export const getSubmissionsForStudent = async (studentId, page = 0, size = 20) => {
  const res = await api.get(API_ENDPOINTS.GET_SUBMISSIONS_FOR_STUDENT(studentId), {
    params: { page, size },
  });
  return {
    content: res.data.content,
    totalPages: res.data.totalPages,
    totalElements: res.data.totalElements,
    currentPage: res.data.number,
  };
};

export const getSubmissionById = async (id) => {
  const res = await api.get(API_ENDPOINTS.GET_SUBMISSION_BY_ID(id));
  return res.data;
};

export const submitAssignment = async (assignmentId, data) => {
  const res = await api.post(API_ENDPOINTS.SUBMIT_ASSIGNMENT(assignmentId), data);
  return res.data;
};

export const gradeSubmission = async (id, data) => {
  const res = await api.put(API_ENDPOINTS.GRADE_SUBMISSION(id), data);
  return res.data;
};