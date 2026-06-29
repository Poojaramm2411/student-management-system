// src/services/importExportService.js

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export async function exportData(entity, format) {
  // entity: "students" | "courses" | "batches" | "instructors"
  // format: "excel" | "pdf"
  const res = await fetch(`/api/${entity}/export/${format}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(`Export failed: ${res.status}`);

  const blob = await res.blob();
  const ext = format === "pdf" ? "pdf" : "xlsx";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${entity}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── IMPORT ──────────────────────────────────────────────────────────────────

export async function importData(entity, file) {
  // entity: "students" | "courses" | "batches" | "instructors"
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/${entity}/import`, {
    method: "POST",
    headers: authHeaders(), // no Content-Type — let browser set multipart boundary
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }

  return await res.json(); // { message, count }
}