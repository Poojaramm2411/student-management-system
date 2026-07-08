import { createSlice } from "@reduxjs/toolkit";

const stored = JSON.parse(localStorage.getItem("auth") || "null");

const initialState = stored || {
  token: null,
  role: null,   // "ADMIN" | "STUDENT" | "INSTRUCTOR"
  name: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { token, role, name, email } = action.payload;
      state.token = token;
      state.role = role;
      state.name = name;
      state.email = email;
      localStorage.setItem("auth", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.name = null;
      state.email = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;

// Add this to your store config (e.g. src/store/index.js):
//
//   import authReducer from "./Slices/authSlice";
//   export const store = configureStore({
//     reducer: {
//       auth: authReducer,
//       students: studentReducer,
//       ...
//     },
//   });