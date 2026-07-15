// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080",  // ← fixed, no /api here
// });

// // Reads the same "auth" blob that authSlice.js writes to localStorage
// // ({ token, role, name, email }) — NOT a separate "token" key.
// function getToken() {
//   try {
//     const auth = JSON.parse(localStorage.getItem("auth") || "null");
//     return auth?.token || null;
//   } catch {
//     return null;
//   }
// }

// api.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("auth"); // ← match the key authSlice actually uses
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;




import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",  // ← fixed, no /api here
});

// Reads the same "auth" blob that authSlice.js writes to sessionStorage
// ({ token, role, name, email }) — NOT a separate "token" key.
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
      sessionStorage.removeItem("auth"); // ← match the key authSlice actually uses
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;