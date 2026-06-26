import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as batchService from "../../services/batchService";

export const fetchBatches = createAsyncThunk("batches/fetchAll", async ({ page, size, search, status } = {}, { rejectWithValue }) => {
  try { return await batchService.getBatches(page, size, search, status); }
  catch (err) { return rejectWithValue(err.message); }
});

export const addBatch = createAsyncThunk("batches/add", async (data, { rejectWithValue }) => {
  try { return await batchService.createBatch(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const editBatch = createAsyncThunk("batches/edit", async ({ id, data }, { rejectWithValue }) => {
  try { return await batchService.updateBatch(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const removeBatch = createAsyncThunk("batches/remove", async (id, { rejectWithValue }) => {
  try { await batchService.deleteBatch(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const toggleBatch = createAsyncThunk("batches/toggle", async (id, { rejectWithValue }) => {
  try { return await batchService.toggleBatchStatus(id); }
  catch (err) { return rejectWithValue(err.message); }
});

const batchSlice = createSlice({
  name: "batches",
  initialState: { items: [], totalPages: 0, totalElements: 0, currentPage: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBatches.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.content;
        s.totalPages = a.payload.totalPages;
        s.totalElements = a.payload.totalElements;
        s.currentPage = a.payload.currentPage;
      })
      .addCase(fetchBatches.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(removeBatch.fulfilled, (s, a) => { s.items = s.items.filter(b => b.id !== a.payload); })
      .addCase(toggleBatch.fulfilled, (s, a) => {
        const idx = s.items.findIndex(b => b.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export default batchSlice.reducer;