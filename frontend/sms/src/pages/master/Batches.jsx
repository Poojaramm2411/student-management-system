import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch, FiDownload, FiUpload } from "react-icons/fi";
import { fetchBatches, addBatch, editBatch, removeBatch, toggleBatch } from "../../store/Slices/batchSlice";
import { fetchInstructors } from "../../store/Slices/instructorSlice";
import BatchModal from "../../components/modals/BatchModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import "../../styles/Table.css";
import { exportData, importData } from "../../services/importExportService";

export default function Batches() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.batches);
  const { items: instructors } = useSelector((s) => s.instructors);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const excelRef = useRef();

  useEffect(() => {
    dispatch(fetchBatches({ page, size, search }));
  }, [dispatch, page, size, search]);

  useEffect(() => {
    dispatch(fetchInstructors({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editBatch({ id: editData.id, data }));
      if (editBatch.fulfilled.match(result)) toast.success("Batch updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addBatch(data));
      if (addBatch.fulfilled.match(result)) toast.success("Batch added!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchBatches({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this batch?")) return;
    const result = await dispatch(removeBatch(id));
    if (removeBatch.fulfilled.match(result)) toast.success("Batch deleted");
    else toast.error(result.payload);
    dispatch(fetchBatches({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleBatch(id));
    dispatch(fetchBatches({ page, size, search }));
  };

  const handleExportPdf = async () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      await exportData("batches", "pdf");
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("PDF export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      await exportData("batches", "excel");
      toast.success("Excel exported successfully!");
    } catch {
      toast.error("Excel export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setShowImportMenu(false);
    try {
      const res = await importData("batches", file);
      toast.success(res?.message || "Imported successfully!");
      dispatch(fetchBatches({ page, size, search }));
    } catch (err) {
      toast.error(err.message || "Import failed. Check file format.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Batches</h1>
          <p className="page-subtitle">{totalElements} total batches</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

          <input ref={excelRef} type="file" accept=".xlsx,.xls"
            onChange={handleImportExcel} style={{ display: "none" }} />

          <div style={{ position: "relative" }}>
            <button
              className="btn"
              disabled={importing}
              onClick={() => { setShowImportMenu(p => !p); setShowExportMenu(false); }}
              style={{
                background: "#F0FDF4", color: "#166534",
                border: "1px solid #86EFAC", padding: "8px 14px",
                borderRadius: 8, cursor: "pointer", display: "flex",
                alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14,
              }}>
              <FiUpload />
              {importing ? "Importing..." : "Import ▾"}
            </button>

            {showImportMenu && (
              <div style={{
                position: "absolute", top: "110%", right: 0, zIndex: 999,
                background: "#fff", borderRadius: 10, minWidth: 200,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                border: "1px solid #E5E7EB", overflow: "hidden",
              }}>
                <div style={{ padding: "6px 12px", fontSize: 11, color: "#9CA3AF",
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Choose format
                </div>
                <hr style={{ margin: 0, borderColor: "#F3F4F6" }} />
                <button onClick={() => { setShowImportMenu(false); excelRef.current.click(); }}
                  style={menuItemStyle}>
                  📊 Import from Excel (.xlsx)
                </button>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              className="btn"
              disabled={exporting}
              onClick={() => { setShowExportMenu(p => !p); setShowImportMenu(false); }}
              style={{
                background: "#EFF6FF", color: "#1D4ED8",
                border: "1px solid #BFDBFE", padding: "8px 14px",
                borderRadius: 8, cursor: "pointer", display: "flex",
                alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14,
              }}>
              <FiDownload />
              {exporting ? "Exporting..." : "Export ▾"}
            </button>

            {showExportMenu && (
              <div style={{
                position: "absolute", top: "110%", right: 0, zIndex: 999,
                background: "#fff", borderRadius: 10, minWidth: 200,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                border: "1px solid #E5E7EB", overflow: "hidden",
              }}>
                <div style={{ padding: "6px 12px", fontSize: 11, color: "#9CA3AF",
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Choose format
                </div>
                <hr style={{ margin: 0, borderColor: "#F3F4F6" }} />
                <button onClick={handleExportPdf} style={menuItemStyle}>
                  📄 Export as PDF
                </button>
                <hr style={{ margin: 0, borderColor: "#F3F4F6" }} />
                <button onClick={handleExportExcel} style={menuItemStyle}>
                  📊 Export as Excel
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-primary"
            onClick={() => { setEditData(null); setModalOpen(true); }}>
            <FiPlus /> Add Batch
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <FiSearch />
          <input className="search-input" placeholder="Search batches..."
            value={search} onChange={handleSearch} />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Batch Name</th>
              <th>Batch Code</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40,
                color: "var(--text-muted)" }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40,
                color: "var(--text-muted)" }}>No batches found</td></tr>
            ) : items.map((b, i) => (
              <tr key={b.id}>
                <td className="cell-id">{page * size + i + 1}</td>
                <td className="cell-name">{b.batchName}</td>
                <td><span className="cell-code">{b.batchCode}</span></td>
                <td>{b.startDate || "—"}</td>
                <td>{b.endDate || "—"}</td>
                <td><StatusBadge status={b.status} onClick={() => handleToggle(b.id)} /></td>
                <td>
                  <div className="action-cell">
                    <button className="action-btn action-btn-view"
                      onClick={() => navigate("/batches/" + b.id, { state: { batch: b } })}
                      title="View"><FiEye /></button>
                    <button className="action-btn action-btn-edit"
                      onClick={() => { setEditData(b); setModalOpen(true); }}
                      title="Edit"><FiEdit2 /></button>
                    <button className="action-btn action-btn-delete"
                      onClick={() => handleDelete(b.id)}
                      title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages}
          totalElements={totalElements} size={size} onPageChange={goToPage} />
      </div>

      <BatchModal isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave} editData={editData} instructors={instructors} />
    </div>
  );
}

const menuItemStyle = {
  width: "100%", padding: "10px 16px", background: "none",
  border: "none", textAlign: "left", cursor: "pointer",
  fontSize: 14, color: "#374151", display: "flex",
  alignItems: "center", gap: 8,
  transition: "background 0.1s",
};