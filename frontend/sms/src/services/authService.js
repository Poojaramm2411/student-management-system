import { API_ENDPOINTS } from "../api/apiconfig";

export async function loginUser(data) {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Login failed");
  
  // ← ADD THIS: save token to localStorage
  if (result.token) {
    localStorage.setItem("token", result.token);
  }

  return result;
}