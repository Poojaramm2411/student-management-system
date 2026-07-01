import api from "../api/axiosInstance";

const BASE = "/api/enrollments";

const enrollmentService = {
  getAll:    ()          => api.get(BASE),
  getById:   (id)        => api.get(`${BASE}/${id}`),
  create:    (data)      => api.post(BASE, data),
  update:    (id, data)  => api.put(`${BASE}/${id}`, data),
  delete:    (id)        => api.delete(`${BASE}/${id}`),
  getReceipt:(id)        => api.get(`${BASE}/${id}/receipt`),

  // dropdown data
  getAllStudents: () => api.get("/api/students/all"),
  getCourses:     () => api.get("/api/courses/all"),
  getBatches:     () => api.get("/api/batches?size=1000"),

  // GST calculator (frontend utility)
  calculateGST: (baseFee) => {
    const base  = Number(baseFee) || 0;
    const gst   = parseFloat((base * 0.18).toFixed(2));
    const sgst  = parseFloat((gst / 2).toFixed(2));
    const cgst  = parseFloat((gst / 2).toFixed(2));
    const total = parseFloat((base + gst).toFixed(2));
    return { base, gst, sgst, cgst, total };
  },
};

export default enrollmentService;