import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as instructorService from "../../services/instructorService";

export const fetchInstructors = createAsyncThunk("instructors/fetchAll", async ({ page = 0, size = 10, search = "", status = "" } = {}, { rejectWithValue }) => {
  try { return await instructorService.getInstructors(page, size, search, status); }
  catch (err) { return rejectWithValue(err.message); }
});

export const addInstructor = createAsyncThunk("instructors/add", async (data, { rejectWithValue }) => {
  try { return await instructorService.createInstructor(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const editInstructor = createAsyncThunk("instructors/edit", async ({ id, data }, { rejectWithValue }) => {
  try { return await instructorService.updateInstructor(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeInstructor = createAsyncThunk("instructors/remove", async (id, { rejectWithValue }) => {
  try { await instructorService.deleteInstructor(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const toggleInstructor = createAsyncThunk("instructors/toggle", async (id, { rejectWithValue }) => {
  try { return await instructorService.toggleInstructorStatus(id); }
  catch (err) { return rejectWithValue(err.message); }
});

const instructorSlice = createSlice({
  name: "instructors",
  initialState: { items: [], totalPages: 0, totalElements: 0, currentPage: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructors.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchInstructors.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchInstructors.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(removeInstructor.fulfilled, (s, a) => { s.items = s.items.filter(x => x.id !== a.payload); })
      .addCase(toggleInstructor.fulfilled, (s, a) => {
        const idx = s.items.findIndex(x => x.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export default instructorSlice.reducer;