import { configureStore } from "@reduxjs/toolkit";
import authReducer        from "./Slices/authSlice";
import batchReducer       from "./Slices/batchSlice";
import courseReducer      from "./Slices/courseSlice";
import instructorReducer  from "./Slices/instructorSlice";
import studentReducer     from "./Slices/studentSlice";
import enrollmentReducer  from "./Slices/enrollmentSlice";

export const store = configureStore({
  reducer: {
    auth:        authReducer,
    batches:     batchReducer,
    courses:     courseReducer,
    instructors: instructorReducer,
    students:    studentReducer,
    enrollments: enrollmentReducer,
  },
});

export default store;