import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import enrollmentService from "../../services/enrollmentService";

// ── Thunks ────────────────────────────────────────────────────
export const fetchEnrollments = createAsyncThunk(
  "enrollment/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await enrollmentService.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch enrollments");
    }
  }
);

export const addEnrollment = createAsyncThunk(
  "enrollment/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await enrollmentService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create enrollment");
    }
  }
);

export const editEnrollment = createAsyncThunk(
  "enrollment/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await enrollmentService.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update enrollment");
    }
  }
);

export const removeEnrollment = createAsyncThunk(
  "enrollment/delete",
  async (id, { rejectWithValue }) => {
    try {
      await enrollmentService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete enrollment");
    }
  }
);

export const fetchEnrollmentDropdowns = createAsyncThunk(
  "enrollment/fetchDropdowns",
  async (_, { rejectWithValue }) => {
    try {
      const [students, courses, batches] = await Promise.all([
        enrollmentService.getAllStudents(),
        enrollmentService.getCourses(),
        enrollmentService.getBatches(),
      ]);
       console.log("Students API:", students.data);
      return {
        students: students.data,
        courses:  courses.data,
        batches:  batches.data,
      };
    } catch {
      return rejectWithValue("Failed to load dropdown data");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────
const enrollmentSlice = createSlice({
  name: "enrollments",
  initialState: {
    items:    [],
    students: [],
    courses:  [],
    batches:  [],
    loading:  false,
    saving:   false,
    error:    null,
  },
  reducers: {
    clearEnrollmentError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending,  (s) => { s.loading = true; s.error = null; })
      .addCase(fetchEnrollments.fulfilled,(s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchEnrollments.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(addEnrollment.pending,  (s) => { s.saving = true; s.error = null; })
      .addCase(addEnrollment.fulfilled,(s, a) => { s.saving = false; s.items.push(a.payload); })
      .addCase(addEnrollment.rejected, (s, a) => { s.saving = false; s.error = a.payload; })

      .addCase(editEnrollment.pending,  (s) => { s.saving = true; s.error = null; })
      .addCase(editEnrollment.fulfilled,(s, a) => {
        s.saving = false;
        s.items = s.items.map(e => e.id === a.payload.id ? a.payload : e);
      })
      .addCase(editEnrollment.rejected, (s, a) => { s.saving = false; s.error = a.payload; })

      .addCase(removeEnrollment.fulfilled, (s, a) => {
        s.items = s.items.filter(e => e.id !== a.payload);
      })

      .addCase(fetchEnrollmentDropdowns.fulfilled, (s, a) => {
        s.students = a.payload.students;
        s.courses  = a.payload.courses;
        s.batches  = a.payload.batches;
      });
  },
});

export const { clearEnrollmentError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;