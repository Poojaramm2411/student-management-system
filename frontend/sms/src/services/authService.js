const API_BASE = "http://localhost:8080/api/auth";
// If you already have a shared axios instance elsewhere (e.g. src/services/api.js),
// swap the fetch calls below for that instance instead — this uses plain fetch
// so it works with zero extra setup.

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res); // { token, role, name, email }
};

export const registerStudent = async (email, password) => {
  const res = await fetch(`${API_BASE}/register/student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res); // { message }
};

export const registerInstructor = async (email, password) => {
  const res = await fetch(`${API_BASE}/register/instructor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res); // { message }
};