import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as studentService from "../../services/studentService";

export const fetchStudents = createAsyncThunk("students/fetchAll", async ({ page = 0, size = 10, search = "", status = "", batchId = "" } = {}, { rejectWithValue }) => {
  try { return await studentService.getStudents(page, size, search, status, batchId); }
  catch (err) { return rejectWithValue(err.message); }
});

export const addStudent = createAsyncThunk("students/add", async (data, { rejectWithValue }) => {
  try { return await studentService.createStudent(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const editStudent = createAsyncThunk("students/edit", async ({ id, data }, { rejectWithValue }) => {
  try { return await studentService.updateStudent(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeStudent = createAsyncThunk("students/remove", async (id, { rejectWithValue }) => {
  try { await studentService.deleteStudent(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const toggleStudent = createAsyncThunk("students/toggle", async (id, { rejectWithValue }) => {
  try { return await studentService.toggleStudentStatus(id); }
  catch (err) { return rejectWithValue(err.message); }
});

const studentSlice = createSlice({
  name: "students",
  initialState: { items: [], totalPages: 0, totalElements: 0, currentPage: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStudents.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchStudents.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(removeStudent.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); })
      .addCase(toggleStudent.fulfilled, (s, a) => {
        const idx = s.items.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export default studentSlice.reducer;
