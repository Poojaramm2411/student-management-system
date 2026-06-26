export const API_ENDPOINTS = {
  // ADMIN
  LOGIN:        "/api/admin/login",
  REGISTER:     "/api/admin/register",
  GET_ADMIN:    (email) => `/api/admin/get/${email}`,
  UPDATE_ADMIN: (email) => `/api/admin/update/${email}`,
  DELETE_ADMIN: (email) => `/api/admin/delete/${email}`,

  // STUDENT
  GET_STUDENT:       "/api/students",
  GET_STUDENT_BY_ID: (id) => `/api/students/${id}`,
  POST_STUDENT:      "/api/students",
  UPDATE_STUDENT:    (id) => `/api/students/${id}`,
  DELETE_STUDENT:    (id) => `/api/students/${id}`,
  TOGGLE_STUDENT:    (id) => `/api/students/${id}/status`,

  // COURSE
  GET_COURSE:       "/api/courses",
  GET_COURSE_BY_ID: (id) => `/api/courses/${id}`,
  POST_COURSE:      "/api/courses",
  UPDATE_COURSE:    (id) => `/api/courses/${id}`,
  DELETE_COURSE:    (id) => `/api/courses/${id}`,
  TOGGLE_COURSE:    (id) => `/api/courses/${id}/status`,

  // BATCH
  GET_BATCH:       "/api/batches",
  GET_BATCH_BY_ID: (id) => `/api/batches/${id}`,
  POST_BATCH:      "/api/batches",
  UPDATE_BATCH:    (id) => `/api/batches/${id}`,
  DELETE_BATCH:    (id) => `/api/batches/${id}`,
  TOGGLE_BATCH:    (id) => `/api/batches/${id}/status`,

  // INSTRUCTORS
  GET_INSTRUCTORS:      "/api/instructors",
  GET_INSTRUCTOR_BY_ID: (id) => `/api/instructors/${id}`,
  POST_INSTRUCTOR:      "/api/instructors",
  UPDATE_INSTRUCTOR:    (id) => `/api/instructors/${id}`,
  DELETE_INSTRUCTOR:    (id) => `/api/instructors/${id}`,
  TOGGLE_INSTRUCTOR:    (id) => `/api/instructors/${id}/status`,
};