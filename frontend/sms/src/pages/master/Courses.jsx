import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { fetchCourses, addCourse, editCourse, removeCourse, toggleCourse } from "../../store/slices/courseSlice";
import { fetchBatches } from "../../store/slices/batchSlice";
import CourseModal from "../../components/modals/CourseModal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import "../../styles/Table.css";

export default function Courses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPages, totalElements, currentPage, loading } = useSelector((s) => s.courses);
  const { items: batches } = useSelector((s) => s.batches);

  const { page, size, goToPage, reset } = usePagination();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses({ page, size, search }));
  }, [dispatch, page, size, search]);

  useEffect(() => {
    dispatch(fetchBatches({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleSearch = (e) => { setSearch(e.target.value); reset(); };

  const handleSave = async (data) => {
    let result;
    if (editData) {
      result = await dispatch(editCourse({ id: editData.id, data }));
      if (editCourse.fulfilled.match(result)) toast.success("Course updated!");
      else toast.error(result.payload);
    } else {
      result = await dispatch(addCourse(data));
      if (addCourse.fulfilled.match(result)) toast.success("Course created!");
      else toast.error(result.payload);
    }
    setModalOpen(false);
    setEditData(null);
    dispatch(fetchCourses({ page, size, search }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    const result = await dispatch(removeCourse(id));
    if (removeCourse.fulfilled.match(result)) toast.success("Course deleted");
    else toast.error(result.payload);
    dispatch(fetchCourses({ page, size, search }));
  };

  const handleToggle = async (id) => {
    await dispatch(toggleCourse(id));
    dispatch(fetchCourses({ page, size, search }));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">{totalElements} total courses</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true); }}>
          <FiPlus /> Add Course
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <FiSearch />
          <input className="search-input" placeholder="Search courses..." value={search} onChange={handleSearch} />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Course Name</th>
              <th>Code</th>
              <th>Department</th>
              <th>Duration</th>
              <th>Batch</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No courses found</td></tr>
            ) : items.map((c, i) => (
              <tr key={c.id}>
                <td className="cell-id">{currentPage * size + i + 1}</td>
                <td className="cell-name">{c.courseName}</td>
                <td><span className="cell-code">{c.courseCode}</span></td>
                <td>{c.department || "—"}</td>
                <td>{c.duration ? `${c.duration} mo` : "—"}</td>
                <td>{c.batchName || "—"}</td>
                <td><StatusBadge status={c.status} onClick={() => handleToggle(c.id)} /></td>
                <td>
                  <div className="action-cell">
                    <button className="action-btn action-btn-view" onClick={() => navigate("/courses/" + c.id, { state: { course: c } })} title="View"><FiEye /></button>
                    <button className="action-btn action-btn-edit" onClick={() => { setEditData(c); setModalOpen(true); }} title="Edit"><FiEdit2 /></button>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(c.id)} title="Delete"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalElements={totalElements} size={size} onPageChange={goToPage} />
      </div>

      <CourseModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} editData={editData} batches={batches} />
    </div>
  );
}