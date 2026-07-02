import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as courseService from "../../services/courseService";

export const fetchCourses = createAsyncThunk("courses/fetchAll", async ({ page = 0, size = 10, search = "", status = "" } = {}, { rejectWithValue }) => {
  try { return await courseService.getCourses(page, size, search, status); }
  catch (err) { return rejectWithValue(err.message); }
});

export const addCourse = createAsyncThunk("courses/add", async (data, { rejectWithValue }) => {
  try { return await courseService.createCourse(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const editCourse = createAsyncThunk("courses/edit", async ({ id, data }, { rejectWithValue }) => {
  try { return await courseService.updateCourse(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeCourse = createAsyncThunk("courses/remove", async (id, { rejectWithValue }) => {
  try { await courseService.deleteCourse(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const toggleCourse = createAsyncThunk("courses/toggle", async (id, { rejectWithValue }) => {
  try { return await courseService.toggleCourseStatus(id); }
  catch (err) { return rejectWithValue(err.message); }
});

const courseSlice = createSlice({
  name: "courses",
  initialState: { items: [], totalPages: 0, totalElements: 0, currentPage: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourses.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(removeCourse.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); })
      .addCase(toggleCourse.fulfilled, (s, a) => {
        const idx = s.items.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export default courseSlice.reducer;