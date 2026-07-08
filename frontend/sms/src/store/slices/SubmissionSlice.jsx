import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as submissionService from "../../services/submissionService";

export const fetchSubmissionsForAssignment = createAsyncThunk(
  "submissions/fetchForAssignment",
  async ({ assignmentId, page, size }, { rejectWithValue }) => {
    try { return await submissionService.getSubmissionsForAssignment(assignmentId, page, size); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const fetchSubmissionsForStudent = createAsyncThunk(
  "submissions/fetchForStudent",
  async ({ studentId, page, size }, { rejectWithValue }) => {
    try { return await submissionService.getSubmissionsForStudent(studentId, page, size); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const submitAssignment = createAsyncThunk(
  "submissions/submit",
  async ({ assignmentId, data }, { rejectWithValue }) => {
    try { return await submissionService.submitAssignment(assignmentId, data); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const gradeSubmission = createAsyncThunk(
  "submissions/grade",
  async ({ id, data }, { rejectWithValue }) => {
    try { return await submissionService.gradeSubmission(id, data); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

const submissionSlice = createSlice({
  name: "submissions",
  initialState: { items: [], totalPages: 0, totalElements: 0, currentPage: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissionsForAssignment.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSubmissionsForAssignment.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchSubmissionsForAssignment.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchSubmissionsForStudent.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSubmissionsForStudent.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchSubmissionsForStudent.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(gradeSubmission.fulfilled, (s, a) => {
        const idx = s.items.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export default submissionSlice.reducer;