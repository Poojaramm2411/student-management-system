import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as assignmentService from "../../services/assignmentService";

export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async ({ page, size, search, status, batchId, instructorId } = {}, { rejectWithValue }) => {
    try { return await assignmentService.getAssignments(page, size, search, status, batchId, instructorId); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const addAssignment = createAsyncThunk("assignments/add", async (data, { rejectWithValue }) => {
  try { return await assignmentService.createAssignment(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const editAssignment = createAsyncThunk("assignments/edit", async ({ id, data }, { rejectWithValue }) => {
  try { return await assignmentService.updateAssignment(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeAssignment = createAsyncThunk("assignments/remove", async (id, { rejectWithValue }) => {
  try { await assignmentService.deleteAssignment(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const changeAssignmentStatus = createAsyncThunk(
  "assignments/changeStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try { return await assignmentService.changeAssignmentStatus(id, status); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

const assignmentSlice = createSlice({
  name: "assignments",
  initialState: { items: [], totalPages: 0, totalElements: 0, currentPage: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAssignments.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchAssignments.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(removeAssignment.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); })
      .addCase(changeAssignmentStatus.fulfilled, (s, a) => {
        const idx = s.items.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export default assignmentSlice.reducer;