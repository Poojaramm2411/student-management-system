import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { fetchInstructors, addInstructor, editInstructor, removeInstructor, toggleInstructor } from "../../store/Slices/instructorSlice";
import InstructorModal from "../../components/modals/InstructorModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import "../../styles/Table.css";

export default function Instructors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.instructors);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);




  useEffect(() => {
    dispatch(fetchInstructors({ page, size, search }));
  }, [dispatch, page, size, search]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editInstructor({ id: editData.id, data }));
      if (editInstructor.fulfilled.match(result)) toast.success("Instructor updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addInstructor(data));
      if (addInstructor.fulfilled.match(result)) toast.success("Instructor added!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchInstructors({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this instructor?")) return;
    const result = await dispatch(removeInstructor(id));
    if (removeInstructor.fulfilled.match(result)) toast.success("Instructor deleted");
    else toast.error(result.payload);
    dispatch(fetchInstructors({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleInstructor(id));
    dispatch(fetchInstructors({ page, size, search }));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructors</h1>
          <p className="page-subtitle">{totalElements} total instructors</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true); }}>
          <FiPlus /> Add Instructor
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <FiSearch />
          <input className="search-input" placeholder="Search instructors..." value={search} onChange={handleSearch} />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No instructors found</td></tr>
            ) : items.map((ins, i) => (
              <tr key={ins.id}>
                <td className="cell-id">{currentPage * size + i + 1}</td>
                <td className="cell-name">{ins.name}</td>
                <td className="cell-email">{ins.email}</td>
                <td>{ins.phone || "—"}</td>
                <td>{ins.specialization || "—"}</td>
                <td><StatusBadge status={ins.status} onClick={() => handleToggle(ins.id)} /></td>
                <td>
                  <div className="action-cell">
                    <button className="action-btn action-btn-view" onClick={() => navigate("/instructors/" + ins.id, { state: { instructor: ins } })} title="View"><FiEye /></button>
                    <button className="action-btn action-btn-edit" onClick={() => { setEditData(ins); setModalOpen(true); }} title="Edit"><FiEdit2 /></button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(ins.id)} title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalElements={totalElements} size={size} onPageChange={goToPage} />
      </div>

      <InstructorModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} editData={editData} />
    </div>
  );
}