import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slices/authSlice";
import batchReducer from "./Slices/batchSlice";
import studentReducer from "./Slices/studentSlice";
import courseReducer from "./Slices/courseSlice";
import instructorReducer from "./Slices/instructorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    batches: batchReducer,
    students: studentReducer,
    courses: courseReducer,
    instructors: instructorReducer,
  },
});