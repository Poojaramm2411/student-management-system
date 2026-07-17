import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function getToken() {
  try {
    const auth = JSON.parse(sessionStorage.getItem("auth") || "null");
    return auth?.token || null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
