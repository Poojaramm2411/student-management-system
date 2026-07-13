import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import batchReducer from "./slices/batchSlice";
import courseReducer from "./slices/courseSlice";
import instructorReducer from "./slices/instructorSlice";
import studentReducer from "./slices/studentSlice";
import enrollmentReducer from "./slices/enrollmentSlice";
import assignmentReducer from "./slices/AssignmentSlice";
import submissionReducer from "./slices/SubmissionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    batches: batchReducer,
    courses: courseReducer,
    instructors: instructorReducer,
    students: studentReducer,
    enrollments: enrollmentReducer,
    assignments: assignmentReducer,
    submissions: submissionReducer,
  },
});

export default store;