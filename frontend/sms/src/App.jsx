import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store/index.jsx";
import theme from "./Theme.jsx";

import ProtectedRoute from "./Routes/Protectedroute.jsx";
import PublicRoute from "./Routes/Publicroute.jsx";
import Layout from "./components/Layout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Batches from "./pages/master/Batches.jsx";
import Students from "./pages/master/Students.jsx";
import Courses from "./pages/master/Courses.jsx";
import Instructors from "./pages/master/Instructors.jsx";
import StudentDetail from "./pages/master/StudentDetail.jsx";
import CourseDetail from "./pages/master/CourseDetail.jsx";
import BatchDetail from "./pages/master/BatchDetail.jsx";
import InstructorDetail from "./pages/master/InstructorDetail.jsx";

import "./styles/Global.css";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />


          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="students"    element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="courses"     element={<Courses />} />
            <Route path="courses/:id"  element={<CourseDetail />} />
            <Route path="batches"     element={<Batches />} />
            <Route path="batches/:id"  element={<BatchDetail />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="instructors/:id" element={<InstructorDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{
            background: "#1c2537",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#e8edf5",
          }}
        />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}