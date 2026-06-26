import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { fetchBatches, addBatch, editBatch, removeBatch, toggleBatch } from "../../store/Slices/batchSlice";
import { fetchInstructors } from "../../store/Slices/instructorSlice";
import BatchModal from "../../components/modals/BatchModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import "../../styles/Table.css";

export default function Batches() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.batches);
  const { items: instructors } = useSelector((s) => s.instructors);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Batches</h1>
          <p className="page-subtitle">{totalElements} total batches</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true); }}>
          <FiPlus /> Add Batch
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <FiSearch />
          <input className="search-input" placeholder="Search batches..." value={search} onChange={handleSearch} />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Batch Name</th>
              <th> Batch Code</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No batches found</td></tr>
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
                    <button className="action-btn action-btn-view" onClick={() => navigate("/batches/" + b.id, { state: { batch: b } })} title="View"><FiEye /></button>
                    <button className="action-btn action-btn-edit" onClick={() => { setEditData(b); setModalOpen(true); }} title="Edit"><FiEdit2 /></button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(b.id)} title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalElements={totalElements} size={size} onPageChange={goToPage} />
      </div>

      <BatchModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} editData={editData} instructors={instructors} />
    </div>
  );
}
