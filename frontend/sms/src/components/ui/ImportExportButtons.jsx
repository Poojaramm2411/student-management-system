// src/components/ui/ImportExportButtons.jsx
import { useRef, useState } from "react";
import { FiDownload, FiUpload, FiFileText, FiGrid } from "react-icons/fi";
import { toast } from "react-toastify";
import { exportData, importData } from "../../services/importExportService";

/**
 * Drop-in component for any list page.
 *
 * Usage:
 *   <ImportExportButtons entity="students" onImportSuccess={() => dispatch(fetchStudents(...))} />
 *   <ImportExportButtons entity="courses"  onImportSuccess={() => dispatch(fetchCourses(...))} />
 *   <ImportExportButtons entity="batches"  onImportSuccess={() => dispatch(fetchBatches(...))} />
 *   <ImportExportButtons entity="instructors" onImportSuccess={() => dispatch(fetchInstructors(...))} />
 */
export default function ImportExportButtons({ entity, onImportSuccess }) {
  const fileInputRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    setDropdownOpen(false);
    try {
      await exportData(entity, format);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Only .xlsx, .xls or .csv files allowed");
      return;
    }
    setImporting(true);
    try {
      const result = await importData(entity, file);
      toast.success(result.message || `Imported ${result.count} records`);
      onImportSuccess?.();
    } catch (e) {
      toast.error(e.message || "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>

      {/* ── Import button ── */}
      <button
        className="btn btn-secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        title="Import Excel or CSV"
      >
        <FiUpload />
        {importing ? "Importing..." : "Import"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleImport}
      />

      {/* ── Export dropdown ── */}
      <div style={{ position: "relative" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setDropdownOpen((v) => !v)}
          disabled={exporting}
          title="Export data"
        >
          <FiDownload />
          {exporting ? "Exporting..." : "Export"}
        </button>

        {dropdownOpen && (
          <>
            {/* backdrop to close on outside click */}
            <div
              style={{ position: "fixed", inset: 0, zIndex: 99 }}
              onClick={() => setDropdownOpen(false)}
            />
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "#fff",
              border: "1px solid #e5e7f0",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              zIndex: 100,
              minWidth: 160,
              overflow: "hidden",
            }}>
              <button
                onClick={() => handleExport("excel")}
                style={dropItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f4f6fb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FiGrid style={{ color: "#16a34a" }} />
                Export Excel
              </button>
              <button
                onClick={() => handleExport("pdf")}
                style={dropItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f4f6fb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FiFileText style={{ color: "#e11d48" }} />
                Export PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const dropItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "10px 16px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 13.5,
  fontFamily: "Outfit, sans-serif",
  color: "#374151",
  textAlign: "left",
};